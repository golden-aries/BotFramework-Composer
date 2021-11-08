import { IFileStorage, ILogger, IPathConvertor, MakeDirectoryOptions, Stat } from '../common/interfaces';
import { PathIsNotADirectoryException, PathIsNotAFileException, UnknownError } from '../exceptions/telexyExceptions';
//import { IFileStorage, Stat, MakeDirectoryOptions } from '../../../../Composer/packages/server/src/models/storage/interface';
import { CMFusionFSItemWrapper, FileStat, GlobParametersWrapper } from './telexyFs';
import { TelexyFsClient } from './telexyFsClient';

export class TelexyStorage implements IFileStorage {
  /**
   *
   */
  constructor(protected client: TelexyFsClient, protected logger: ILogger, protected pathConvertor: IPathConvertor) {}

  async stat(path: string): Promise<Stat> {
    try {
      this.logger.logTrace('stat %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const result = await this.client.stat(convertedPath);
      return this.toStat(result);
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API stat call!', { api: 'stat', path: path });
      this.logger.logError('%o', newErr);
      throw newErr;
    }
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
    try {
      this.logger.logTrace('readFile %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const result = await this.client.readFile(convertedPath);
      return result.data.text();
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API readFile call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  readFileSync(path: string): string {
    throw new Error('Method not implemented.');
  }

  protected getReadDirResult(result: CMFusionFSItemWrapper, path: string): string[] {
    if (result.id === 0 && path !== '/') {
      throw new Error(`Path {path} does not exists`);
    }
    return result.children!.map((i) => i.name!);
  }

  /** @inheritdoc */
  async readDir(path: string): Promise<string[]> {
    try {
      this.logger.logTrace('readDir %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const result = await this.client.browse(convertedPath, true, false);
      const convertedResults = this.getReadDirResult(result, convertedPath);
      return convertedResults;
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API readFile call!', { path: path });
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  readDirSync(path: string): string[] {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  async exists(path: string): Promise<boolean> {
    try {
      this.logger.logTrace('exists %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      await this.client.stat(convertedPath);
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
    try {
      this.logger.logTrace('writeFile %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      await this.client.writeFile(this.getWrapperForWriteFile(convertedPath, content));
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API writeFile call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
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
    try {
      this.logger.logTrace('removeFile %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const stat = await this.client.stat(convertedPath);
      await this.client.delete(this.getWrapperForRemoveFile(stat, convertedPath));
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API removeFile call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
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
    try {
      this.logger.logTrace('mkDir %s %s', path, options);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      if (options?.recursive) {
        await this.client.createDirectoryRecursive(convertedPath);
      } else {
        await this.client.create(this.getWrapperForMkDir(convertedPath));
      }
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API mkDir call!');
      this.logger.logError('%o', newErr);
      throw newErr;
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
    try {
      this.logger.logTrace('rmDir %s', path);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const stat = await this.client.stat(convertedPath);
      await this.client.delete(this.getWrpapperForRmDir(stat, convertedPath));
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API rmDir call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
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

  private _transformGlobResult(value: string, index: number, array: string[]): string {
    return this.pathConvertor.toLocalPath(value);
  }

  protected transformGlobResults(values: string[]): string[] {
    return !!values ? values.map((value, index, array) => this._transformGlobResult(value, index, array)) : values;
  }

  async glob(pattern: string | string[], path: string): Promise<string[]> {
    try {
      this.logger.logTrace('glob %s %o', path, pattern);
      const convertedPath = this.pathConvertor.toStoragePath(path);
      const results = await this.client.glob(this.getWrapperForGlob(pattern, convertedPath));
      return this.transformGlobResults(results);
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API glob call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  globSync(pattern: string | string[], path: string): string[] {
    throw new Error('Method not implemented.');
  }

  async copyFile(src: string, dest: string): Promise<void> {
    try {
      this.logger.logTrace('copyFile %s %o', src, dest);
      const convertedPath = this.pathConvertor.toStoragePath(src);
      var srcContent = await this.readFile(convertedPath);
      var wrapper = new CMFusionFSItemWrapper();
      wrapper.path = this.pathConvertor.toStoragePath(dest);
      wrapper.stringContent = srcContent;
      await this.client.writeFile(wrapper);
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API copyFile call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      this.logger.logTrace('rename %s %s', oldPath, newPath);
      await this.client.move(this.pathConvertor.toStoragePath(oldPath), this.pathConvertor.toStoragePath(newPath));
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API mkDir call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }

  zip(source: string, exclusions: { files: string[]; directories: string[] }, cb: any): unknown {
    try {
      this.logger.logTrace('zip %s %o', source, exclusions);
      throw new Error('Method zip not implemented.');
    } catch (err) {
      const newErr = new UnknownError(err, 'Error occured during storage API zip call!');
      this.logger.logError('%o', newErr);
      throw newErr;
    }
  }
}
