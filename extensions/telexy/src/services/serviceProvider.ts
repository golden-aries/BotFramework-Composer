import path from 'path';
import { IFetch, ILogger, ISettings, LogLevel } from '../common/interfaces';
import { IConfiguration } from '../configuration/abstractions';
import { JsonConfiguration } from '../configuration/jsonConfiguration';
import { TelexyFsClientSync } from '../fsClient/TelexyFsClientSync';
import { TelexyStorageSync } from '../fsClient/telexyStorageSync';
import { ConsoleLogger } from '../log/logger';
import os from 'os';

export let settings: ISettings;
export let logger: ILogger;
let telexyFsClientSync: TelexyFsClientSync;

export async function initServices() {
  await initSettings();
  logger = new ConsoleLogger(settings);
  initTelexyFsClientSync();
  logger.logTrace('Telexy Services Initialized');
}

function defaultSettings(): ISettings {
  return {
    baseUrl: 'http://localhost',
    apiKey: '',
    logLevel: LogLevel.Warning,
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

export async function initSettings(): Promise<ISettings> {
  return settings ?? (settings = await getConfiguration().getSettings());
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
    super(telexyFsClientSync, logger);
    logger.logTrace('Telexy Storage Created!');
  }
}
