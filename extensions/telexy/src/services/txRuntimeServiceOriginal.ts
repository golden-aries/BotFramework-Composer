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
export class TxRuntimeServiceOriginal implements IRuntime {
  key = 'adaptive-runtime-dotnet-webapp';
  name = 'C# - Web App';

  constructor(private _logger: ILogger) {}

  /** @inheritdoc */
  build = async (runtimePath: string, project: IBotProject) => {
    this._logger.logTrace(`BUILD THIS C# WEBAPP PROJECT! at ${runtimePath}...`);
    this._logger.logTrace('Run dotnet user-secrets init...');

    // TODO: capture output of this and store it somewhere useful
    const { stderr: initErr } = await execAsync(`dotnet user-secrets init --project ${project.name}.csproj`, {
      cwd: runtimePath,
    });
    if (initErr) {
      throw new Error(initErr);
    }

    this._logger.logInformation('Run dotnet build...');
    const { stderr: buildErr } = await execAsync(`dotnet build ${project.name}.csproj`, { cwd: runtimePath });
    if (buildErr) {
      throw new Error(buildErr);
    }
    this._logger.logInformation('FINISHED BUILDING!');
  };

  /** @inheritdoc */
  installComponent = async (
    runtimePath: string,
    packageName: string,
    version: string,
    source: string,
    project: IBotProject,
    isPreview = false
  ): Promise<string> => {
    // run dotnet install on the project
    const command = `dotnet add ${project.name}.csproj package "${packageName}"${
      version ? ' --version="' + version + '"' : ''
    }${source ? ' --source="' + source + '"' : ''}${isPreview ? ' --prerelease' : ''}`;
    this._logger.logInformation('EXEC:', command);
    const { stderr: installError, stdout: installOutput } = await execAsync(command, {
      cwd: path.join(runtimePath),
    });
    if (installError) {
      throw new Error(installError);
    }
    return installOutput;
  };

  /** @inheritdoc */
  uninstallComponent = async (runtimePath: string, packageName: string, project: IBotProject): Promise<string> => {
    // run dotnet install on the project
    this._logger.logInformation(`EXECUTE: dotnet remove ${project.name}.csproj package ${packageName}`);
    const { stderr: installError, stdout: installOutput } = await execAsync(
      `dotnet remove  ${project.name}.csproj package ${packageName}`,
      {
        cwd: path.join(runtimePath),
      }
    );
    if (installError) {
      throw new Error(installError);
    }
    return installOutput;
  };

  /** @inheritdoc */
  identifyManifest = (runtimePath: string, projName?: string): string => {
    return path.join(runtimePath, `${projName}.csproj`);
  };

  /** @inheritdoc */
  run: (project: IBotProject, localDisk?: any) => Promise<void> = async (
    project: IBotProject,
    localDisk: BfcFileStorage
  ) => {
    this._logger.logInformation('RUN THIS C# PROJECT!');
    return Promise.resolve();
  };

  /** @inheritdoc */
  buildDeploy = async (
    runtimePath: string,
    project: IBotProject,
    settings: DialogSetting,
    profileName: string
  ): Promise<string> => {
    this._logger.logInformation('BUILD FOR DEPLOY TO AZURE!');

    // find publishing profile in list
    const profile = project.settings!.publishTargets!.find((p) => p.name === profileName);

    const csproj = `${project.name}.csproj`;
    const publishFolder = path.join(runtimePath, 'bin', 'release', 'publishTarget');
    const deployFilePath = path.join(runtimePath, '.deployment');
    const dotnetProjectPath = path.join(runtimePath, csproj);

    // Check for existing .deployment file, if missing, write it.
    if (!(await fs.pathExists(deployFilePath))) {
      const data = `[config]\nproject = ${csproj}`;

      await fs.writeFile(deployFilePath, data);
    }

    // do the dotnet publish
    try {
      const configuration = JSON.parse(profile!.configuration);
      const runtimeIdentifier = configuration.runtimeIdentifier;

      // if runtime identifier set, make dotnet runtime to self contained, default runtime identifier is win-x64, please refer to https://docs.microsoft.com/en-us/dotnet/core/rid-catalog
      const buildCommand = `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q --self-contained true -r ${
        runtimeIdentifier ?? 'win-x64'
      }`;
      //  }
      const { stdout, stderr } = await execAsync(buildCommand, {
        cwd: runtimePath,
      });
      this._logger.logInformation('OUTPUT FROM BUILD', stdout);
      if (stderr) {
        this._logger.logInformation('ERR FROM BUILD: ', stderr);
      }
    } catch (err) {
      this._logger.logInformation('Error doing dotnet publish', err);
      throw err;
    }

    // return the location of the build artifiacts
    return publishFolder;
  };

  /** @inheritdoc */
  setSkillManifest = async (
    dstRuntimePath: string,
    dstStorage: BfcFileStorage,
    srcManifestDir: string,
    srcStorage: BfcFileStorage,
    mode = 'azurewebapp' // set default as azurewebapp
  ) => {
    // update manifst into runtime wwwroot
    if (mode === 'azurewebapp') {
      const manifestDstDir = path.resolve(dstRuntimePath, 'wwwroot', 'manifests');

      if (await fs.pathExists(manifestDstDir)) {
        await removeDirAndFiles(manifestDstDir);
      }

      if (await fs.pathExists(srcManifestDir)) {
        await copyDir(srcManifestDir, srcStorage, manifestDstDir, dstStorage);
      }
    }
  };

  path = '';
  startCommand = '';

  toString(): string {
    return 'TxRuntimeServiceOriginal';
  }
}
