import { IBlobFolderContentRaw } from './iFileSystemContentInterfaces';

export interface ITxClient {
  /**
   * get zipped content of a bot from a backend and writes it to temp file
   * @param name bot's name
   * @returns the name of a temporary file
   *  */
  getBotContent(name: string): Promise<string>;

  /**
   * sends zipped content of a bot to a backend
   *  @param name bot's name
   *  @param dir the name of the directory to zip and send as a bot content
   */
  setBotContent(name: string, dir: string): Promise<void>;
  checkBot(name: string): Promise<boolean>;
  getBots(): Promise<IBlobFolderContentRaw>;

  /** resets bot */
  resetBot(name: string): Promise<void>;
}
