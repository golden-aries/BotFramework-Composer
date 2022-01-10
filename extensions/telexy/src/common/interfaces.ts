export interface IBotComposerLogger {
  (message?: any, ...optionalParams: any[]): void;
}

export interface ISettings {
  baseUrl: string;
  apiKey: string;
  logLevel: LogLevel;
  botsFolder: string;
  performanceProfiling: boolean;
  bfcServerCatalog: string;
}

export enum LogLevel {
  Trace = 0,
  Debug = 1,
  Information = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
  None = 6,
}

export interface ILogger {
  log: (logLevel: LogLevel, message?: any, ...optionalParams: any[]) => void;
  logInformation: (message?: any, ...optionalParams: any[]) => void;
  logError: (message?: any, ...optionalParams: any[]) => void;
  logTrace: (message?: any, ...optionalParams: any[]) => void;
  logDebug: (message?: any, ...optionalParams: any[]) => void;
  logWarning: (message?: any, ...optionalParams: any[]) => void;
  logCritical: (message?: any, ...optionalParams: any[]) => void;
}

export function isTelexyBotComposerExtensionSettings(obj: any): obj is ISettings {
  return obj && 'cloudUrl' in obj && 'apiKey' in obj && 'logTrace' in obj;
}

export interface IFetch {
  fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
}

export interface Stat {
  isDir: boolean;
  isFile: boolean;
  isWritable: boolean;
  lastModified: string;
  size: string;
}

export interface MakeDirectoryOptions {
  recursive?: boolean;
}

// export interface IFileStorage {
//   stat(path: string): Promise<Stat>;
//   statSync(path: string): Stat;
//   readFile(path: string): Promise<string>;
//   readFileSync(path: string): string;
//   readDir(path: string): Promise<string[]>;
//   readDirSync(path: string): string[];
//   exists(path: string): Promise<boolean>;
//   existsSync(path: string): boolean;
//   writeFile(path: string, content: any): Promise<void>;
//   writeFileSync(path: string, content: any): void;
//   removeFile(path: string): Promise<void>;
//   removeFileSync(path: string): void;
//   mkDir(path: string, options?: MakeDirectoryOptions): Promise<void>;
//   mkDirSync(path: string, options?: MakeDirectoryOptions): void;
//   rmDir(path: string): Promise<void>;
//   rmDirSync(path: string): void;
//   rmrfDir(path: string): Promise<void>;
//   rmrfDirSync(path: string): void;
//   glob(pattern: string | string[], path: string): Promise<string[]>;
//   globSync(pattern: string | string[], path: string): string[];
//   copyFile(src: string, dest: string): Promise<void>;
//   rename(oldPath: string, newPath: string): Promise<void>;
//   zip(source: string, exclusions: { files: string[]; directories: string[] }, cb: any): unknown;
// }

export interface IPathConvertor {
  toStoragePath(localPath: string): string;
  toLocalPath(storagePath: string): string;
  join(...paths: string[]): string;
}

/** simple performance profiler */
export interface IProfiler {
  hrtime(): bigint | undefined;
  log(previousTime: bigint | undefined, format: string, ...optionalParams: any[]): void;
  loghrtime(msg: any, details: any, previousTime?: bigint): void;
}
