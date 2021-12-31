import path from 'path';
import { IFetch, ILogger, IPathConvertor, IProfiler, ISettings, LogLevel } from './common/interfaces';
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
import { TxBotProjectService } from './services/txBotProjectService';
import * as lodash from 'lodash';
import {
  DialogSetting,
  PublishPlugin,
  IExtensionRegistration,
  IBotProject,
  UserIdentity,
} from '@botframework-composer/types';
import { PublishConfig, TelexyPublisher } from './publish/txPublish';
import originalStorageService from '../../../Composer/packages/server/build/services/storage';
import { IStorageService } from './common/iStorageService';
import { TelexyStorageService } from './services/txStorageService';
import { ITxServerInfo } from './common/iTxServerInfo';
import { ITxClient } from './common/iTxClient';
import { TxClient } from './txClient/txClient';

let settings: ISettings;
let logger: ILogger;
let pathConvertor: IPathConvertor;
let profiler: IProfiler;
let botProjectService: IBotProjectService;
let telexyFsClientSync: TxFsClientSync;
let publisher: PublishPlugin<PublishConfig>;
let storageService: IStorageService;
let serverInfo: ITxServerInfo;
let txClient: ITxClient;

/**
 * @param botsFolder - botsFolder as configured in Composer
 */
export async function initServices(botsFolder: string) {
  settings = await initSettings(botsFolder);
  pathConvertor = new PathConvertor(settings.botsFolder);
  logger = new ConsoleLogger(settings);
  profiler = new Profiler(settings, logger);
  initTelexyFsClientSync();
  botProjectService = new TxBotProjectService(logger, profiler);
  serverInfo = await initTxServerInfo(settings);
  txClient = initTxClient(serverInfo);
  storageService = new TelexyStorageService(originalStorageService, logger, profiler);
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

let _cachedFetch: IFetch;
function getFetch(): IFetch {
  return _cachedFetch ?? (_cachedFetch = { fetch: fetch });
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
  return (publisher = publisher ?? new TelexyPublisher(registration, logger, profiler));
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

function initTxClient(serverInfo: ITxServerInfo) {
  return new TxClient(serverInfo);
}

export function getTxClient() {
  if (txClient) {
    return txClient;
  }
  throw new Error('Telexy Client has not been initialized!');
}
