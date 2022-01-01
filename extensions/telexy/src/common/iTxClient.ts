import { UserIdentity } from '@botframework-composer/types';

export interface ITxClient {
  getBlob(path: string, user?: UserIdentity): Promise<string>;
}
