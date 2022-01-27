import { IBotProject } from '@botframework-composer/types';
import path from 'path';
import { TxPath } from './txPath';

/** project related utilities */
export class TxBotProjectEx {
  /**
   *
   */
  constructor(private _botsFolder: string, private _txPath: TxPath) {}

  /** return true is project is a telexy hosted project */
  public isTelexyHostedProject(project: IBotProject): boolean {
    return this._txPath.isChildOf(project.dir, this._botsFolder);
  }

  /** return true is project is a telexy hosted project */
  public getTelexyBotName(project: IBotProject): string {
    if (this._txPath.isChildOf(project.dir, this._botsFolder)) {
      return path.basename(project.dir);
    }
    return '';
  }
}
