import { ILogger, MakeDirectoryOptions, Stat } from '../common/interfaces';
import { UnknownError } from '../exceptions/telexyExceptions';

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
    try {
      this.logger.logTrace('statSync %s', path);
      const result = this.client.statSync(path);
      return this.toStat(result);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API statSync call!');
    }
  }

  readFileSync(path: string): string {
    try {
      this.logger.logTrace('readFileSync %s', path);
      return this.client.readFileSync(path);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API readFileSync call!');
    }
  }

  readDirSync(path: string): string[] {
    try {
      this.logger.logTrace('readDirSync %s', path);
      let transformedPath = this.transformAndCheckPath(path);
      var result = this.client.browseSync(path);
      return this.getReadDirResult(result, transformedPath);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API readDirSync call!');
    }
  }

  existsSync(path: string): boolean {
    try {
      this.logger.logTrace('existsSync %s', path);
      this.client.statSync(path);
      return true;
    } catch {
      return false;
    }
  }

  writeFileSync(path: string, content: any): void {
    try {
      this.logger.logTrace('writeFileSync %s', path);
      this.client.writeFile(this.getWrapperForWriteFile(path, content));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API writeFileSync call!');
    }
  }

  removeFileSync(path: string): void {
    try {
      this.logger.logTrace('removeFileSync %s', path);
      const normalizedPath = this.transformAndCheckPath(path);
      const stat = this.client.statSync(normalizedPath);
      this.client.delete(this.getWrapperForRemoveFile(stat, path));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API removeFileSync call!');
    }
  }

  mkDirSync(path: string, options?: MakeDirectoryOptions): void {
    try {
      this.logger.logTrace('mdkDirSync %s', path);
      this.client.create(this.getWrapperForMkDir(path));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API mkDirSync call!');
    }
  }

  rmDirSync(path: string): void {
    try {
      this.logger.logTrace('rmDirSync %s', path);
      const stat = this.client.statSync(path);
      this.client.delete(this.getWrpapperForRmDir(stat, path));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API rmDirSync call!');
    }
  }

  rmrfDirSync(path: string): void {
    this.rmDir(path);
  }

  globSync(pattern: string | string[], path: string): string[] {
    try {
      this.logger.logTrace('globSync %s %o', path, pattern);
      return this.client.globSync(this.getWrapperForGlob(pattern, path));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API globSync call!');
    }
  }
}
