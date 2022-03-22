import { IExtensionRegistration, PublishPlugin } from '@botframework-composer/types';
import fs from 'fs/promises';
import * as lodash from 'lodash';
import os from 'os';
import path from 'path';
import originalStorageService from '../../../Composer/packages/server/build/services/storage';
import { IBotProjectService } from './common/iBotProjectService';
import { IFetch } from './common/iFetch';
import { IFileStorage } from './common/iFileStorage';
import { INodeFetch } from './common/iNodeFetch';
import { ILogger, IPathConvertor, IProfiler, ISettings, LogLevel } from './common/interfaces';
import { IRuntime } from './common/iRuntime';
import { ISignalrClient } from './common/iSignalrClient';
import { IStorageService } from './common/iStorageService';
import { ITxClient } from './common/iTxClient';
import { ITxServerInfo } from './common/iTxServerInfo';
import { TxBotProjectEx } from './common/txBotProjectEx';
import { TxPath } from './common/txPath';
import { Profiler } from './common/txProfiler';
import { IConfiguration } from './configuration/abstractions';
import { JsonConfiguration } from './configuration/jsonConfiguration';
import { ConsoleLogger } from './log/txLogger';
import { TxPublish } from './publish/txPublish';
import { PublishConfig } from './publish/txPublishLocalOriginal';
import { TxProjectService } from './services/txProjectService';
import { TxRuntimeService } from './services/txRuntimeService';
import { TxRuntimeServiceOriginal } from './services/txRuntimeServiceOriginal';
import { TxStorageService } from './services/txStorageService';
import { TxLocalStorage } from './storage/txLocalStorage';
import { TxStorageSync } from './storage/txStorageSync';
import { PathConvertor } from './txClient/pathConvertor';
import { SessionCookieExtractor } from './txClient/sessionCookieExtractor';
import { SignalrClientFactory } from './txClient/signalrClientFactory';
import { TxClient } from './txClient/txClient';
import { TxFetch } from './txClient/txFetch';
import { TxFsClientSync } from './txClient/txFsClientSync';
import { TxNodeFetch } from './txClient/txNodeFetch';

let settings: ISettings;
let logger: ILogger;
let cachedFetch: IFetch;
let pathConvertor: IPathConvertor;
let profiler: IProfiler;
let botProjectService: IBotProjectService;
let telexyFsClientSync: TxFsClientSync;
let storageService: IStorageService;
let serverInfo: ITxServerInfo;
let txClient: ITxClient;
let txPath: TxPath;
let cache: IFileStorage;
let nodeFetch: INodeFetch;
let runtime: IRuntime;
let publish: PublishPlugin<PublishConfig>;
let sessionCookie: string;
let signalrClient: ISignalrClient;
let txBotProjectEx: TxBotProjectEx;

/**
 * @param botsFolder - botsFolder as configured in Composer
 */
export async function initServices(botsFolder: string, registration: IExtensionRegistration) {
  settings = await initSettings(botsFolder);
  txPath = new TxPath();
  cache = new TxLocalStorage();
  txBotProjectEx = new TxBotProjectEx(getSettings().botsFolder, getTxPath());
  pathConvertor = new PathConvertor(getSettings().botsFolder);
  logger = new ConsoleLogger(getSettings());
  cachedFetch = new TxFetch({ fetch: fetch }, getLogger());
  nodeFetch = new TxNodeFetch();
  profiler = new Profiler(getSettings(), getLogger());
  initTelexyFsClientSync();
  serverInfo = await initTxServerInfo(getSettings());
  sessionCookie = SessionCookieExtractor.getSessionCookie(serverInfo);
  txClient = new TxClient(serverInfo, getFetch(), getNodeFetch(), getLogger(), getProfiler(), sessionCookie);

  //runtime = new TxRuntimeServiceOriginal(getLogger());
  runtime = new TxRuntimeService(
    getSettings(),
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
    getProfiler()
  );
  //botProjectService = new TxProjectServiceProxy(getLogger(), getProfier());

  storageService = new TxStorageService(
    getTxClient(),
    botsFolder,
    getTxPath(),
    originalStorageService,
    getLogger(),
    getProfiler()
  );

  // storageService = new TxStorageServiceProxy(
  //   originalStorageService,
  //   getLogger(),
  //   getProfier()
  // );

  publish = new TxPublish(registration, getTxBotProjectEx(), getSettings(), getTxClient(), getLogger(), getProfiler());

  //publish = new TxPublishLocalOriginal(registration, logger, profiler);

  //signalrClient = await new SignalrClientFactory(serverInfo.uri, ['BotHub'], sessionCookie).getSignalrClient();

  logger.logTrace('Telexy Services Initialized');

  logger.logTrace('Using settings: %o', getSettings());
}

function defaultSettings(): ISettings {
  return {
    cloudBaseUrl: 'http://localhost:5102',
    apiKey: '',
    logLevel: LogLevel.Warning,
    botsFolder: os.homedir(),
    performanceProfiling: false,
    bfcServerCatalog: 'bfcServerCatalog.json',
    telexyBotForwarderPath: 'D:\\src\\telexy\\TelexyBotForwarder',
    composerBaseUrl: 'http://localhost',
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

function getProfiler(): IProfiler {
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

export function getPublisher(): PublishPlugin<PublishConfig> {
  if (publish) {
    return publish;
  }
  throw new Error('Telexy Publish Service is not initialized!');
}

async function initTxServerInfo(settings: ISettings): Promise<ITxServerInfo> {
  const filePath = path.join(os.homedir(), '.telexy', settings.bfcServerCatalog);
  const buf = await fs.readFile(filePath);
  const arr = JSON.parse(buf.toString()) as [string, ITxServerInfo][];
  const result = arr.find((value) => areEqUri(value[1].uri, settings.cloudBaseUrl));
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

export function getSignalrClient(): ISignalrClient {
  if (signalrClient) {
    return signalrClient;
  }
  throw new Error('Telexy signalr client has not been initialized!');
}

export function getTxBotProjectEx(): TxBotProjectEx {
  if (txBotProjectEx) {
    return txBotProjectEx;
  }
  throw new Error('Telexy signalr client has not been initialized!');
}
