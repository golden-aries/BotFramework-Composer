import { IExtensionRegistration } from '@botframework-composer/types';
import { TelexyStorage } from './storage/telexyStorage';

function initialize(registration: IExtensionRegistration) {
  registration.useStorage(TelexyStorage);
}

module.exports = {
  initialize,
};
