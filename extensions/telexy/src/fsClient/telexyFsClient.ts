import { ISettings } from '../common/interfaces';
import { IFetch } from '../common/interfaces';
import { CMFusionFSDataSourceClient } from './telexyFs';
export class TelexyFsClient extends CMFusionFSDataSourceClient {
  constructor(settings: ISettings, http: IFetch) {
    super(settings, http);
  }
}
