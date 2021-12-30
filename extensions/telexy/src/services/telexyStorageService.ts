import { UserIdentity } from '@botframework-composer/types';
import { IFileStorage, StorageConnection } from '../../../../Composer/packages/server/build/models/storage/interface';
import { IBlobRootContent, IBlobFolderContent, IBlobFolderChildContent } from '../common/iFileSystemContentInterfaces';
import { ILogger, IProfiler } from '../common/interfaces';
import { IStorageService } from '../common/iStorageService';

export class TelexyStorageService implements IStorageService {
  private _getStorageClient: (storageId: string, user?: UserIdentity) => IFileStorage;
  private _createStorageConnection: (connection: StorageConnection) => void;
  private _getStorageConnections: () => StorageConnection[];
  private _checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean>;
  private _getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity) => Promise<string>;
  private _getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity
  ) => Promise<IBlobRootContent | IBlobFolderContent>;
  private _updateCurrentPath: (path: string, storageId: string) => StorageConnection[];
  private _validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory';
  private _createFolder: (path: string) => void;
  private _updateFolder: (path: string, oldName: string, newName: string) => void;
  private _checkIsBotFolder: (storageId: string, path: string, user?: UserIdentity | undefined) => Promise<boolean>;
  //private _getChildren: (storage: IFileStorage, dirPath: string) => Promise<IBlobFolderChildContent[]>;

  /**
   *
   */
  constructor(private _originalService: IStorageService, private _logger: ILogger, private _profiler: IProfiler) {
    if (!_originalService) {
      throw new Error('Original Storage Service is falsy!');
    }
    this._getStorageClient = _originalService.getStorageClient;
    _originalService.getStorageClient = this.getStorageClient;
    this._createStorageConnection = _originalService.createStorageConnection;
    _originalService.createStorageConnection = this.createStorageConnection;
    this._getStorageConnections = _originalService.getStorageConnections;
    _originalService.getStorageConnections = this.getStorageConnections;
    this._checkBlob = _originalService.checkBlob;
    _originalService.checkBlob = this.checkBlob;
    this._getBlobDateModified = _originalService.getBlobDateModified;
    this._getBlob = _originalService.getBlob;
    _originalService.getBlob = this.getBlob;
    this._updateCurrentPath = _originalService.updateCurrentPath;
    _originalService.updateCurrentPath = this.updateCurrentPath;
    this._validatePath = _originalService.validatePath;
    _originalService.validatePath = this.validatePath;
    this._createFolder = _originalService.createFolder;
    _originalService.createFolder = this.createFolder;
    this._updateFolder = _originalService.updateFolder;
    _originalService.updateFolder = this.updateFolder;
    this._checkIsBotFolder = _originalService.checkIsBotFolder;
    _originalService.checkIsBotFolder = this.checkIsBotFolder;
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
      this._logger.logTrace(this._getStorageConnectionsName);
      const result = this._getStorageConnections() ?? [];
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this._getStorageConnectionsName, err);
      throw err;
    }
  };

  private _checkBlobName: string = `${this}.checkBlob`;
  checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this._logger.logTrace('%s %s', this._checkBlobName, filePath);
      const t = this._profiler.hrtime();
      const result = await this._checkBlob(storageId, filePath, user);
      this._profiler.log(t, '%s %s', this._checkBlobName, filePath);
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this._checkBlobName, err);
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
      this._logger.logTrace('%s %s', this._getBlobDateModifiedName, filePath);
      const t = this._profiler.hrtime();
      const result = await this._getBlobDateModified(storageId, filePath, user);
      return result;
      this._profiler.log(t, '%s %s', this._getBlobDateModifiedName, filePath);
    } catch (err) {
      this._logger.logError('%s %o', this._getBlobDateModifiedName, err);
      throw err;
    }
  };

  private _getBlobName: string = `${this}.getBlob`;
  getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity
  ) => Promise<IBlobRootContent | IBlobFolderContent> = async (storageId, filePath, user) => {
    try {
      this._logger.logTrace('%s %s', this._getBlobName, filePath);
      const t = this._profiler.hrtime();
      const result = await this._getBlob(storageId, filePath, user);
      this._profiler.log(t, '%s %s', this._getBlobName, filePath);
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this._getBlobName, err);
      throw err;
    }
  };

  private _updateCurrentPathName: string = `${this}.updateCurrentPath`;
  updateCurrentPath: (path: string, storageId: string) => StorageConnection[] = (path, storageId) => {
    try {
      this._logger.logTrace('%s %s', this._updateCurrentPathName, path);
      const t = this._profiler.hrtime();
      const result = this._updateCurrentPath(path, storageId);
      this._profiler.log(t, '%s %s', this._updateCurrentPathName, path);
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this._updateCurrentPathName, err);
      throw err;
    }
  };

  private _validatePathName: string = `${this}.validatePath`;
  validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory' = (path) => {
    try {
      this._logger.logTrace('%s %s', this._validatePathName, path);
      const t = this._profiler.hrtime();
      this._profiler.log(t, '%s %s', this._validatePathName, path);
      const result = this._validatePath(path);
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this._validatePathName, err);
      throw err;
    }
  };

  private _createFolderName: string = `${this}.createFolder`;
  createFolder: (path: string) => void = (path) => {
    try {
      this._logger.logTrace('%s %s', this._createFolderName, path);
      const t = this._profiler.hrtime();
      this._createFolder(path);
      this._profiler.log(t, '%s %s', this._createFolderName, path);
    } catch (err) {
      this._logger.logError('%s %o', this._createFolderName, err);
      throw err;
    }
  };

  private _updateFolderName: string = `${this}.updateFolder`;
  updateFolder: (path: string, oldName: string, newName: string) => void = (path, oldName, newName) => {
    try {
      this._logger.logTrace('%s %s %s', this._updateFolderName, path, newName);
      const t = this._profiler.hrtime();
      this._updateFolder(path, oldName, newName);
      this._profiler.log(t, '%s %s %s', this._updateFolderName, path, newName);
    } catch (err) {
      this._logger.logError('%s %o', this._updateFolderName, err);
      throw err;
    }
  };

  private _checkIsBotFolderName: string = `${this}.checkIsBotFolder`;
  checkIsBotFolder: (storageId: string, path: string, user?: UserIdentity | undefined) => Promise<boolean> = async (
    storageId,
    path,
    user
  ) => {
    try {
      this._logger.logTrace('%s %s', this._checkIsBotFolderName, path);
      const t = this._profiler.hrtime();
      const result = await this._checkIsBotFolder(storageId, path, user);
      this._profiler.log(t, '%s %s', this._checkIsBotFolderName, path);
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this._checkIsBotFolderName, err);
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
    return 'TelexyStorageService';
  }
}
