import { ILogger, MakeDirectoryOptions, Stat } from '../common/interfaces';

//import { Stat, MakeDirectoryOptions } from '../../../../Composer/packages/server/src/models/storage/interface';
import { TelexyFsClientSync } from './TelexyFsClientSync';
import { TelexyStorage } from './telexyStorage';

export class TelexyStorageSync extends TelexyStorage {
  /**
   *
   */
  constructor(protected client: TelexyFsClientSync, protected logger: ILogger) {
    super(client, logger);
  }

  statSync(path: string): Stat {
    const result = this.client.statSync(path);
    return this.toStat(result);
  }

  readFileSync(path: string): string {
    return this.client.readFileSync(path);
  }

  readDirSync(path: string): string[] {
    let transformedPath = this.transformAndCheckPath(path);
    var result = this.client.browseSync(path);
    return this.getReadDirResult(result, transformedPath);
  }

  existsSync(path: string): boolean {
    try {
      this.client.statSync(path);
      return true;
    } catch {
      return false;
    }
  }

  writeFileSync(path: string, content: any): void {
    this.client.writeFile(this.getWrapperForWriteFile(path, content));
  }

  removeFileSync(path: string): void {
    const normalizedPath = this.transformAndCheckPath(path);
    const stat = this.client.statSync(normalizedPath);
    this.client.delete(this.getWrapperForRemoveFile(stat, path));
  }

  mkDirSync(path: string, options?: MakeDirectoryOptions): void {
    this.client.create(this.getWrapperForMkDir(path));
  }

  rmDirSync(path: string): void {
    const stat = this.client.statSync(path);
    this.client.delete(this.getWrpapperForRmDir(stat, path));
  }

  rmrfDirSync(path: string): void {
    this.rmDir(path);
  }

  globSync(pattern: string | string[], path: string): string[] {
    return this.client.globSync(this.getWrapperForGlob(pattern, path));
  }
}
