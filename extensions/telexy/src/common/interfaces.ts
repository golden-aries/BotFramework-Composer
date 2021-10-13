export interface IBotComposerLogger {
  (message?: any, ...optionalParams: any[]): void;
}

export interface ILogger {
  logInformation: (message?: any, ...optionalParams: any[]) => void;
  logError: (message?: any, ...optionalParams: any[]) => void;
  logTrace: (message?: any, ...optionalParams: any[]) => void;
}

export interface ITelexyBotComposerExtensionSettings {
  cloudUrl: string;
  apiKey: string;
  logTrace: boolean;
}

export function isTelexyBotComposerExtensionSettings(obj: any): obj is ITelexyBotComposerExtensionSettings {
  return obj && 'cloudUrl' in obj && 'apiKey' in obj && 'logTrace' in obj;
}
