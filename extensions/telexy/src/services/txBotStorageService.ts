import { UserIdentity } from '@botframework-composer/types';
import { StorageConnection } from '../../../../Composer/packages/server/build/models/storage/interface';
import { IBlobRootContent, IBlobFolderContent } from '../common/iFileSystemContentInterfaces';
import { IFileStorage, ILogger, IProfiler } from '../common/interfaces';
import { IStorageService } from '../common/iStorageService';
import { TxStorageService } from './txStorageService';

export class TxBotStorageService extends TxStorageService {
  /**
   *
   */
  constructor(originalService: IStorageService, logger: ILogger, profiler: IProfiler) {
    super(originalService, logger, profiler);
    originalService.checkBlob = this.checkBlob;
    originalService.getBlob = this.getBlob;
  }

  checkBlob: (storageId: string, filePath: string, user?: UserIdentity | undefined) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this.logger.logTrace('%s %s', this.checkBlobName, filePath);
      const t = this.profiler.hrtime();
      const result = await this._checkBlob(storageId, filePath, user);
      this.profiler.log(t, '%s %s', this.checkBlobName, filePath);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this.checkBlobName, err);
      throw err;
    }
  };

  getBlob: (
    storageId: string,
    filePath: string,
    user?: UserIdentity
  ) => Promise<IBlobRootContent | IBlobFolderContent> = async (storageId, filePath, user) => {
    try {
      this.logger.logTrace('%s %s', this._getBlobName, filePath);
      const t = this.profiler.hrtime();
      const result = await this._getBlob(storageId, filePath, user);
      this.profiler.log(t, '%s %s', this._getBlobName, filePath);
      return result;
    } catch (err) {
      this.logger.logError('%s %o', this._getBlobName, err);
      throw err;
    }
  };

  toString(): string {
    return 'TxBotStorageService';
  }
}
