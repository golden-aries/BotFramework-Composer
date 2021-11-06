import path from 'path';
import { IFetch, ILogger, IPathConvertor, ISettings, LogLevel } from '../common/interfaces';
import { IConfiguration } from '../configuration/abstractions';
import { JsonConfiguration } from '../configuration/jsonConfiguration';
import { TelexyFsClientSync } from '../fsClient/TelexyFsClientSync';
import { TelexyStorageSync } from '../fsClient/telexyStorageSync';
import { ConsoleLogger } from '../log/logger';
import os from 'os';
import { PathConvertor } from '../fsClient/pathConvertor';

export let settings: ISettings;
export let logger: ILogger;
export let pathConvertor: IPathConvertor;
let telexyFsClientSync: TelexyFsClientSync;

/**
 * @param botsFolder - botsFolder as configured in Composer
 */
export async function initServices(botsFolder: string) {
  await initSettings(botsFolder);
  pathConvertor = new PathConvertor(settings.botsFolder);
  logger = new ConsoleLogger(settings);
  initTelexyFsClientSync();
  logger.logTrace('Telexy Services Initialized');
}

function defaultSettings(): ISettings {
  return {
    baseUrl: 'http://localhost',
    apiKey: '',
    logLevel: LogLevel.Warning,
    botsFolder: os.homedir(),
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
    super(telexyFsClientSync, logger, pathConvertor);
    logger.logTrace('Telexy Storage Created!');
  }
}
