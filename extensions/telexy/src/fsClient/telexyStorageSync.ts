import { ILogger, IPathConvertor, MakeDirectoryOptions, Stat } from '../common/interfaces';
import { UnknownError } from '../exceptions/telexyExceptions';

//import { Stat, MakeDirectoryOptions } from '../../../../Composer/packages/server/src/models/storage/interface';
import { TelexyFsClientSync } from './TelexyFsClientSync';
import { TelexyStorage } from './telexyStorage';

export class TelexyStorageSync extends TelexyStorage {
  /**
   *
   */
  constructor(protected client: TelexyFsClientSync, logger: ILogger, pathConvertor: IPathConvertor) {
    super(client, logger, pathConvertor);
  }

  statSync(path: string): Stat {
    try {
      this.logger.logTrace('statSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const result = this.client.statSync(convertedPath);
      return this.toStat(result);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API statSync call!');
    }
  }

  readFileSync(path: string): string {
    try {
      this.logger.logTrace('readFileSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      return this.client.readFileSync(convertedPath);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API readFileSync call!');
    }
  }

  readDirSync(path: string): string[] {
    try {
      this.logger.logTrace('readDirSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      var result = this.client.browseSync(path);
      return this.getReadDirResult(result, convertedPath);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API readDirSync call!');
    }
  }

  existsSync(path: string): boolean {
    try {
      this.logger.logTrace('existsSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      this.client.statSync(convertedPath);
      return true;
    } catch {
      return false;
    }
  }

  writeFileSync(path: string, content: any): void {
    try {
      this.logger.logTrace('writeFileSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      this.client.writeFile(this.getWrapperForWriteFile(convertedPath, content));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API writeFileSync call!');
    }
  }

  removeFileSync(path: string): void {
    try {
      this.logger.logTrace('removeFileSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const stat = this.client.statSync(convertedPath);
      this.client.delete(this.getWrapperForRemoveFile(stat, convertedPath));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API removeFileSync call!');
    }
  }

  mkDirSync(path: string, options?: MakeDirectoryOptions): void {
    try {
      this.logger.logTrace('mdkDirSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      this.client.create(this.getWrapperForMkDir(convertedPath));
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API mkDirSync call!');
    }
  }

  rmDirSync(path: string): void {
    try {
      this.logger.logTrace('rmDirSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const stat = this.client.statSync(convertedPath);
      this.client.delete(this.getWrpapperForRmDir(stat, convertedPath));
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
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const results = this.client.globSync(this.getWrapperForGlob(pattern, convertedPath));
      return this.transformGlobResults(results);
    } catch (err) {
      throw new UnknownError(err, 'Error occured during storage API globSync call!');
    }
  }
}
