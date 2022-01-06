import { IBlobFolderContentRaw } from './iFileSystemContentInterfaces';

export interface ITxClient {
  /**
   * get zipped content of a bot from a backend and writes it to temp file
   * @param name bot's name
   * @returns the name of a temporary file
   *  */
  getBotContent(name: string): Promise<string>;
  checkBot(name: string): Promise<boolean>;
  getBots(): Promise<IBlobFolderContentRaw>;
}
