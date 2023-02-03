import { UserIdentity } from '@botframework-composer/types';
import fs from 'fs/promises';
import fsExtra from 'fs-extra';
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
import { BotProject } from '../../../../Composer/packages/server/build/models/bot/botProject';
import { TxBotProjectProxy } from '../models/bot/txBotProjectProxy';
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
    BotProjectService.getProjectById = this.getProjectById;
    BotProjectService.getProjectByAlias = this.getProjectByAlias;
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
            //await unzip(tempZipFile, { dir: locationRef.path });
            const dir = path.join(path.dirname(tempZipFile), 'unzipped');
            await unzip(tempZipFile, { dir: dir });
            const all = await fs.readdir(dir, { withFileTypes: true });
            const allFolders = all.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
            if (!(allFolders.length > 0)) {
              throw new Error('Solution folder expected!');
            }
            const dest = path.join(dir, allFolders[0]);
            await fsExtra.move(dest, locationRef.path);
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

  getProjectById: (projectId: string, user?: UserIdentity) => Promise<BotProject> = async (projectId, user?) => {
    try {
      this.logger.logTrace(this._getProjectByIdMsg1, this, projectId);
      const result = await this._originalGetProjectById(projectId, user);
      this.tranformResult(result);
      return result;
    } catch (err) {
      this.logger.logError(this._getProjectByIdMsg1, this, err);
      throw err;
    }
  };

  getProjectByAlias: (alias: string, user?: UserIdentity) => Promise<BotProject | undefined> = async (alias, user) => {
    try {
      this.logger.logTrace(this._getProjectByAliasMsg1, this, alias);
      const result = await this._originalGetProjectByAlias(alias, user);
      if (result) {
        this.tranformResult(result);
      }
      return result;
    } catch (err) {
      this.logger.logError(this._getProjectByAliasMsg1, this, err);
      throw err;
    }
  };

  tranformResult(result: BotProject) {
    const proxy = (<any>result)['txBotProjectProxy'];
    if (!proxy) {
      (<any>result)['txBotProjectProxy'] = new TxBotProjectProxy(result, this._txClient);
    }
  }

  toString(): string {
    return 'TxProjectService';
  }
}
