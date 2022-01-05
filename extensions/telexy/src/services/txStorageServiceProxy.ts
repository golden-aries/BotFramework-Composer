import { UserIdentity } from '@botframework-composer/types';
import { IFileStorage, StorageConnection } from '../../../../Composer/packages/server/build/models/storage/interface';
import { IBlobRootContent, IBlobFolderContent, IBlobFolderChildContent } from '../common/iFileSystemContentInterfaces';
import { ILogger, IPathConvertor, IProfiler } from '../common/interfaces';
import { IStorageService } from '../common/iStorageService';

/**
 * Takes over original storage service by replacing it's function properties
 */
export class TxStorageServiceProxy implements IStorageService {
  private _getStorageClient: (storageId: string, user?: UserIdentity) => IFileStorage;
  private _createStorageConnection: (connection: StorageConnection) => void;
  private _getStorageConnections: () => StorageConnection[];
  protected _checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean>;
  private _getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity) => Promise<string>;
  protected _getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity
  ) => Promise<IBlobRootContent | IBlobFolderContent>;
  private _updateCurrentPath: (path: string, storageId: string) => StorageConnection[];
  private _validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory';
  private _createFolder: (path: string) => void;
  private _updateFolder: (path: string, oldName: string, newName: string) => void;
  protected _checkIsBotFolder: (storageId: string, path: string, user?: UserIdentity | undefined) => Promise<boolean>;
  //private _getChildren: (storage: IFileStorage, dirPath: string) => Promise<IBlobFolderChildContent[]>;

  /**
   *
   */
  constructor(protected originalService: IStorageService, protected logger: ILogger, protected profiler: IProfiler) {
    if (!originalService) {
      throw new Error('Original Storage Service is falsy!');
    }
    this._getStorageClient = originalService.getStorageClient;
    originalService.getStorageClient = this.getStorageClient;
    this._createStorageConnection = originalService.createStorageConnection;
    originalService.createStorageConnection = this.createStorageConnection;
    this._getStorageConnections = originalService.getStorageConnections;
    originalService.getStorageConnections = this.getStorageConnections;
    this._checkBlob = originalService.checkBlob;
    originalService.checkBlob = this.checkBlob;
    this._getBlobDateModified = originalService.getBlobDateModified;
    this._getBlob = originalService.getBlob;
    originalService.getBlob = this.getBlob;
    this._updateCurrentPath = originalService.updateCurrentPath;
    originalService.updateCurrentPath = this.updateCurrentPath;
    this._validatePath = originalService.validatePath;
    originalService.validatePath = this.validatePath;
    this._createFolder = originalService.createFolder;
    originalService.createFolder = this.createFolder;
    this._updateFolder = originalService.updateFolder;
    originalService.updateFolder = this.updateFolder;
    this._checkIsBotFolder = originalService.checkIsBotFolder;
    originalService.checkIsBotFolder = this.checkIsBotFolder;
    // this._getChildren = _originalService.getChildren;
    // _originalService.getChildren = this.getChildren;
  }

  getStorageClient: (storageId: string, user?: UserIdentity) => IFileStorage = (storageId, user) => {
    return this._getStorageClient(storageId, user);
  };

  createStorageConnection: (connection: StorageConnection) => void = (connection) => {
    this._createStorageConnection(connection);
  };

  private _getStorageConnectionsName: string = `${this}.getStorageConnections`;
  getStorageConnections: () => StorageConnection[] = () => {
    try {
      this.logger.logTrace(this._getStorageConnectionsName);
      const result = this._getStorageConnections() ?? [];
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this._getStorageConnectionsName, err);
      throw err;
    }
  };

  protected checkBlobName: string = `${this}.checkBlob`;
  checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this.logger.logTrace('%s %s', this.checkBlobName, filePath);
      const t = this.profiler.hrtime();
      const result = await this._checkBlob(storageId, filePath, user);
      this.profiler.log(t, '%s %s', this.checkBlobName, filePath);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this.checkBlobName, err);
      throw err;
    }
  };

  private _getBlobDateModifiedName: string = `${this}.getBlobDateModified`;
  getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity) => Promise<string> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this.logger.logTrace('%s %s', this._getBlobDateModifiedName, filePath);
      const t = this.profiler.hrtime();
      const result = await this._getBlobDateModified(storageId, filePath, user);
      return result;
      this.profiler.log(t, '%s %s', this._getBlobDateModifiedName, filePath);
    } catch (err) {
      this.logger.logError('%s %o', this._getBlobDateModifiedName, err);
      throw err;
    }
  };

  protected _getBlobName: string = `${this}.getBlob`;
  getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity
  ) => Promise<IBlobRootContent | IBlobFolderContent> = async (storageId, filePath, user) => {
    try {
      this.logger.logTrace('%s %s', this._getBlobName, filePath);
      const t = this.profiler.hrtime();
      const result = await this._getBlob(storageId, filePath, user);
      this.profiler.log(t, '%s %s', this._getBlobName, filePath);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this._getBlobName, err);
      throw err;
    }
  };

  private _updateCurrentPathName: string = `${this}.updateCurrentPath`;
  updateCurrentPath: (path: string, storageId: string) => StorageConnection[] = (path, storageId) => {
    try {
      this.logger.logTrace('%s %s', this._updateCurrentPathName, path);
      const t = this.profiler.hrtime();
      const result = this._updateCurrentPath(path, storageId);
      this.profiler.log(t, '%s %s', this._updateCurrentPathName, path);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this._updateCurrentPathName, err);
      throw err;
    }
  };

  private _validatePathName: string = `${this}.validatePath`;
  validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory' = (path) => {
    try {
      this.logger.logTrace('%s %s', this._validatePathName, path);
      const t = this.profiler.hrtime();
      this.profiler.log(t, '%s %s', this._validatePathName, path);
      const result = this._validatePath(path);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this._validatePathName, err);
      throw err;
    }
  };

  private _createFolderName: string = `${this}.createFolder`;
  createFolder: (path: string) => void = (path) => {
    try {
      this.logger.logTrace('%s %s', this._createFolderName, path);
      const t = this.profiler.hrtime();
      this._createFolder(path);
      this.profiler.log(t, '%s %s', this._createFolderName, path);
    } catch (err) {
      this.logger.logError('%s %o', this._createFolderName, err);
      throw err;
    }
  };

  private _updateFolderName: string = `${this}.updateFolder`;
  updateFolder: (path: string, oldName: string, newName: string) => void = (path, oldName, newName) => {
    try {
      this.logger.logTrace('%s %s %s', this._updateFolderName, path, newName);
      const t = this.profiler.hrtime();
      this._updateFolder(path, oldName, newName);
      this.profiler.log(t, '%s %s %s', this._updateFolderName, path, newName);
    } catch (err) {
      this.logger.logError('%s %o', this._updateFolderName, err);
      throw err;
    }
  };

  protected checkIsBotFolderName: string = `${this}.checkIsBotFolder`;
  checkIsBotFolder: (storageId: string, filePath: string, user?: UserIdentity | undefined) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this.logger.logTrace('%s %s', this.checkIsBotFolderName, filePath);
      const t = this.profiler.hrtime();
      const result = await this._checkIsBotFolder(storageId, filePath, user);
      this.profiler.log(t, '%s %s', this.checkIsBotFolderName, filePath);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this.checkIsBotFolderName, err);
      throw err;
    }
  };

  // getChildren: (storage: IFileStorage, dirPath: string) => Promise<IBlobFolderChildContent[]> = async (
  //   storageId,
  //   dirPath
  // ) => {
  //   return await this._getChildren(storageId, dirPath);
  // };

  toString(): string {
    return 'TxStorageServiceProxy';
  }
}
