import { IExtensionRegistration } from '@botframework-composer/types';
import path from 'path';
import initRuntimes from './runtimes/telexyRuntimes';
import { initServices, getPublisher } from './services/serviceProvider';
import storageService from './../../../Composer/packages/server/build/services/storage';

async function initialize(registration: IExtensionRegistration): Promise<void> {
  let relativePath = path.join('..', '..', '..', 'Composer', 'packages', 'server', 'build', 'settings');
  const settings = require(relativePath);
  await initServices(settings.default.botsFolder);
  //settings.default.platform = 'linux';
  //registration.useStorage(Storage);
  const publisher = getPublisher(registration);
  // register this publishing method with Composer
  await registration.addPublishMethod(publisher);
  await initRuntimes(registration);
}

module.exports = {
  initialize,
};
