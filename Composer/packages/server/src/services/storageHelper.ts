import { promises as fs } from 'fs';
import { IFileStorage } from '../models/storage/interface';
import { Path } from '../utility/path';
//import * as process from "process"

export class StorageHelper {
  /**
   *
   */
  constructor(private _storage: IFileStorage) {}

  async insureFolderIsInStorage(path: string): Promise<void> {
    try {
      let dstDir = path;
      // if (process.platform == "win32") {
      //     dstDir = dstDir.replace(/\\/g, '/');
      // }

      const exists = await this._storage.exists(dstDir);
      if (!exists) {
        await this.tranferFiles(dstDir);
      }
    } catch (err) {
      throw err;
    }
  }

  async tranferFiles(path: string): Promise<void> {
    const items = await fs.readdir(path);
    const count = items.length;
    for (let i = 0; i < count; i++) {
      const itemPath = Path.resolve(path, items[i]);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory()) {
        if (!(await this._storage.exists(itemPath))) {
          await this._storage.mkDir(itemPath, { recursive: true });
          await this.tranferFiles(itemPath);
        } else {
          const dirStat = await this._storage.stat(itemPath);
          if (!dirStat.isDir) {
            throw new Error(`File is not a directory! ${itemPath}`);
          }
        }
      } else {
        const content = await fs.readFile(itemPath);
        await this._storage.writeFile(itemPath, content.toString());
      }
    }
  }
}
