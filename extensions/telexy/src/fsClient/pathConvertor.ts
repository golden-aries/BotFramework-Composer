import path from 'path';
import { IPathConvertor } from '../common/interfaces';

export class PathConvertor implements IPathConvertor {
  /**
   *
   */
  constructor(protected localRoot: string, protected storageRoot: string = '/', protected storageSep: string = '/') {}

  toStoragePath(localPath: string): string {
    let relativePath = path.relative(this.localRoot, this.transformAndCheckPath(localPath));
    relativePath = relativePath.replace(path.sep, this.storageSep);
    return this.storageRoot + this.storageSep + relativePath;
  }

  toLocalPath(storagePath: string) {
    let relativePath = path.relative(this.storageRoot, this.transformAndCheckPath(storagePath));
    relativePath = relativePath.replace(this.storageSep, path.sep);
    return path.join(this.localRoot, relativePath);
  }

  protected transformAndCheckPath(path: string): string {
    let transformedPath = path.trim();
    if (!transformedPath) {
      throw new Error('Path is expected');
    }
    return transformedPath;
  }
}
