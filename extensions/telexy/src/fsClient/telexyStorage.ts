import { IFileStorage, ILogger, MakeDirectoryOptions, Stat } from '../common/interfaces';
import { PathIsNotADirectoryException, PathIsNotAFileException } from '../exceptions/telexyExceptions';

//import { IFileStorage, Stat, MakeDirectoryOptions } from '../../../../Composer/packages/server/src/models/storage/interface';
import { CMFusionFSItemWrapper, FileStat, GlobParametersWrapper } from './telexyFs';
import { TelexyFsClient } from './telexyFsClient';

export class TelexyStorage implements IFileStorage {
  /**
   *
   */
  constructor(protected client: TelexyFsClient, protected logger: ILogger) {}

  async stat(path: string): Promise<Stat> {
    const result = await this.client.stat(path);
    return this.toStat(result);
  }

  protected toStat(stat: FileStat): Stat {
    return {
      isDir: stat.isDir!,
      isFile: !stat.isDir!,
      isWritable: true,
      lastModified: stat.modified!.toLocaleDateString(),
      size: stat.size!.toString(),
    };
  }

  statSync(path: string): Stat {
    throw new Error('Method not implemented.');
  }

  async readFile(path: string): Promise<string> {
    const result = await this.client.readFile(path);
    return result.data.text();
  }

  readFileSync(path: string): string {
    throw new Error('Method not implemented.');
  }

  protected transformAndCheckPath(path: string): string {
    let transformedPath = path.trim();
    if (!transformedPath) {
      throw new Error('Path is expected');
    }
    return transformedPath;
  }

  protected getReadDirResult(result: CMFusionFSItemWrapper, path: string): string[] {
    if (result.id === 0 && path !== '/') {
      throw new Error(`Path {path} does not exists`);
    }
    return result.children!.map((i) => i.name!);
  }
  /** @inheritdoc */
  async readDir(path: string): Promise<string[]> {
    let transformedPath = this.transformAndCheckPath(path);
    const result = await this.client.browse(transformedPath, true, false);
    return this.getReadDirResult(result, transformedPath);
  }

  readDirSync(path: string): string[] {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  async exists(path: string): Promise<boolean> {
    try {
      await this.client.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  existsSync(path: string): boolean {
    throw new Error('Method not implemented.');
  }

  protected getWrapperForWriteFile(path: string, content: any): CMFusionFSItemWrapper {
    let wrapper = new CMFusionFSItemWrapper();
    wrapper.path = path;
    wrapper.isFolder = false;
    switch (typeof content) {
      case 'string':
        wrapper.stringContent = content;
      default:
        wrapper.stringContent = content?.toString();
    }
    return wrapper;
  }
  async writeFile(path: string, content: any): Promise<void> {
    await this.client.writeFile(this.getWrapperForWriteFile(path, content));
  }

  writeFileSync(path: string, content: any): void {
    throw new Error('Method not implemented.');
  }

  protected getWrapperForRemoveFile(stat: FileStat, path: string): CMFusionFSItemWrapper {
    if (stat.isDir) {
      throw new PathIsNotAFileException(path);
    }
    const item = new CMFusionFSItemWrapper();
    item.id = stat.id;
    item.isFolder = false;
    return item;
  }

  async removeFile(path: string): Promise<void> {
    const normalizedPath = this.transformAndCheckPath(path);
    const stat = await this.client.stat(normalizedPath);
    await this.client.delete(this.getWrapperForRemoveFile(stat, path));
  }

  removeFileSync(path: string): void {
    throw new Error('Method not implemented.');
  }

  protected getWrapperForMkDir(path: string): CMFusionFSItemWrapper {
    const item = new CMFusionFSItemWrapper();
    item.path = path;
    item.isFolder = true;
    item.stringContent = '';
    return item;
  }

  async mkDir(path: string, options?: MakeDirectoryOptions): Promise<void> {
    if (options?.recursive) {
      await this.client.createDirectoryRecursive(path);
    } else {
      await this.client.create(this.getWrapperForMkDir(path));
    }
  }

  mkDirSync(path: string, options?: MakeDirectoryOptions): void {
    throw new Error('Method not implemented.');
  }

  protected getWrpapperForRmDir(stat: FileStat, path: string): CMFusionFSItemWrapper {
    if (!stat.isDir) {
      throw new PathIsNotADirectoryException(path);
    }
    const item = new CMFusionFSItemWrapper();
    item.id = stat.id;
    return item;
  }

  async rmDir(path: string): Promise<void> {
    const stat = await this.client.stat(path);
    await this.client.delete(this.getWrpapperForRmDir(stat, path));
  }

  rmDirSync(path: string): void {
    throw new Error('Method not implemented.');
  }

  rmrfDir(path: string): Promise<void> {
    return this.rmDir(path);
  }

  rmrfDirSync(path: string): void {
    throw new Error('Method not implemented.');
  }

  protected getWrapperForGlob(pattern: string | string[], path: string) {
    let patterns: string[] = [];
    if (Array.isArray(pattern)) {
      patterns = pattern;
    } else {
      patterns.push(pattern);
    }
    return new GlobParametersWrapper({ path: path, include: patterns });
  }
  async glob(pattern: string | string[], path: string): Promise<string[]> {
    return await this.client.glob(this.getWrapperForGlob(pattern, path));
  }

  globSync(pattern: string | string[], path: string): string[] {
    throw new Error('Method not implemented.');
  }

  async copyFile(src: string, dest: string): Promise<void> {
    var srcContent = await this.readFile(src);
    var wrapper = new CMFusionFSItemWrapper();
    wrapper.path = dest;
    wrapper.stringContent = srcContent;
    await this.client.writeFile(wrapper);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await this.client.move(oldPath, newPath);
  }

  zip(source: string, exclusions: { files: string[]; directories: string[] }, cb: any): unknown {
    throw new Error('Method not implemented.');
  }
}
