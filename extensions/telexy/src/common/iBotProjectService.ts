import { LocationRef } from './../../../../Composer/packages/server/build/models/bot/interface';
import { UserIdentity } from '@botframework-composer/types';
import { Request as ExpressRequest } from 'express';

/** takes over BotProjectService which is in $bfc/Composer/packages/server/src/services/projects.ts */
export interface IBotProjectService {
  openProjectAsync(
    locationRef: LocationRef,
    user?: UserIdentity,
    isRootBot?: boolean,
    options?: { allowPartialBots: boolean }
  ): Promise<string>;

  createProjectAsync(req: ExpressRequest, jobId: string): Promise<void>;
}
