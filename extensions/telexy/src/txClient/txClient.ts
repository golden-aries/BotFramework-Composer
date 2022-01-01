import { UserIdentity } from '@botframework-composer/types';
import { IFetch, ILogger, IProfiler } from '../common/interfaces';
import { ITxClient } from '../common/iTxClient';
import { ITxServerInfo } from '../common/iTxServerInfo';
import { TxClientRequestOptionsBuilder } from './txClientRequestOptionsBuilder';

export class TxClient implements ITxClient {
  private _sessionCookie: string = '';
  /**
   *
   */
  constructor(
    private _serverInfo: ITxServerInfo,
    private _http: IFetch,
    private _logger: ILogger,
    private _profiler: IProfiler
  ) {
    if (!_serverInfo) {
      throw new Error('Constructor argument "serverInfo" is falsy');
    }
    if (!_http) {
      throw new Error('Constructor argument "http" is falsy');
    }
    if (!_logger) {
      throw new Error('Constructor argument "logger" is falsy');
    }
    if (!_profiler) {
      throw new Error('Constructor argument "profiler" is falsy');
    }
    this._initSessionCookie();
  }

  /**
   * converts session cookie which is a sring in json format
   * into a string of name/value pairs divided by semicolon
   *  */
  private _initSessionCookie() {
    let cookie: [{ name: string; value: string }];
    try {
      const cookieStr = this._serverInfo.sessionCookie;
      cookie = <[{ name: string; value: string }]>JSON.parse(cookieStr);
    } catch {
      throw new Error(`${this}: Cookie is not in JSON parseable format!`);
    }
    cookie.forEach((element, index) => {
      if (index === 0) {
        this._sessionCookie += `${element.name}=${element.value}`;
      } else {
        this._sessionCookie += `; ${element.name}=${element.value}`;
      }
    });
  }

  async checkBlob(path: string, user?: UserIdentity): Promise<boolean> {
    return Promise.resolve(true);
  }

  async getBlob(path: string, user?: UserIdentity): Promise<string> {
    try {
      const url = this._getBlobUrl(path);
      const init = this._getBlobRequestOptionsBuilder().buildRequestInit();
      const response = await this._http.fetch(url, init);
      const result = await response.text();
      return result;
    } catch (err) {
      throw err;
    }
  }

  private _getBlobUrl(path: string): RequestInfo {
    return this._getTargetUrl('BotProviderBfcApi', 'getBots'); //{ path: path }
  }

  private _getBlobRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie).withHeader_Accept_ApplicationJson();
  }

  /**
   * Constructs string url from parameters
   * @param controller
   * @param action
   * @param query
   */
  _getTargetUrl(controller: string, action: string, query?: { [key: string]: string }): string {
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
    //`${this._serverInfo.uri}/api/${controller}/${encodeURIComponent(action)}${queryStr}`;
    //`${this._serverInfo.uri}(@${this._serverInfo.sessionId})/${controller}/${encodeURIComponent(action)}${queryStr}`;
    return `${this._serverInfo.uri}(@${this._serverInfo.sessionId})/api/${controller}/${encodeURIComponent(
      action
    )}${queryStr}`;
  }
}
