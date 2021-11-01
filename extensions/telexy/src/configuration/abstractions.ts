import { ISettings } from '../common/interfaces';

export interface IConfiguration {
  getSettings(): Promise<ISettings>;
}
