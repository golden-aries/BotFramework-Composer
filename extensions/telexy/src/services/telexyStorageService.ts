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

  getStorageConnections: () => StorageConnection[] = () => {
    try {
      this._logger.logTrace('%s.getStorageConnections ', this);
      const result = this._getStorageConnections() ?? [];
      return result;
    } catch (err) {
      this._logger.logError('%s %o', this, err);
      throw err;
    }
  };

  checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this._logger.logTrace('%s.checkBlob', this);
      const t = this._profiler.hrtime();
      const result = await this._checkBlob(storageId, filePath, user);
      this._profiler.loghrtime(this, 'checkBlob', t);
      return result;
    } catch (err) {
      this._logger.logError('%s.checkBlob %o', this, err);
      throw err;
    }
  };

  getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity) => Promise<string> = async (
    storageId,
    filePath,
    user
  ) => {
    return await this._getBlobDateModified(storageId, filePath, user);
  };

  getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity
  ) => Promise<IBlobRootContent | IBlobFolderContent> = async (storageId, filePath, user) => {
    try {
      this._logger.logTrace('%s.getBlob %s', this, filePath);
      const t = this._profiler.hrtime();
      const result = await this._getBlob(storageId, filePath, user);
      this._profiler.loghrtime(this, 'getBlob', t);
      return result;
    } catch (err) {
      this._logger.logError('%s %s %o', this, 'getBlob', err);
      throw err;
    }
  };

  updateCurrentPath: (path: string, storageId: string) => StorageConnection[] = (path, storageId) => {
    return this._updateCurrentPath(path, storageId);
  };

  validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory' = (path) => {
    return this._validatePath(path);
  };

  createFolder: (path: string) => void = (path) => {
    this._createFolder(path);
  };

  updateFolder: (path: string, oldName: string, newName: string) => void = (path, oldName, newName) => {
    this._updateFolder(path, oldName, newName);
  };

  checkIsBotFolder: (storageId: string, path: string, user?: UserIdentity | undefined) => Promise<boolean> = async (
    storageId,
    path,
    user
  ) => {
    return await this._checkIsBotFolder(storageId, path, user);
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
