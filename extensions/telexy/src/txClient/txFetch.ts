import { IFetch, ILogger } from '../common/interfaces';

/**
 * Wraps WHATWG Fetch API
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * this module uses package
 * https://www.npmjs.com/package/isomorphic-fetch
 * which implemnts WHATWG Fetch API in nodejs
 */
export class TxFetch implements IFetch {
  constructor(private _http: IFetch, private _logger: ILogger) {
    if (!_http) {
      throw new Error('Constructor argument "http" is falsy');
    }
    if (!_logger) {
      throw new Error('Constructor argument "logger" is falsy');
    }
  }

  async fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    try {
      const response = await this._http.fetch(url, init);
      if (!response.ok) {
      } else if (response.headers.has('fusionerror')) {
        const err = await response.json();
        throw err;
      }
      return response;
    } catch (err) {
      this._logger.logError('%s %o', this, err);
      throw err;
    }
  }

  toString() {
    return 'TxFetch';
  }
}
