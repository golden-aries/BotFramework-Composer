import { ITelexyBotComposerExtensionSettings } from '../common/interfaces';
import { configuration } from '../configuration/configuration';

export let settings: ITelexyBotComposerExtensionSettings;

export async function initServices() {
  settings = await configuration.getSettings();
}
