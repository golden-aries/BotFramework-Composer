import fs from 'fs/promises';
import merge from 'lodash/merge';
import { ISettings } from '../common/interfaces';
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
    const fileName = this.path;
    try {
      const content = await fs.readFile(fileName);
      const obj = JSON.parse(content.toString());
      const result = merge<ISettings, ISettings>(this.defaultSetting, obj);
      return result;
    } catch (err) {
      // ignore errors
    }
    return this.defaultSetting;
  }
}
