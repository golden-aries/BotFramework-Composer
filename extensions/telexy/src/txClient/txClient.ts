import { UserIdentity } from '@botframework-composer/types';
import { ISettings } from '../common/interfaces';

export class TxClient {
  /**
   *
   */
  constructor(private _setting: ISettings) {}

  async checkBlob(storageId: string, filePath: string, user?: UserIdentity): Promise<boolean> {
    return Promise.resolve(true);
  }
}
