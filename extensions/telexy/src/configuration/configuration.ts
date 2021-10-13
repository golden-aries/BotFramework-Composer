import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { ITelexySettings } from '../common/interfaces';
import merge from 'lodash/merge';

export interface IConfiguration {
  getSettings(): Promise<ITelexySettings>;
}

export class Configuration implements IConfiguration {
  // _cachedSettings: Promise<ITelexyBotComposerExtensionSettings> | undefined;

  async getSettings(): Promise<ITelexySettings> {
    //return this._cachedSettings ? this._cachedSettings : await this._getSettings();
    return this._getSettings();
  }

  private async _getSettings(): Promise<ITelexySettings> {
    const fileName = this.configurationFileName;
    try {
      const content = await fs.readFile(fileName);
      const obj = JSON.parse(content.toString());
      const result = merge<ITelexySettings, ITelexySettings>(Configuration.defaultSettings, obj);
      return result;
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

  static get defaultSettings(): ITelexySettings {
    return {
      cloudUrl: 'http::/localhost',
      apiKey: '',
      logTrace: true,
    };
  }
}

export const configuration: IConfiguration = new Configuration();
