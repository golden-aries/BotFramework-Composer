import { IBlobFolderContentRaw } from './iFileSystemContentInterfaces';

export interface ITxClient {
  checkBot(name: string): Promise<boolean>;
  getBots(): Promise<IBlobFolderContentRaw>;
}
