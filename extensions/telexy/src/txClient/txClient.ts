import { UserIdentity } from '@botframework-composer/types';
import { ITxClient } from '../common/iTxClient';
import { ITxServerInfo } from '../common/iTxServerInfo';

export class TxClient implements ITxClient {
  /**
   *
   */
  constructor(private _serverInfo: ITxServerInfo) {}

  async checkBlob(storageId: string, filePath: string, user?: UserIdentity): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Constructs string url from parameters
   * @param controller
   * @param action
   * @param query
   */
  getTargetUrl(controller: string, action: string, query?: { [key: string]: string }): string {
    let queryStr = '';
    if (query) {
      Object.keys(query).forEach((key: string) => {
        if (queryStr) {
          queryStr = `${queryStr}&${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
        } else {
          queryStr = `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
        }
      });
      queryStr = `?${queryStr}`;
    }
    return `${this._serverInfo.uri}(@${this._serverInfo.sessionId})/${controller}/${encodeURIComponent(
      action
    )}${queryStr}`;
  }
}
