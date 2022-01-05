import { UserIdentity } from '@botframework-composer/types';
import fs from 'fs/promises';
import path from 'path';
import { StorageConnection } from '../../../../Composer/packages/server/build/models/storage/interface';
import { IBlobRootContent, IBlobFolderContent, IBlobFolderChildContent } from '../common/iFileSystemContentInterfaces';
import { IFileStorage, ILogger, IProfiler } from '../common/interfaces';
import { IStorageService } from '../common/iStorageService';
import { ITxClient } from '../common/iTxClient';
import { TxPath } from '../common/txPath';
import { TxFsClient } from '../txClient/txFsClient';
import { TxStorageServiceProxy } from './txStorageServiceProxy';

/**
 * Overrides TxStorageServiceProxy by redirecting some calls to TxClient
 */
export class TxStorageService extends TxStorageServiceProxy {
  private _txPath: TxPath;

  /**
   *
   */
  constructor(
    private _txClient: ITxClient,
    private _botsFolder: string,
    originalService: IStorageService,
    logger: ILogger,
    profiler: IProfiler
  ) {
    super(originalService, logger, profiler);
    originalService.checkBlob = this.checkBlob;
    originalService.getBlob = this.getBlob;
    this._txPath = new TxPath();
  }

  checkBlob: (storageId: string, filePath: string, user?: UserIdentity | undefined) => Promise<boolean> = async (
    storageId,
    filePath,
    user
  ) => {
    try {
      this.logger.logTrace('%s %s', this.checkBlobName, filePath);
      const t = this.profiler.hrtime();
      // first check blob in a local cache
      let result = await this._checkBlob(storageId, filePath, user);
      if (!result && this._txPath.isChildOf(filePath, this._botsFolder)) {
        // this is a request for bot which has not ever been open yet,
        // and therefore is not cached in a local folder
        // re-check it from the backend
        this.logger.logTrace('%s %s %s', this.checkBlobName, 'calls checkBot for', filePath);
        result = await this._txClient.checkBot(path.basename(filePath));
      }
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
      let result: IBlobRootContent | IBlobFolderContent | undefined;
      if (this._txPath.arePathsEqual(filePath, this._botsFolder)) {
        const bots = await this._txClient.getBots();
        const transformed: IBlobFolderContent = {
          name: path.basename(this._botsFolder),
          parent: path.dirname(this._botsFolder),
          writeable: false,
          children: bots.children.map((value) => {
            const result: IBlobFolderChildContent = {
              name: value.name,
              type: 'bot',
              path: path.join(this._botsFolder, value.name),
              lastModified: new Date(value.created).toString(),
              size: '',
            };
            return result;
          }),
        };
        result = transformed;
      } else {
        result = await this._getBlob(storageId, filePath, user);
      }
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
