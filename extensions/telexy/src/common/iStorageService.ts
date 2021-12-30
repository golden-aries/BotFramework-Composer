import {
  IFileStorage,
  StorageConnection as IStorageConnection,
} from '../../../../Composer/packages/server/build/models/storage/interface';
import { UserIdentity } from '@botframework-composer/types';
import { IBlobFolderChildContent, IBlobFolderContent, IBlobRootContent } from './iFileSystemContentInterfaces';

/** ITelexyStorage */
export interface IStorageService {
  getStorageClient: (storageId: string, user?: UserIdentity) => IFileStorage;

  createStorageConnection: (connection: IStorageConnection) => void;

  getStorageConnections: () => IStorageConnection[];

  checkBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<boolean>;

  getBlobDateModified: (storageId: string, filePath: string, user?: UserIdentity) => Promise<string>;

  getBlob: (storageId: string, filePath: string, user?: UserIdentity) => Promise<IBlobRootContent | IBlobFolderContent>;

  updateCurrentPath: (path: string, storageId: string) => IStorageConnection[];

  validatePath: (path: string) => '' | 'The path does not exist' | 'This is not a directory';

  createFolder: (path: string) => void;

  updateFolder: (path: string, oldName: string, newName: string) => void;

  checkIsBotFolder: (storageId: string, path: string, user?: UserIdentity | undefined) => Promise<boolean>;
}
