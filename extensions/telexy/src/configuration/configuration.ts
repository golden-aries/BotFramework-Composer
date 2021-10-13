import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { isTelexyBotComposerExtensionSettings, ITelexyBotComposerExtensionSettings } from '../common/interfaces';

export interface IConfiguration {
  getSettings(): Promise<ITelexyBotComposerExtensionSettings>;
}

export class Configuration implements IConfiguration {
  _cachedSettings: Promise<ITelexyBotComposerExtensionSettings> | undefined;

  async getSettings(): Promise<ITelexyBotComposerExtensionSettings> {
    return this._cachedSettings ? this._cachedSettings : await this._getSettings();
  }

  private async _getSettings(): Promise<ITelexyBotComposerExtensionSettings> {
    const fileName = this.configurationFileName;
    try {
      const content = await fs.readFile(fileName);
      const obj = JSON.parse(content.toString());
      if (isTelexyBotComposerExtensionSettings(obj)) {
        return obj;
      }
    } catch (err) {
      // ignore errors
    }
    return Configuration.defaultSettings;
  }

  /** returns storage file name from the settings or default one*/
  get configurationFileName(): string {
    return process.env.telexyBotComposerConfig || this.defaultConfigurationFileName;
  }

  /** returns default (hard coded) storage file name */
  get defaultConfigurationFileName(): string {
    const result = path.join(os.homedir(), '.telexy', 'botFrameworkComposerConfig.json');
    return result;
  }

  static defaultSettings: ITelexyBotComposerExtensionSettings = {
    cloudUrl: 'http::/localhost',
    apiKey: '',
    logTrace: true,
  };
}

export const configuration: IConfiguration = new Configuration();
