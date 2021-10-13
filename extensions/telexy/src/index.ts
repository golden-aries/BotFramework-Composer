import { IExtensionRegistration } from '@botframework-composer/types';
import { TelexyStorage } from './storage/telexyStorage';
import { TelexyPublisher } from './publish/telexyPublish';
import initRuntimes from './runtimes/telexyRuntimes';
async function initialize(registration: IExtensionRegistration): Promise<void> {
  registration.useStorage(TelexyStorage);
  const publisher = new TelexyPublisher(registration);
  // register this publishing method with Composer
  await registration.addPublishMethod(publisher);
  await initRuntimes(registration);
}
module.exports = {
  initialize,
};
