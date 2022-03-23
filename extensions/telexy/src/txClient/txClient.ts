import archiver from 'archiver';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { IFetch } from '../common/iFetch';
import { IBlobFolderContentRaw } from '../common/iFileSystemContentInterfaces';
import { INodeFetch } from '../common/iNodeFetch';
import { ILogger, IProfiler } from '../common/interfaces';
import { ITxClient } from '../common/iTxClient';
import { ITxServerInfo } from '../common/iTxServerInfo';
import { SessionCookieExtractor } from './sessionCookieExtractor';
import { TxClientRequestOptionsBuilder } from './txClientRequestOptionsBuilder';
export class TxClient implements ITxClient {
  toString(): string {
    return 'TxClient';
  }

  /**
   *
   */
  constructor(
    private _serverInfo: ITxServerInfo,
    private _http: IFetch,
    private _nodeFetch: INodeFetch,
    private _logger: ILogger,
    private _profiler: IProfiler,
    private _sessionCookie: string
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
  }

  /**
   * builds and returns a url for a setBotContent
   * @param name bot's name
   * */
  private _setBotContentUrl(name: string): string {
    return this._getApiTargetUrl('BotProviderBfcApi', 'setBotContent', { name: name });
  }

  /** creates and returns options builder for setBotContent */
  private _setBotContentRequestOptionsBuilder(stream: NodeJS.ReadableStream): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie)
      .withHeader_ContentType_Octet()
      .useMethod_Put()
      .withBodyStream(stream);
  }

  private _setBotContentName: string = 'setBotContent';

  /** @inheritdoc */
  setBotContent(name: string, dir: string): Promise<void> {
    this._logger.logTrace('Starting %s.%s Bot: %s Dir: %s', this, this._setBotContentName, name, dir);
    const zip = archiver('zip', { zlib: { level: 9 } });
    return new Promise(async (resolve, reject) => {
      const url = this._setBotContentUrl(name);
      const stream = zip.directory(dir, false).on('error', (err) => reject(err));
      this._logger.logTrace(
        '%s.%s Sending zipped directory %s content to %s ',
        this,
        this._setBotContentName,
        dir,
        url
      );
      const responsePromise = this._nodeFetch.fetch(
        url,
        this._setBotContentRequestOptionsBuilder(stream).buildNodeFetchRequestInit()
      );
      await zip.finalize();
      this._logger.logTrace(
        '%s.%s Directory %s content zipping finished for %s ',
        this,
        this._setBotContentName,
        dir,
        url
      );
      try {
        const resp = await responsePromise;
        this._logger.logTrace(
          '%s.%s Server response %s for bot content at %s ',
          this,
          this._setBotContentName,
          resp.status,
          url
        );
        resolve();
      } catch (err) {
        this._logger.logTrace('%s.%s Failed to set bot content at %s!\n\r%s ', this, this._setBotContentName, url, err);
        reject(err);
      }
    });
  }
  async getBots(): Promise<IBlobFolderContentRaw> {
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

  /** @inheritdoc */
  async getBotContent(name: string): Promise<string> {
    let tempDir: string | undefined;
    let tempFile: string | undefined;

    try {
      const url = this._getBotContentUrl(name);
      const init = this._getBotContentRequestOptionsBuilder().buildRequestInit();
      const response = await this._http.fetch(url, init);
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'TelexyBfc'));
      tempFile = path.join(tempDir, `${name}.zip`);
      const buf = await response.arrayBuffer();
      await fs.writeFile(tempFile, new Uint8Array(buf));
      return tempFile;
    } catch (err) {
      if (tempDir) {
        if (tempDir) {
          await fs.rmdir(tempDir);
        }
      }
      throw err;
    }
  }

  /** @inheritdoc */
  async resetBot(name: string): Promise<void> {
    try {
      const url = this._resetBotUrl(name);
      const init = this._resetBotRequestOptionsBuilder().buildRequestInit();
      await this._http.fetch(url, init);
    } catch (err) {
      throw err;
    }
  }

  private _resetBotUrl(name: string): RequestInfo {
    return this._getMvcTargetUrl('Bot', 'resetBotByName', { botName: name });
  }

  private _getBotsUrl(): RequestInfo {
    return this._getApiTargetUrl('BotProviderBfcApi', 'getBots');
  }

  private _getBotContentUrl(name: string): RequestInfo {
    return this._getMvcTargetUrl('BotProviderBfc', 'getBotContent', { name: name });
  }

  private _checkBotUrl(name: string): RequestInfo {
    return this._getApiTargetUrl('BotProviderBfcApi', 'checkBot', { name: name });
  }

  private _getBotsRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie).withHeader_Accept_ApplicationJson();
  }

  private _checkBotRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie).withHeader_Accept_ApplicationJson();
  }
  private _getBotContentRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie).withHeader_Accept_ApplicationOctetStream();
  }

  private _resetBotRequestOptionsBuilder(): TxClientRequestOptionsBuilder {
    return new TxClientRequestOptionsBuilder(this._sessionCookie).useMethod_Put();
  }

  /**
   * Constructs string url from parameters
   * @param controller
   * @param action
   * @param query
   */
  _getApiTargetUrl(controller: string, action: string, query?: { [key: string]: string }): string {
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
    return `${this._serverInfo.uri}(@${this._serverInfo.sessionId})/api/${controller}/${encodeURIComponent(
      action
    )}${queryStr}`;
  }

  /**
   * Constructs string url from parameters
   * @param controller
   * @param action
   * @param query
   */
  _getMvcTargetUrl(controller: string, action: string, query?: { [key: string]: string }): string {
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
