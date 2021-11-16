import { ILogger, IPathConvertor, MakeDirectoryOptions, Stat } from '../common/interfaces';
import {
  TxExistsOperationError,
  TxFileSystemOperationError,
  TxGlobOperationError,
  UnknownError,
} from '../exceptions/telexyExceptions';

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
      const result = this._statInternalSync(convertedPath);
      return result;
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API statSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  private _statInternalSync(path: string): Stat {
    const result = this.client.statSync(path);
    return this.toStat(result);
  }

  readFileSync(path: string): string {
    try {
      this.logger.logTrace('readFileSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      return this.client.readFileSync(convertedPath);
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API readFileSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  readDirSync(path: string): string[] {
    try {
      this.logger.logTrace('readDirSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      var result = this.client.browseSync(path);
      return this.getReadDirResult(result, convertedPath);
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API readDirSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  existsSync(path: string): boolean {
    try {
      this.logger.logTrace('existsSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const result = this.client.existsSync(convertedPath);
      if (!result) {
        this.logger.logTrace('Path do not exists: %s', path);
      }
      return result;
    } catch (err) {
      const newErr = new TxExistsOperationError(path, err, 'Telexy strorage existSync operation finished with error!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  writeFileSync(path: string, content: any): void {
    try {
      this.logger.logTrace('writeFileSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      this.client.writeFileSync(this.getWrapperForWriteFile(convertedPath, content));
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API writeFileSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  removeFileSync(path: string): void {
    try {
      this.logger.logTrace('removeFileSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const stat = this.client.statSync(convertedPath);
      this.client.delete(this.getWrapperForRemoveFile(stat, convertedPath));
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API removeFileSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  mkDirSync(path: string, options?: MakeDirectoryOptions): void {
    try {
      this.logger.logTrace('mdkDirSync %s %s', !!options?.recursive ? 'recursive' : 'non-recursive', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      if (options?.recursive) {
        this.client.createDirectoryRecursiveSync(convertedPath);
      } else {
        this.client.createSync(this.getWrapperForMkDir(convertedPath));
      }
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API mkDirSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  rmDirSync(path: string): void {
    try {
      this.logger.logTrace('rmDirSync %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const stat = this.client.statSync(convertedPath);
      this.client.delete(this.getWrpapperForRmDir(stat, convertedPath));
    } catch (err) {
      const newErr = new TxFileSystemOperationError(path, err, 'Error occured during storage API rmDirSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  rmrfDirSync(path: string): void {
    this.rmDirSync(path);
  }

  globSync(pattern: string | string[], path: string): string[] {
    try {
      this.logger.logTrace('globSync %s %o', path, pattern);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const results = this.client.globSync(this.getWrapperForGlob(pattern, convertedPath));
      if (results.length > 0) {
        const transformedResults = this.transformGlobResults(results);
        this.logger.logTrace('glob has results for path:%o pattern: %o ', path, pattern);
        return transformedResults;
      }
      this.logger.logTrace('glob is empty for path:%o pattern: %o ', path, pattern);
      return results;
    } catch (err) {
      const newErr = new TxGlobOperationError(path, pattern, err, 'Error occured during storage API globSync call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }
}
