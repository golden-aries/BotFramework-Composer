export type FolderFsEntry = 'folder';
export type FileFsEntry = 'file';
export type BotFsEntry = 'bot';
export type RootFsEntryName = '/';
export type FsEntryType = BotFsEntry | FolderFsEntry | FileFsEntry;

export interface IBlobRootContent {
  name: string;
  parent: RootFsEntryName;
  writeable: boolean;
  children: IBlobRootChildContent[];
}

export interface IBlobRootChildContent {
  name: string;
  type: string;
  path: FsEntryType;
  writeable: boolean;
}

export interface IBlobFolderContent {
  name: string;
  parent: string;
  writeable: boolean;
  children: IBlobFolderChildContent[];
}

export interface IBlobFolderChildContent {
  name: string;
  type: FsEntryType;
  path: string;
  lastModified: string;
  size: string;
}
