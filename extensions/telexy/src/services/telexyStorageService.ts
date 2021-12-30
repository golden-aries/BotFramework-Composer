import { UserIdentity } from '@botframework-composer/types';
import { IFileStorage, StorageConnection } from '../../../../Composer/packages/server/build/models/storage/interface';
import { IBlobRootContent, IBlobFolderContent, IBlobFolderChildContent } from '../common/iFileSystemContentInterfaces';
import { IStorageService } from '../common/iStorageService';

export class TelexyStorageService implements IStorageService {
  private _getStorageClient: (storageId: string, user?: UserIdentity | undefined) => IFileStorage;
  private _createStorageConnection: (connection: StorageConnection) => void;
  private _getStorageConnections: () => StorageConnection[];
  private _checkBlob: (storageId: string, filePath: string, user?: UserIdentity | undefined) => Promise<boolean>;
  private _getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity | undefined) => string;
  private _getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity | undefined
  ) => Promise<IBlobRootContent | IBlobFolderContent>;
  private _updateCurrentPath: (path: string, storageId: string) => StorageConnection[];
  private _validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory';
  private _createFolder: (path: string) => void;
  private _updateFolder: (path: string, oldName: string, newName: string) => void;
  private _checkIsBotFolder: (storageId: string, path: string, user?: UserIdentity | undefined) => Promise<boolean>;
  private _getChildren: (storage: IFileStorage, dirPath: string) => Promise<IBlobFolderChildContent[]>;

  /**
   *
   */
  constructor(private _originalService: IStorageService) {
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
    this._getChildren = _originalService.getChildren;
    _originalService.getChildren = this.getChildren;
  }

  getStorageClient: (storageId: string, user?: UserIdentity | undefined) => IFileStorage = (storageId, user) => {
    return this._getStorageClient(storageId, user);
  };

  createStorageConnection: (connection: StorageConnection) => void = (connection) => {
    this._createStorageConnection(connection);
  };

  getStorageConnections: () => StorageConnection[] = () => {
    return this._getStorageConnections();
  };

  checkBlob: (storageId: string, filePath: string, user?: UserIdentity | undefined) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    return await this._checkBlob(storageId, filePath, user);
  };

  getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity | undefined) => string = (
    storageId,
    filePath,
    user
  ) => {
    return this._getBlobDateModified(storageId, filePath, user);
  };

  getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity | undefined
  ) => Promise<IBlobRootContent | IBlobFolderContent> = async (storageId, filePath, user) => {
    return await this._getBlob(storageId, filePath, user);
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

  getChildren: (storage: IFileStorage, dirPath: string) => Promise<IBlobFolderChildContent[]> = async (
    storageId,
    dirPath
  ) => {
    return await this._getChildren(storageId, dirPath);
  };
}
