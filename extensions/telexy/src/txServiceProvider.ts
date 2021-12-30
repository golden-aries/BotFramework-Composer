import path from 'path';
import { IFetch, ILogger, IPathConvertor, IProfiler, ISettings, LogLevel } from './common/interfaces';
import { IConfiguration } from './configuration/abstractions';
import { JsonConfiguration } from './configuration/jsonConfiguration';
import { TxFsClientSync } from './txClient/txFsClientSync';
import { TxStorageSync } from './storage/txStorageSync';
import { ConsoleLogger } from './log/txLogger';
import os from 'os';
import { PathConvertor } from './txClient/pathConvertor';
import { Profiler } from './common/txProfiler';
import { IBotProjectService } from './common/iBotProjectService';
import { TxBotProjectService } from './services/txBotProjectService';
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

let settings: ISettings;
let logger: ILogger;
let pathConvertor: IPathConvertor;
let profiler: IProfiler;
let botProjectService: IBotProjectService;
let telexyFsClientSync: TxFsClientSync;
let publisher: PublishPlugin<PublishConfig>;
let storageService: IStorageService;

/**
 * @param botsFolder - botsFolder as configured in Composer
 */
export async function initServices(botsFolder: string) {
  await initSettings(botsFolder);

  pathConvertor = new PathConvertor(settings.botsFolder);
  logger = new ConsoleLogger(settings);
  profiler = new Profiler(settings, logger);
  initTelexyFsClientSync();
  botProjectService = new TxBotProjectService(logger, profiler);
  storageService = new TelexyStorageService(originalStorageService, logger, profiler);
  logger.logTrace('Telexy Services Initialized');
}

function defaultSettings(): ISettings {
  return {
    baseUrl: 'http://localhost',
    apiKey: '',
    keyCookie: '',
    logLevel: LogLevel.Warning,
    botsFolder: os.homedir(),
    performanceProfiling: false,
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

export async function initSettings(botsFolder: string): Promise<ISettings> {
  const finalSettings = settings ?? (settings = await getConfiguration().getSettings());
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
