import fs from 'fs/promises';
import { isString } from 'lodash';
import merge from 'lodash/merge';
import { ISettings, LogLevel } from '../common/interfaces';
import { UnableToLoadConfiguration, UnknownError } from '../exceptions/telexyExceptions';
import { IConfiguration } from './abstractions';

export class JsonConfiguration implements IConfiguration {
  /**
   *
   */
  constructor(private path: string, private defaultSetting: ISettings) {}

  async getSettings(): Promise<ISettings> {
    return this._getSettings();
  }

  private async _getSettings(): Promise<ISettings> {
    try {
      const fileName = this.path;
      const content = await fs.readFile(fileName);
      const obj = JSON.parse(content.toString());
      if (isString(obj.logLevel)) {
        obj.logLevel = LogLevel[obj.logLevel];
        if (obj.logLevel === undefined) {
          throw new UnknownError('Unknown LogLevel!');
        }
      }
      const result = merge<ISettings, ISettings>(this.defaultSetting, obj);
      return result;
    } catch (err) {
      throw new UnableToLoadConfiguration(err, 'Unable to load configuration from json file!', { fileName: this.path });
    }
  }
}
