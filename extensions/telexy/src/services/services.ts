import { ILogger, ITelexySettings } from '../common/interfaces';
import { configuration } from '../configuration/configuration';
import { Logger } from '../log/logger';

export let settings: ITelexySettings;
export let logger: ILogger;

export async function initServices() {
  settings = await configuration.getSettings();
  logger = new Logger(settings);
  logger.logTrace('Telexy Services Initialized');
}
