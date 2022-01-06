import { BotProjectService } from '../../../../Composer/packages/server/build/services/project';
import { LocationRef } from '../../../../Composer/packages/server/build/models/bot/interface';
import { UserIdentity } from '@botframework-composer/types';
import { Request as ExpressRequest } from 'express';
import { IBotProjectService } from '../common/iBotProjectService';
import { ILogger, IProfiler } from '../common/interfaces';

/** Takes over original project service by replacing it's function properties  */
export class TxProjectServiceProxy implements IBotProjectService {
  protected _originalOpenProject: (
    locationRef: LocationRef,
    user?: UserIdentity | undefined,
    isRootBot?: boolean | undefined,
    options?: { allowPartialBots: boolean } | undefined
  ) => Promise<string>;

  protected _originalCreateProjectAsync: (req: ExpressRequest, jobId: string) => Promise<void>;

  /**
   *
   */
  constructor(protected logger: ILogger, protected profiler: IProfiler) {
    if (!this.logger) {
      throw new Error(`${this}.constructor: parameter _logger is not provided`);
    }
    if (!this.profiler) {
      throw new Error(`${this}.constructor: parameter _profiler is not provided`);
    }
    this._originalOpenProject = BotProjectService.openProject;
    this._originalCreateProjectAsync = BotProjectService.createProjectAsync;
    BotProjectService.openProject = this.openProject;
    BotProjectService.createProjectAsync = this.createProjectAsync;
    this.logger.logTrace('%s created!', this);
  }

  protected _openProjectMsg0: string = `${this}.openProjectAsync`;
  protected _openProjectMsg1: string = `${this._openProjectMsg0}  %s`;
  openProject: (
    locationRef: LocationRef,
    user?: UserIdentity,
    isRootBot?: boolean,
    options?: { allowPartialBots: boolean }
  ) => Promise<string> = async (locationRef, user, isRootBot, options) => {
    // making int an arrow function because it can be called without "this" context
    this.logger.logTrace(this._openProjectMsg1, locationRef);
    const t = this.profiler.hrtime();
    try {
      const result = await this._originalOpenProject(locationRef, user, isRootBot, options);
      this.profiler.loghrtime(this._openProjectMsg0, this, t);
      return result;
    } catch (err) {
      this.logger.logError(this._openProjectMsg1, err);
      throw err;
    }
  };

  private _createProjectMsg0: string = `${this}.createProjectAsync`;
  private _createProjectMsg1: string = `${this._createProjectMsg0}  %s`;

  createProjectAsync: (req: ExpressRequest, jobId: string) => Promise<void> = async (req, jobId) => {
    // making it an arrow function because it can be called without "this" context
    try {
      this.logger.logTrace(this._createProjectMsg1, this, jobId);
      const t = this.profiler.hrtime();
      await this._originalCreateProjectAsync(req, jobId);
      this.profiler.loghrtime(this._createProjectMsg0, jobId, t);
    } catch (err) {
      this.logger.logError(this._createProjectMsg1, this, err);
      throw err;
    }
  };

  toString(): string {
    return 'TxProjectServiceProxy';
  }
}
