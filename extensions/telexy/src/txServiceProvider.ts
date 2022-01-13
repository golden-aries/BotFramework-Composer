import path from 'path';
import { ILogger, IPathConvertor, IProfiler, ISettings, LogLevel } from './common/interfaces';
import { IConfiguration } from './configuration/abstractions';
import { JsonConfiguration } from './configuration/jsonConfiguration';
import { TxFsClientSync } from './txClient/txFsClientSync';
import { TxStorageSync } from './storage/txStorageSync';
import { ConsoleLogger } from './log/txLogger';
import os from 'os';
import fs from 'fs/promises';
import { PathConvertor } from './txClient/pathConvertor';
import { Profiler } from './common/txProfiler';
import { IBotProjectService } from './common/iBotProjectService';
import { TxProjectServiceProxy } from './services/txProjectServiceProxy';
import * as lodash from 'lodash';
import {
  DialogSetting,
  PublishPlugin,
  IExtensionRegistration,
  IBotProject,
  UserIdentity,
} from '@botframework-composer/types';
import { PublishConfig, TxPublishLocalOriginal } from './publish/txPublishLocalOriginal';
import originalStorageService from '../../../Composer/packages/server/build/services/storage';
import { IStorageService } from './common/iStorageService';
import { TxStorageServiceProxy } from './services/txStorageServiceProxy';
import { ITxServerInfo } from './common/iTxServerInfo';
import { ITxClient } from './common/iTxClient';
import { TxClient } from './txClient/txClient';
import { TxFetch } from './txClient/txFetch';
import { TxStorageService } from './services/txStorageService';
import { TxPath } from './common/txPath';
import { TxProjectService } from './services/txProjectService';
import { TxLocalStorage } from './storage/txLocalStorage';
import { IFileStorage } from './common/iFileStorage';
import { IFetch } from './common/iFetch';
import { INodeFetch } from './common/iNodeFetch';
import { TxNodeFetch } from './txClient/txNodeFetch';
import { IRuntime } from './common/iRuntime';
import { TxRuntimeServiceOriginal } from './services/txRuntimeServiceOriginal';
import { TxRuntimeService } from './services/txRuntimeService';

let settings: ISettings;
let logger: ILogger;
let cachedFetch: IFetch;
let pathConvertor: IPathConvertor;
let profiler: IProfiler;
let botProjectService: IBotProjectService;
let telexyFsClientSync: TxFsClientSync;
let publisher: PublishPlugin<PublishConfig>;
let storageService: IStorageService;
let serverInfo: ITxServerInfo;
let txClient: ITxClient;
let txPath: TxPath;
let cache: IFileStorage;
let nodeFetch: INodeFetch;
let runtime: IRuntime;

/**
 * @param botsFolder - botsFolder as configured in Composer
 */
export async function initServices(botsFolder: string) {
  settings = await initSettings(botsFolder);
  txPath = new TxPath();
  cache = new TxLocalStorage();
  pathConvertor = new PathConvertor(getSettings().botsFolder);
  logger = new ConsoleLogger(getSettings());
  cachedFetch = new TxFetch({ fetch: fetch }, getLogger());
  nodeFetch = new TxNodeFetch();
  profiler = new Profiler(getSettings(), getLogger());
  initTelexyFsClientSync();
  serverInfo = await initTxServerInfo(getSettings());
  txClient = new TxClient(serverInfo, getFetch(), getNodeFetch(), getLogger(), getProfier());
  //runtime = new TxRuntimeServiceOriginal(getLogger());
  runtime = new TxRuntimeService(
    botsFolder,
    getTxClient(),
    getTxPath(),
    new TxRuntimeServiceOriginal(getLogger()),
    getLogger()
  );

  botProjectService = new TxProjectService(
    getTxClient(),
    getTxPath(),
    getSettings().botsFolder,
    getCache(),
    getLogger(),
    getProfier()
  );
  //botProjectService = new TxProjectServiceProxy(getLogger(), getProfier());

  storageService = new TxStorageService(
    getTxClient(),
    botsFolder,
    getTxPath(),
    originalStorageService,
    getLogger(),
    getProfier()
  );
  // storageService = new TxStorageServiceProxy(
  //   originalStorageService,
  //   getLogger(),
  //   getProfier()
  // );

  logger.logTrace('Telexy Services Initialized');
}

