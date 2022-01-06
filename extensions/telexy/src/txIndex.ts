import { IExtensionRegistration } from '@botframework-composer/types';
import path from 'path';
import initRuntimes from './runtimes/txRuntimes';
import { TxLocalStorage } from './storage/txLocalStorage';
import { getPublisher, getTxClient, initServices } from './txServiceProvider';

async function initialize(registration: IExtensionRegistration): Promise<void> {
  let relativePath = path.join('..', '..', '..', 'Composer', 'packages', 'server', 'build', 'settings');
  const settings = require(relativePath);
  await initServices(settings.default.botsFolder);
  //settings.default.platform = 'linux';
  registration.useStorage(TxLocalStorage);
  const publisher = getPublisher(registration);
  // register this publishing method with Composer
  await registration.addPublishMethod(publisher);
  await initRuntimes(registration);
  // const client = getTxClient();
  // const bots = await client.getBots();
  // const check = await client.checkBot("BotB");
}

module.exports = {
  initialize,
};
