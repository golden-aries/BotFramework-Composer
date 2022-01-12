import { DialogSetting, IBotProject, IExtensionRegistration } from '@botframework-composer/types';
import { IRuntime } from '../common/iRuntime';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
// import { IFileStorage } from "../common/iFileStorage";
import { BfcFileStorage } from '../runtimes/interface';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import { copyDir } from '../runtimes/copyDir';
import { ILogger } from '../common/interfaces';
const removeDirAndFiles = promisify(rimraf);

const execAsync = promisify(exec);

/** @inheritdoc */
export class TxOriginalRuntimeService implements IRuntime {
  key = 'adaptive-runtime-dotnet-webapp';
  name = 'C# - Web App';

  constructor(private _logger: ILogger) {}

  private _buildName: string = 'build';
  /** @inheritdoc */
  build = async (runtimePath: string, project: IBotProject) => {
    this._logger.logTrace('%s %s', this, this._buildName);
    throw new Error('Not impelmented yet!');
  };

  private _installComponentName: string = 'installComponent';
  /** @inheritdoc */
  installComponent = async (
    runtimePath: string,
    packageName: string,
    version: string,
    source: string,
    project: IBotProject,
    isPreview = false
  ): Promise<string> => {
    this._logger.logTrace('%s %s', this, this._installComponentName);
    throw new Error('Not impelmented yet!');
  };

  private _uninstallComponent: string = 'uninstallComponent';
  /** @inheritdoc */
  uninstallComponent = async (runtimePath: string, packageName: string, project: IBotProject): Promise<string> => {
    this._logger.logTrace('%s %s', this, this._uninstallComponent);
    throw new Error('Not impelmented yet!');
  };

  private _identifyManifest: string = 'identifyManifest';
  /** @inheritdoc */
  identifyManifest = (runtimePath: string, projName?: string): string => {
    this._logger.logTrace('%s %s', this, this._identifyManifest);
    throw new Error('Not impelmented yet!');
  };

  private _runName: string = 'run';
  /** @inheritdoc */
  run: (project: IBotProject, localDisk?: any) => Promise<void> = async (
    project: IBotProject,
    localDisk: BfcFileStorage
  ) => {
    this._logger.logTrace('%s %s', this, this._runName);
    throw new Error('Not impelmented yet!');
  };

  private _buildDeployName: string = 'buildDeploy';
  /** @inheritdoc */
  buildDeploy = async (
    runtimePath: string,
    project: IBotProject,
    settings: DialogSetting,
    profileName: string
  ): Promise<string> => {
    this._logger.logTrace('%s %s', this, this._buildDeployName);
    throw new Error('Not impelmented yet!');
  };

  private _setSkillManifestName: string = 'setSkillManifest';
  /** @inheritdoc */
  setSkillManifest = async (
    dstRuntimePath: string,
    dstStorage: BfcFileStorage,
    srcManifestDir: string,
    srcStorage: BfcFileStorage,
    mode = 'azurewebapp' // set default as azurewebapp
  ) => {
    this._logger.logTrace('%s %s', this, this._setSkillManifestName);
    throw new Error('Not impelmented yet!');
  };

  path = '';
  startCommand = '';

  toString(): string {
    return 'TxRuntimeService';
  }
}
