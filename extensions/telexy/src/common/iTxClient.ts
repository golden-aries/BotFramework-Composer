import { UserIdentity } from '@botframework-composer/types';
import { IBlobRootContent } from './iFileSystemContentInterfaces';

export interface ITxClient {
  checkBot(name: string): Promise<boolean>;
  getBots(): Promise<IBlobRootContent>;
}
