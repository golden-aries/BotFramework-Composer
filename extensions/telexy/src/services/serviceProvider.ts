import path from 'path';
import { IFetch, ILogger, IPathConvertor, IProfiler, ISettings, LogLevel } from '../common/interfaces';
import { IConfiguration } from '../configuration/abstractions';
import { JsonConfiguration } from '../configuration/jsonConfiguration';
import { TelexyFsClientSync } from '../fsClient/TelexyFsClientSync';
import { TelexyStorageSync } from '../fsClient/telexyStorageSync';
import { ConsoleLogger } from '../log/logger';
import os from 'os';
import { PathConvertor } from '../fsClient/pathConvertor';
import { Profiler } from '../common/profiler';
import { IBotProjectService } from '../common/iBotProjectService';
import { TelexyBotProjectService } from './telexyBotProjectService';
import {
  DialogSetting,
  PublishPlugin,
  IExtensionRegistration,
  IBotProject,
  UserIdentity,
} from '@botframework-composer/types';
import { PublishConfig, TelexyPublisher } from '../publish/telexyPublish';
import originalStorageService from '../../../../Composer/packages/server/build/services/storage';
import { IStorageService } from '../common/iStorageService';
import { TelexyStorageService } from './telexyStorageService';

let settings: ISettings;
let logger: ILogger;
let pathConvertor: IPathConvertor;
let profiler: IProfiler;
let botProjectService: IBotProjectService;
let telexyFsClientSync: TelexyFsClientSync;
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
  botProjectService = new TelexyBotProjectService(logger, profiler);
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

export function initTelexyFsClientSync(): TelexyFsClientSync {
  return telexyFsClientSync ?? (telexyFsClientSync = new TelexyFsClientSync(settings, getFetch(), logger));
}

export class Storage extends TelexyStorageSync {
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
