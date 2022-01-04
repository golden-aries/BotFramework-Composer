import { UserIdentity } from '@botframework-composer/types';
import { IBlobRootContent } from '../common/iFileSystemContentInterfaces';
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

  async getBots(): Promise<IBlobRootContent> {
    try {
      const url = this._getBotsUrl();
      const init = this._getBotsRequestOptionsBuilder().buildRequestInit();
      const response = await this._http.fetch(url, init);
      const json = await response.text();
      const result = JSON.parse(json);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async checkBot(path: string): Promise<boolean> {
    try {
      const url = this._checkBotUrl(path);
      const init = this._checkBotRequestOptionsBuilder().buildRequestInit();
      const response = await this._http.fetch(url, init);
      const json = await response.text();
      const result = JSON.parse(json);
      return result;
    } catch (err) {
      throw err;
    }
  }

  private _getBotsUrl(): RequestInfo {
    return this._getTargetUrl('BotProviderBfcApi', 'getBots');
  }

  private _checkBotUrl(name: string): RequestInfo {
    return this._getTargetUrl('BotProviderBfcApi', 'checkBot', { name: name });
  }

  private _getBotsRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie).withHeader_Accept_ApplicationJson();
  }

  private _checkBotRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
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
