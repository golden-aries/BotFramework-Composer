import { ILogger, ISettings, IFetch } from '../common/interfaces';
import { CMFusionFSDataSourceClient } from './telexyFsTypes';
export class TelexyFsClient extends CMFusionFSDataSourceClient {
  constructor(settings: ISettings, http: IFetch, logger: ILogger) {
    super(settings, http, logger);
  }
}