function defaultSettings(): ISettings {
  return {
    baseUrl: 'http://localhost',
    apiKey: '',
    logLevel: LogLevel.Warning,
    botsFolder: os.homedir(),
    performanceProfiling: false,
    bfcServerCatalog: 'bfcServerCatalog.json',
  };
}

/** returns default (hard coded) storage file name */
function defaultConfigurationFileName(): string {
  const result = path.join(os.homedir(), '.telexy', 'botFrameworkComposerConfig.json');
  return result;
}

/** returns storage file name from the settings or default one*/
function getConfigurationFileName(): string {
  return process.env.MyFancyConfig || defaultConfigurationFileName();
}

let configuration: IConfiguration | undefined = undefined;
export function getConfiguration(): IConfiguration {
  return configuration ?? (configuration = new JsonConfiguration(getConfigurationFileName(), defaultSettings()));
}

async function initSettings(botsFolder: string): Promise<ISettings> {
  const finalSettings = await getConfiguration().getSettings();
  finalSettings.botsFolder = botsFolder;
  return finalSettings;
}

function getFetch(): IFetch {
  if (!cachedFetch) {
    throw new Error('Fetch is not initialized');
  }
  return cachedFetch;
}

function getNodeFetch(): INodeFetch {
  if (!nodeFetch) {
    throw new Error('Fetch is not initialized');
  }
  return nodeFetch;
}

function getLogger(): ILogger {
  if (!logger) {
    throw new Error('Logger is not initialized');
  }
  return logger;
}

function getProfier(): IProfiler {
  if (!profiler) {
    throw new Error('Profiler is not initialized');
  }
  return profiler;
}

export function initTelexyFsClientSync(): TxFsClientSync {
  return telexyFsClientSync ?? (telexyFsClientSync = new TxFsClientSync(settings, getFetch(), logger));
}

class TxStorageWrapper extends TxStorageSync {
  /**
   *
   */
  constructor() {
    super(telexyFsClientSync, logger, pathConvertor, profiler);
    logger.logTrace('Telexy Storage Created!');
  }
}

export function getBotProjectService(): IBotProjectService {
  return botProjectService;
}

export function getPublisher(registration: IExtensionRegistration): PublishPlugin<PublishConfig> {
  return (publisher = publisher ?? new TxPublishLocalOriginal(registration, logger, profiler));
}

async function initTxServerInfo(settings: ISettings): Promise<ITxServerInfo> {
  const filePath = path.join(os.homedir(), '.telexy', settings.bfcServerCatalog);
  const buf = await fs.readFile(filePath);
  const arr = JSON.parse(buf.toString()) as [string, ITxServerInfo][];
  const result = arr.find((value) => areEqUri(value[1].uri, settings.baseUrl));
  if (!result) {
    throw new Error('Telexy Server Info is not found!');
  }
  return result[1];
}

function areEqUri(lhsUri: string, rhsUri: string): boolean {
  return normalizeUri(lhsUri) === normalizeUri(rhsUri);
}

function normalizeUri(uri: string) {
  return lodash.trimEnd(uri.toLowerCase(), '/');
}

export function getTxClient(): ITxClient {
  if (txClient) {
    return txClient;
  }
  throw new Error('Telexy Client has not been initialized!');
}
function getSettings(): ISettings {
  if (settings) {
    return settings;
  }
  throw new Error('Telexy settings has not been initialized!');
}
function getPathConvertor(): IPathConvertor {
  if (pathConvertor) {
    return pathConvertor;
  }
  throw new Error('Telexy path convertor has not been initialized!');
}
function getTxPath(): TxPath {
  if (txPath) {
    return txPath;
  }
  throw new Error('Telexy txPath class has not been initialized!');
}

function getCache(): IFileStorage {
  if (cache) {
    return cache;
  }
  throw new Error('Telexy cache storage has not been initialized!');
}

export function getRuntime(): IRuntime {
  if (runtime) {
    return runtime;
  }
  throw new Error('Telexy runtime has not been initialized!');
}
