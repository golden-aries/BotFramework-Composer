import { ILogger, ISettings, IFetch } from '../common/interfaces';
import { CMFusionFSDataSourceClient } from './txFsTypes';
export class TxFsClient extends CMFusionFSDataSourceClient {
  constructor(settings: ISettings, http: IFetch, logger: ILogger) {
    super(settings, http, logger);
  }
}
