export type FolderFsEntry = 'folder';
export type FileFsEntry = 'file';
export type BotFsEntry = 'bot';
export type RootFsEntryName = '/';
export type FsEntryType = BotFsEntry | FolderFsEntry | FileFsEntry;

export interface IBlobContent<T> {
  name: string;
  parent: string;
  writeable: boolean;
  children: T[];
}
export interface IBlobRootContent extends IBlobContent<IBlobRootChildContent> {
  parent: RootFsEntryName;
}
export interface IBlobFolderContent extends IBlobContent<IBlobFolderChildContent> {}

export interface IBlobFolderContentRaw extends IBlobContent<IBlobFolderChildContentRaw> {}
export interface IBlobRootChildContent {
  name: string;
  type: string;
  path: FsEntryType;
  writeable: boolean;
}

export interface IBlobFolderChildContent {
  name: string;
  type: FsEntryType;
  path: string;
  lastModified: string; // this property is for backward compatibility
  size: string; // this property is for backward compatibility
}

export interface IBlobFolderChildContentRaw {
  name: string;
  writeable: boolean;
  created: string;
}
