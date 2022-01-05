import { UserIdentity } from '@botframework-composer/types';
import { LocationRef } from '../../../../Composer/packages/server/build/models/bot/interface';
import { ILogger, IProfiler } from '../common/interfaces';
import { TxClient } from '../txClient/txClient';
import { TxProjectServiceProxy } from './txProjectServiceProxy';

export class TxProjectService extends TxProjectServiceProxy {
  /**
   *
   */
  constructor(private _txClient: TxClient, logger: ILogger, profiler: IProfiler) {
    super(logger, profiler);
  }

  toString(): string {
    return 'TxProjectService';
  }
}
