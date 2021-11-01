import { IExtensionRegistration } from '@botframework-composer/types';
import { TelexyPublisher } from './publish/telexyPublish';
import initRuntimes from './runtimes/telexyRuntimes';
import { initServices, Storage } from './services/serviceProvider';

async function initialize(registration: IExtensionRegistration): Promise<void> {
  await initServices();
  registration.useStorage(Storage);
  const publisher = new TelexyPublisher(registration);
  // register this publishing method with Composer
  await registration.addPublishMethod(publisher);
  await initRuntimes(registration);
}

module.exports = {
  initialize,
};
