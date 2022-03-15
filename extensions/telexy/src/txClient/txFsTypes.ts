/* tslint:disable */
/* eslint-disable */
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.13.2.0 (NJsonSchema v10.5.2.0 (Newtonsoft.Json v12.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------
// ReSharper disable InconsistentNaming

import _ from 'lodash';
import { IFetch } from '../common/iFetch';
import { ILogger, ISettings } from '../common/interfaces';
import { ApiException, ResultIsNotABooleanValueException } from '../exceptions/txExceptions';
import { RequestOptionsBuilder } from './requestOptionsBuilder';

export class CMFusionFSDataSourceClient {
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;
  baseUrl: string;

  constructor(protected settings: ISettings, protected http: IFetch, protected logger: ILogger) {
    this.http = http ? http : <any>window;
    this.baseUrl = settings.cloudBaseUrl;
  }

  protected getBuilder() {
    return new RequestOptionsBuilder(this.settings.apiKey);
  }

  private _getUrl(path: string, actionUrl: string): string {
    let url = this.baseUrl + actionUrl;
    if (!path) {
      throw new Error("The parameter 'path' is expected.");
    }
    url += 'path=' + encodeURIComponent('' + path);
    return url;
  }

  protected getFileExistsUrl(path: string): string {
    return this._getUrl(path, '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/FileExists?');
  }

  protected getFileExistsOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_ContentType_ApplicationJson();
  }

  async fileExists(path: string): Promise<boolean> {
    const response = await this.http.fetch(
      this.getFileExistsUrl(path),
      this.getFileExistsOptionsBuilder().buildRequestInit()
    );
    return await this.processFileExists(response);
  }

  protected async processFileExists(response: Response): Promise<boolean> {
    const status = response.status;
    let headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      const result = JSON.parse(json, this.jsonParseReviver);
      return result;
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getDirectoryExistsUrl(path: string): string {
    return this._getUrl(path, '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/DirectoryExists?');
  }
  protected getDirectoryExistsOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_Accept_ApplicationJson();
  }

  async directoryExists(path: string): Promise<boolean> {
    const _response = await this.http.fetch(
      this.getDirectoryExistsUrl(path),
      this.getDirectoryExistsOptionsBuilder().buildRequestInit()
    );
    return await this.processDirectoryExists(_response);
  }

  protected async processDirectoryExists(response: Response): Promise<boolean> {
    const status = response.status;
    let _headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      const result = JSON.parse(json, this.jsonParseReviver);
      return result;
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, _headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, _headers);
      }
    }
  }

  protected getStatUrl(path: string): string {
    const url = this._getUrl(path, '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Stat?');
    return url;
  }

  private _getHeaders(response: Response): any {
    let headers: any = {};
    if (response.headers && response.headers.forEach) {
      response.headers.forEach((v: any, k: any) => (headers[k] = v));
    }
    return headers;
  }

  protected getStatOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_Accept_ApplicationJson();
  }

  async stat(path: string): Promise<FileStat> {
    const url = this.getStatUrl(path);
    const reqInit = this.getStatOptionsBuilder().buildRequestInit();
    const response = await this.http.fetch(url, reqInit);
    const result = await this.processStat(response);
    return result;
  }

  protected async processStat(response: Response): Promise<FileStat> {
    const status = response.status;
    const headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      const obj = JSON.parse(json, this.jsonParseReviver);
      return FileStat.fromJS(obj);
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getReadFileUrl(path: string): string {
    return this._getUrl(path, '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/ReadFile?');
  }

  protected getReadFileOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_Accept_ApplicationOctetStream();
  }

  async readFile(path: string): Promise<FileResponse> {
    const response = await this.http.fetch(
      this.getReadFileUrl(path),
      this.getReadFileOptionsBuilder().buildRequestInit()
    );

    return this.processReadFile(response);
  }

  protected async processReadFile(response: Response): Promise<FileResponse> {
    const status = response.status;
    const headers = this._getHeaders(response);

    if (status === 200) {
      const contentDisposition = response.headers ? response.headers.get('content-disposition') : undefined;
      const fileNameMatch = contentDisposition ? /filename="?([^"]*?)"?(;|$)/g.exec(contentDisposition) : undefined;
      const fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[1] : undefined;
      const blob = await response.blob();
      return { fileName: fileName, data: blob, status: status, headers: headers };
    } else {
      try {
        const errror = await response.text();
        return throwException('An unexpected server error occurred.', status, errror, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  private addQuery(url: string, path: string, includeContent?: boolean, bytes?: boolean) {
    let result = url + 'path=' + encodeURIComponent('' + path) + '&';
    return this._addQuery(result, includeContent, bytes);
  }

  private _addQuery(url: string, includeContent?: boolean, bytes?: boolean): string {
    let result = url;
    if (includeContent) {
      url += 'includeContent=true&';
    }
    if (bytes) {
      url += 'bytes=true&';
    }
    url = url.replace(/[?&]$/, '');
    return result;
  }

  protected getBrowseUrl(path: string, includeContent?: boolean, bytes?: boolean): string {
    let url = this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Browse?';
    return this.addQuery(url, path, includeContent, bytes);
  }

  protected getBrowseOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_Accept_ApplicationJson();
  }

  async browse(path: string, includeContent?: boolean, bytes?: boolean): Promise<CMFusionFSItemWrapper> {
    const response = await this.http.fetch(
      this.getBrowseUrl(path, includeContent, bytes),
      this.getBrowseOptionsBuilder().buildRequestInit()
    );
    return this.processBrowse(response);
  }

  protected async processBrowse(response: Response): Promise<CMFusionFSItemWrapper> {
    const status = response.status;
    const _headers = this._getHeaders(response);
    try {
      if (status === 200) {
        const json = await response.text();
        const obj = JSON.parse(json, this.jsonParseReviver);
        const result = CMFusionFSItemWrapper.fromJS(obj);
        return result;
      } else {
        const responseText = await response.text();
        return throwException('An unexpected server error occurred.', status, responseText, _headers);
      }
    } catch (err) {
      return throwException('An unexpected server error occurred.', status, response?.statusText, _headers);
    }
  }
  protected getExistsUrl(path: string): string {
    const url =
      this.baseUrl +
      '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Exists?' +
      'path=' +
      encodeURIComponent('' + path);
    return url;
  }

  protected getExistsOptonsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_Accept_ApplicationJson();
  }

  async exists(path: string): Promise<boolean> {
    const response = await this.http.fetch(
      this.getExistsUrl(path),
      this.getFileExistsOptionsBuilder().buildRequestInit()
    );
    return await this.processExists(response);
  }

  protected async processExists(response: Response): Promise<boolean> {
    const status = response.status;
    let headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      const obj = JSON.parse(json, this.jsonParseReviver);
      if (_.isBoolean(obj)) {
        return obj;
      } else {
        throw new ResultIsNotABooleanValueException('API call exists returned wrong result!');
      }
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred during exists API call.', status, error, headers);
      } catch {
        return throwException(
          'An unexpected server error occurred during exists API call.',
          status,
          response.statusText,
          headers
        );
      }
    }
  }

  protected getSaveUrl(includeContent?: boolean, bytes?: boolean): string {
    let url = this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Save?';
    return this._addQuery(url, includeContent, bytes);
  }

  protected getSaveOptonsBuilder(model: CMFusionFSItemWrapper): RequestOptionsBuilder {
    const content = JSON.stringify(model);
    return this.getBuilder()
      .withBody(content)
      .withHeader_ContentType_ApplicationJson()
      .withHeader_Accept_ApplicationJson();
  }

  async save(model: CMFusionFSItemWrapper, includeContent?: boolean, bytes?: boolean): Promise<CMFusionFSItemWrapper> {
    const response = await this.http.fetch(
      this.getSaveUrl(includeContent, bytes),
      this.getSaveOptonsBuilder(model).buildRequestInit()
    );
    return await this.processSave(response);
  }

  protected async processSave(response: Response): Promise<CMFusionFSItemWrapper> {
    const status = response.status;
    let headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      const obj = JSON.parse(json, this.jsonParseReviver);
      return CMFusionFSItemWrapper.fromJS(obj);
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getCreateUrl(includeContent?: boolean, bytes?: boolean): string {
    let url = this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Create?';
    return this._addQuery(url, includeContent, bytes);
  }

  protected getCreateOptionsBuilder(model: CMFusionFSItemWrapper): RequestOptionsBuilder {
    const content = JSON.stringify(model);
    return this.getBuilder()
      .withBody(content)
      .withHeader_ContentType_ApplicationJson()
      .withHeader_Accept_ApplicationJson();
  }

  async create(
    model: CMFusionFSItemWrapper,
    includeContent?: boolean,
    bytes?: boolean
  ): Promise<CMFusionFSItemWrapper> {
    const response = await this.http.fetch(
      this.getCreateUrl(includeContent, bytes),
      this.getCreateOptionsBuilder(model).buildRequestInit()
    );
    return await this.processCreate(response);
  }

  protected async processCreate(response: Response): Promise<CMFusionFSItemWrapper> {
    const status = response.status;
    let headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      const obj = JSON.parse(json, this.jsonParseReviver);
      return CMFusionFSItemWrapper.fromJS(obj);
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getDeleteUrl() {
    return this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Delete';
  }

  protected getDeleteOptionsBuilder(model: CMFusionFSItemWrapper): RequestOptionsBuilder {
    const content = JSON.stringify(model);
    return this.getBuilder().useMethod_Delete().withHeader_ContentType_ApplicationJson().withBody(content);
  }

  async delete(model: CMFusionFSItemWrapper): Promise<void> {
    const requestInit = this.getDeleteOptionsBuilder(model).buildRequestInit();
    const response = await this.http.fetch(this.getDeleteUrl(), requestInit);
    return await this.processDelete(response);
  }

  protected async processDelete(response: Response): Promise<void> {
    const status = response.status;
    let headers = this._getHeaders(response);
    if (status === 200) {
      return;
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getMoveUrl(oldPath: string, newPath: string): string {
    let url = this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Move?';
    if (!oldPath) throw new Error("The parameter 'oldPath' must be defined.");
    else url += 'oldPath=' + encodeURIComponent('' + oldPath) + '&';

    if (!newPath) throw new Error("The parameter 'newPath' must be defined.");
    else url += 'newPath=' + encodeURIComponent('' + newPath) + '&';

    url = url.replace(/[?&]$/, '');
    return url;
  }

  protected getMoveOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder();
  }

  async move(oldPath: string, newPath: string): Promise<void> {
    const response = await this.http.fetch(
      this.getMoveUrl(oldPath, newPath),
      this.getMoveOptionsBuilder().buildRequestInit()
    );
    return this.processMove(response);
  }

  protected async processMove(response: Response): Promise<void> {
    const status = response.status;
    let _headers: any = {};
    if (response.headers && response.headers.forEach) {
      response.headers.forEach((v: any, k: any) => (_headers[k] = v));
    }
    if (status === 200) {
      await response.text();
    } else {
      try {
        const responseText = await response.text();
        return throwException('An unexpected server error occurred.', status, responseText, _headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, _headers);
      }
    }
  }

  protected getWriteFileUrl(): string {
    return this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/WriteFile';
  }

  protected getWriteFileOptionsBuilder(model: CMFusionFSItemWrapper): RequestOptionsBuilder {
    const content = JSON.stringify(model);
    return this.getBuilder()
      .withBody(content)
      .withHeader_ContentType_ApplicationJson()
      .withHeader_Accept_ApplicationJson();
  }

  async writeFile(model: CMFusionFSItemWrapper): Promise<CMFusionFSItemWrapper> {
    const _response = await this.http.fetch(
      this.getWriteFileUrl(),
      this.getWriteFileOptionsBuilder(model).buildRequestInit()
    );
    return await this.processWriteFile(_response);
  }

  protected async processWriteFile(response: Response): Promise<CMFusionFSItemWrapper> {
    const status = response.status;
    let headers = this._getHeaders(response);
    if (status === 200) {
      const _responseText = await response.text();
      const obj = JSON.parse(_responseText, this.jsonParseReviver);
      return CMFusionFSItemWrapper.fromJS(obj);
    } else {
      try {
        const error = await response.text();
        return throwException('An unexpected server error occurred.', status, error, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getGlobUrl(): string {
    return this.baseUrl + '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/Glob';
  }

  protected getGlobOptionsBuilder(globParameters: IGlobParametersWrapper): RequestOptionsBuilder {
    const content = JSON.stringify(globParameters);
    return this.getBuilder()
      .withHeader_ContentType_ApplicationJson()
      .withHeader_Accept_ApplicationJson()
      .withBody(content);
  }

  async glob(globParameters: IGlobParametersWrapper): Promise<string[]> {
    const response = await this.http.fetch(
      this.getGlobUrl(),
      this.getGlobOptionsBuilder(globParameters).buildRequestInit()
    );
    return await this.processGlob(response);
  }

  protected processGlobJson(json: string): string[] {
    const obj = JSON.parse(json, this.jsonParseReviver);
    return <string[]>obj;
  }

  protected async processGlob(response: Response): Promise<string[]> {
    const status = response.status;
    const headers = this._getHeaders(response);
    if (status === 200) {
      const json = await response.text();
      return this.processGlobJson(json);
    } else {
      try {
        const err = await response.text();
        return throwException('An unexpected server error occurred.', status, err, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }

  protected getCreateDirectoryRecursiveUrl(path: string): string {
    if (!path) {
      throw new Error("The parameter 'path' must be provided.");
    }
    const url =
      this.baseUrl +
      '/FusionBusApi/e6161e69-5a7f-4e22-855b-cf5c974fe8d4/CreateDirectoryRecursive?path=' +
      encodeURIComponent('' + path);
    return url;
  }

  protected getCreateDirectoryRecursiveOptionsBuilder(): RequestOptionsBuilder {
    return this.getBuilder().withHeader_ContentType_ApplicationJson().withHeader_Accept_ApplicationJson();
  }

  async createDirectoryRecursive(path: string) {
    const url = this.getCreateDirectoryRecursiveUrl(path);
    const reqInit = this.getCreateDirectoryRecursiveOptionsBuilder().buildRequestInit();
    const response = await this.http.fetch(url, reqInit);
    await this.processCreateDirectoryRecursive(response);
  }

  protected async processCreateDirectoryRecursive(response: Response): Promise<void> {
    const status = response.status;
    const headers = this._getHeaders(response);
    if (status !== 200) {
      try {
        const err = await response.text();
        return throwException('An unexpected server error occurred.', status, err, headers);
      } catch {
        return throwException('An unexpected server error occurred.', status, response.statusText, headers);
      }
    }
  }
}

export class FileStat implements IFileStat {
  isDir?: boolean;
  size?: number;
  created?: Date;
  modified?: Date;
  id?: number;

  constructor(data?: IFileStat) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property)) (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.isDir = _data['isDir'];
      this.size = _data['size'];
      this.created = _data['created'] ? new Date(_data['created'].toString()) : <any>undefined;
      this.modified = _data['modified'] ? new Date(_data['modified'].toString()) : <any>undefined;
      this.id = _data['id'];
    }
  }

  static fromJS(data: any): FileStat {
    data = typeof data === 'object' ? data : {};
    let result = new FileStat();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['isDir'] = this.isDir;
    data['size'] = this.size;
    data['created'] = this.created ? this.created.toISOString() : <any>undefined;
    data['modified'] = this.modified ? this.modified.toISOString() : <any>undefined;
    data['id'] = this.id;
    return data;
  }
}

export interface IFileStat {
  isDir?: boolean;
  size?: number;
  created?: Date;
  modified?: Date;
  id?: number;
}

export abstract class MarshalByRefObject implements IMarshalByRefObject {
  constructor(data?: IMarshalByRefObject) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property)) (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {}

  static fromJS(data: any): MarshalByRefObject {
    data = typeof data === 'object' ? data : {};
    throw new Error("The abstract class 'MarshalByRefObject' cannot be instantiated.");
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    return data;
  }
}

export interface IMarshalByRefObject {}

export class FusionGlobalIdentifiable extends MarshalByRefObject implements IFusionGlobalIdentifiable {
  uid?: string;

  constructor(data?: IFusionGlobalIdentifiable) {
    super(data);
  }

  init(_data?: any) {
    super.init(_data);
    if (_data) {
      this.uid = _data['Uid'];
    }
  }

  static fromJS(data: any): FusionGlobalIdentifiable {
    data = typeof data === 'object' ? data : {};
    let result = new FusionGlobalIdentifiable();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['Uid'] = this.uid;
    super.toJSON(data);
    return data;
  }
}

export interface IFusionGlobalIdentifiable extends IMarshalByRefObject {
  uid?: string;
}

export class FusionEntity extends FusionGlobalIdentifiable implements IFusionEntity {
  name?: string | undefined;
  description?: string | undefined;

  constructor(data?: IFusionEntity) {
    super(data);
  }

  init(_data?: any) {
    super.init(_data);
    if (_data) {
      this.name = _data['Name'];
      this.description = _data['Description'];
    }
  }

  static fromJS(data: any): FusionEntity {
    data = typeof data === 'object' ? data : {};
    let result = new FusionEntity();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['Name'] = this.name;
    data['Description'] = this.description;
    super.toJSON(data);
    return data;
  }
}

export interface IFusionEntity extends IFusionGlobalIdentifiable {
  name?: string | undefined;
  description?: string | undefined;
}

export class FusionEntityTable extends FusionEntity implements IFusionEntityTable {
  id?: number;
  created?: Date;

  constructor(data?: IFusionEntityTable) {
    super(data);
  }

  init(_data?: any) {
    super.init(_data);
    if (_data) {
      this.id = _data['Id'];
      this.created = _data['Created'] ? new Date(_data['Created'].toString()) : <any>undefined;
    }
  }

  static fromJS(data: any): FusionEntityTable {
    data = typeof data === 'object' ? data : {};
    let result = new FusionEntityTable();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['Id'] = this.id;
    data['Created'] = this.created ? this.created.toISOString() : <any>undefined;
    super.toJSON(data);
    return data;
  }
}

export interface IFusionEntityTable extends IFusionEntity {
  id?: number;
  created?: Date;
}

export class CMFusionFSItemWrapper extends FusionEntityTable implements ICMFusionFSItemWrapper {
  isFolder?: boolean;
  path?: string | undefined;
  parentPath?: string | undefined;
  byteContent?: string | undefined;
  stringContent?: string | undefined;
  createdString?: string | undefined;
  children?: CMFusionFSItemWrapper[] | undefined;
  id?: number;
  created?: Date;

  constructor(data?: ICMFusionFSItemWrapper) {
    super(data);
  }

  init(_data?: any) {
    super.init(_data);
    if (_data) {
      this.isFolder = _data['IsFolder'];
      this.path = _data['Path'];
      this.parentPath = _data['ParentPath'];
      this.byteContent = _data['ByteContent'];
      this.stringContent = _data['StringContent'];
      this.createdString = _data['CreatedString'];
      this.id = _data['Id'];
      this.created = _data['Created'];
      this.uid = _data['Uid'];
      if (Array.isArray(_data['Children'])) {
        this.children = [] as any;
        for (let item of _data['Children']) this.children!.push(CMFusionFSItemWrapper.fromJS(item));
      }
    }
  }

  static fromJS(data: any): CMFusionFSItemWrapper {
    data = typeof data === 'object' ? data : {};
    let result = new CMFusionFSItemWrapper();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['IsFolder'] = this.isFolder;
    data['Path'] = this.path;
    data['ParentPath'] = this.parentPath;
    data['ByteContent'] = this.byteContent;
    data['StringContent'] = this.stringContent;
    data['CreatedString'] = this.createdString;
    if (Array.isArray(this.children)) {
      data['Children'] = [];
      for (let item of this.children) data['Children'].push(item.toJSON());
    }
    super.toJSON(data);
    return data;
  }
}

export interface ICMFusionFSItemWrapper extends IFusionEntityTable {
  isFolder?: boolean;
  path?: string | undefined;
  parentPath?: string | undefined;
  byteContent?: string | undefined;
  stringContent?: string | undefined;
  createdString?: string | undefined;
  children?: CMFusionFSItemWrapper[] | undefined;
}

export class GlobParametersWrapper implements IGlobParametersWrapper {
  path?: string | undefined;
  include?: string[] | undefined;
  exclude?: string[] | undefined;

  constructor(data?: IGlobParametersWrapper) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property)) (<any>this)[property] = (<any>data)[property];
      }
    }
  }

  init(_data?: any) {
    if (_data) {
      this.path = _data['Path'];
      if (Array.isArray(_data['Include'])) {
        this.include = [] as any;
        for (let item of _data['Include']) this.include!.push(item);
      }
      if (Array.isArray(_data['Exclude'])) {
        this.exclude = [] as any;
        for (let item of _data['Exclude']) this.exclude!.push(item);
      }
    }
  }

  static fromJS(data: any): GlobParametersWrapper {
    data = typeof data === 'object' ? data : {};
    let result = new GlobParametersWrapper();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['Path'] = this.path;
    if (Array.isArray(this.include)) {
      data['Include'] = [];
      for (let item of this.include) data['Include'].push(item);
    }
    if (Array.isArray(this.exclude)) {
      data['Exclude'] = [];
      for (let item of this.exclude) data['Exclude'].push(item);
    }
    return data;
  }
}

export interface IGlobParametersWrapper {
  path?: string | undefined;
  include?: string[] | undefined;
  exclude?: string[] | undefined;
}
export interface FileResponse {
  data: Blob;
  status: number;
  fileName?: string;
  headers?: { [name: string]: any };
}

function throwException(
  message: string,
  status: number,
  response: string,
  headers: { [key: string]: any },
  result?: any
): any {
  if (result !== null && result !== undefined) {
    throw result;
  } else {
    throw new ApiException(message, status, response, headers, null);
  }
}
