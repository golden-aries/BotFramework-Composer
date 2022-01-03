import path from 'path';
import { IPathConvertor } from '../common/interfaces';

export class PathConvertor implements IPathConvertor {
  /**
   *
   */
  constructor(protected localRoot: string, protected storageRoot: string = '/', protected storageSep: string = '/') {}

  toStoragePath(localPath: string): string {
    let relativePath = path.relative(this.localRoot, this.transformAndCheckPath(localPath));
    relativePath = relativePath.split(path.sep).join(this.storageSep);
    return path.posix.join(this.storageRoot, relativePath);
  }

  toLocalPath(storagePath: string) {
    let relativePath = path.relative(this.storageRoot, this.transformAndCheckPath(storagePath));
    relativePath = relativePath.split(this.storageSep).join(path.sep);
    return path.join(this.localRoot, relativePath);
  }

  protected transformAndCheckPath(path: string): string {
    let transformedPath = path.trim();
    if (!transformedPath) {
      throw new Error('Path is expected');
    }
    return transformedPath;
  }

  join(...paths: string[]): string {
    if (this.storageRoot === '/' && this.storageSep === '/') {
      return path.posix.join(...paths);
    }
    throw new Error('Not implemented yet!');
  }
}
