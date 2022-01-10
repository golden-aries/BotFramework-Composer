import { StorageConnection as IStorageConnection } from '../../../../Composer/packages/server/build/models/storage/interface';
import { UserIdentity } from '@botframework-composer/types';
import { IBlobFolderChildContent, IBlobFolderContent, IBlobRootContent } from './iFileSystemContentInterfaces';
import { IFileStorage } from '../common/iFileStorage';

/** ITelexyStorage */
export interface IStorageService {
  getStorageClient: (storageId: string, user?: UserIdentity) => IFileStorage;

  createStorageConnection: (connection: IStorageConnection) => void;

  getStorageConnections: () => IStorageConnection[];

  checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean>;

  getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity) => Promise<string>;

  getBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<IBlobRootContent | IBlobFolderContent>;

  updateCurrentPath: (filePath: string, storageId: string) => IStorageConnection[];

  validatePath: (filePath: string) => '' | 'The path does not exist' | 'This is not a directory';

  createFolder: (filePath: string) => void;

  updateFolder: (filePath: string, oldName: string, newName: string) => void;

  checkIsBotFolder: (storageId: string, filePath: string, user?: UserIdentity | undefined) => Promise<boolean>;
}
