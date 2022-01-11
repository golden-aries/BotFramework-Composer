import { IncomingHttpHeaders } from 'http';
import syncRequest, { Options, Response } from 'sync-request';
import { ILogger, ISettings } from '../common/interfaces';
import { ApiException, ResultIsNotABooleanValueException, TxExistsOperationError } from '../exceptions/txExceptions';
import { CMFusionFSItemWrapper, FileStat, IGlobParametersWrapper } from './txFsTypes';
import { TxFsClient } from './txFsClient';
import _ from 'lodash';
import { IFetch } from '../common/iFetch';

export class TxFsClientSync extends TxFsClient {
  /**
   *
   */
  constructor(settings: ISettings, fetch: IFetch, logger: ILogger) {
    super(settings, fetch, logger);
  }

  private syncPost(url: string, options: Options): Options | Response {
    return syncRequest('POST', url, options);
  }

  private getString(response: Response | Options): string {
    return (response as Response).getBody('utf8');
  }

  private parseResponseJson(response: Response | Options): any {
    const json = this.getString(response);
    return JSON.parse(json);
  }

  statSync(path: string): FileStat {
    const response = this.syncPost(this.getStatUrl(path), this.getStatOptionsBuilder().buildSyncOptions());
    return this.processStatSync(<Response>response);
  }

  private processStatSync(response: Response): FileStat {
    const statusCode = response.statusCode;
    if (statusCode !== 200) {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
    const result = this.parseResponseJson(response);
    return FileStat.fromJS(result);
  }

  readFileSync(path: string): string {
    const response = this.syncPost(this.getReadFileUrl(path), this.getReadFileOptionsBuilder().buildSyncOptions());
    return this.processReadFileSync(<Response>response);
  }

  private processReadFileSync(response: Response): string {
    const statusCode = response.statusCode;
    if (statusCode !== 200) {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
    const result = this.getString(response);
    return result;
  }

  existsSync(path: string): boolean {
    const response = this.syncPost(this.getExistsUrl(path), this.getExistsOptonsBuilder().buildSyncOptions());
    return this.processExistsSync(<Response>response);
  }

  private processExistsSync(response: Response): boolean {
    const statusCode = response.statusCode;
    if (statusCode !== 200) {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
    const obj = this.parseResponseJson(response);
    if (_.isBoolean(obj)) {
      return obj;
    }
    throw new ResultIsNotABooleanValueException('API call existsSync returned wrong result!');
  }

  browseSync(path: string): CMFusionFSItemWrapper {
    const response = this.syncPost(this.getBrowseUrl(path), this.getBrowseOptionsBuilder().buildSyncOptions());
    return this.processBrowseSync(<Response>response);
  }

  private processBrowseSync(response: Response): CMFusionFSItemWrapper {
    const statusCode = response.statusCode;
    if (statusCode !== 200) {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
    const obj = this.parseResponseJson(response);
    const result = CMFusionFSItemWrapper.fromJS(obj);
    return result;
  }

  writeFileSync(model: CMFusionFSItemWrapper): void {
    const response = this.syncPost(this.getWriteFileUrl(), this.getWriteFileOptionsBuilder(model).buildSyncOptions());
    this.processWriteFileSync(<Response>response);
  }

  private processWriteFileSync(response: Response): void {
    const statusCode = response.statusCode;
    if (statusCode !== 200) {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
  }

  globSync(globParameters: IGlobParametersWrapper): string[] {
    const response = this.syncPost(this.getGlobUrl(), this.getGlobOptionsBuilder(globParameters).buildSyncOptions());
    return this.processGlobSync(<Response>response);
  }

  private processGlobSync(response: Response): string[] {
    const statusCode = response.statusCode;
    if (statusCode === 200) {
      const json = this.getString(response);
      return this.processGlobJson(json);
    } else {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
  }

  createSync(model: CMFusionFSItemWrapper, includeContent?: boolean, bytes?: boolean): CMFusionFSItemWrapper {
    const response = this.syncPost(
      this.getCreateUrl(includeContent, bytes),
      this.getCreateOptionsBuilder(model).buildSyncOptions()
    );

    return this.processCreateSync(<Response>response);
  }

  private processCreateSync(response: Response): CMFusionFSItemWrapper {
    const statusCode = response.statusCode;
    if (statusCode === 200) {
      const json = response.getBody('utf8');
      return CMFusionFSItemWrapper.fromJS(JSON.parse(json));
    } else {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
  }

  createDirectoryRecursiveSync(path: string): FileStat {
    const response = this.syncPost(
      this.getCreateDirectoryRecursiveUrl(path),
      this.getCreateDirectoryRecursiveOptionsBuilder().buildSyncOptions()
    );
    return this.processCreateDirectoryRecursiveSync(<Response>response);
  }

  private processCreateDirectoryRecursiveSync(response: Response): FileStat {
    const statusCode = response.statusCode;
    if (statusCode === 200) {
      const json = response.getBody('utf8');
      return FileStat.fromJS(JSON.parse(json));
    } else {
      return throwException('An unexpected server error occurred.', statusCode, '', response.headers);
    }
  }
}

function throwException(
  message: string,
  status: number,
  response: string,
  headers: IncomingHttpHeaders,
  result?: any
): any {
  if (result !== null && result !== undefined) throw result;
  else throw new ApiException(message, status, response, headers, null);
}
