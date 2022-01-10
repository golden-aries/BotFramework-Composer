import { UserIdentity } from '@botframework-composer/types';
import fs from 'fs/promises';
import path from 'path';
import { LocationRef } from '../../../../Composer/packages/server/build/models/bot/interface';
import { BotProjectService } from '../../../../Composer/packages/server/build/services/project';
import { IFileStorage } from '../common/iFileStorage';
import { ILogger, IProfiler } from '../common/interfaces';
import { ITxClient } from '../common/iTxClient';
import { TxPath } from '../common/txPath';
import { TxProjectServiceProxy } from './txProjectServiceProxy';
import unzip from 'extract-zip';
import os from 'os';
export class TxProjectService extends TxProjectServiceProxy {
  /**
   *
   */
  constructor(
    private _txClient: ITxClient,
    private _txPath: TxPath,
    private _botFolder: string,
    private _cache: IFileStorage,
    logger: ILogger,
    profiler: IProfiler
  ) {
    super(logger, profiler);
    BotProjectService.openProject = this.openProject;
  }

  openProject: (
    locationRef: LocationRef,
    user?: UserIdentity,
    isRootBot?: boolean,
    options?: { allowPartialBots: boolean }
  ) => Promise<string> = async (locationRef, user, isRootBot, options) => {
    this.logger.logTrace(this._openProjectMsg1, locationRef);
    const t = this.profiler.hrtime();
    let tempZipFile: string | undefined;
    try {
      if (this._txPath.isChildOf(locationRef.path, this._botFolder)) {
        if (!(await this._cache.exists(locationRef.path))) {
          try {
            tempZipFile = await this._txClient.getBotContent(path.basename(locationRef.path));
            await unzip(tempZipFile, { dir: locationRef.path });
          } catch (err) {
            throw err;
          } finally {
            if (tempZipFile) {
              try {
                const dir = path.dirname(tempZipFile);
                // that guard is a safety precaution
                if (this._txPath.isChildOf(dir, os.tmpdir())) {
                  await fs.rmdir(dir, { recursive: true });
                }
              } catch (err) {
                this.logger.logError('unable to delete temporary directory', err);
              }
            }
          }
        }
      }
      const result = await this._originalOpenProject(locationRef, user, isRootBot, options);
      this.profiler.loghrtime(this._openProjectMsg0, this, t);
      return result;
    } catch (err) {
      this.logger.logError(this._openProjectMsg1, err);
      throw err;
    }
  };

  toString(): string {
    return 'TxProjectService';
  }
}
