import { IBotProject, UserIdentity } from '@botframework-composer/types';
import { BotProject } from '../../../../../Composer/packages/server/build/models/bot/botProject';
import { IBuildConfig, LocationRef } from '../../../../../Composer/packages/server/build/models/bot/interface';
import { ITxClient } from '../../common/iTxClient';
import { TxClient } from '../../txClient/txClient';

export class TxBotProjectProxy {
  private _originalBuildFiles: ({
    luisConfig,
    qnaConfig,
    orchestratorConfig,
    luResource,
    qnaResource,
  }: IBuildConfig) => Promise<void>;

  /**
   *
   */
  constructor(public project: BotProject, private _txClient: ITxClient) {
    this._originalBuildFiles = project.buildFiles;
    project.buildFiles = this.newBuildFiles;
  }

  public newBuildFiles: (buildConfig: IBuildConfig) => Promise<void> = async (buildConfig: IBuildConfig) => {
    try {
      await this._originalBuildFiles(buildConfig);
    } catch (err) {
      throw err;
    }
  };
}

// export class TxBotProjectProxy extends BotProject implements IBotProject {
//     private _originalBuildFiles: ({ luisConfig, qnaConfig, orchestratorConfig, luResource, qnaResource, }: IBuildConfig) => Promise<void>;

//     /**
//      *
//      */
//     constructor(project: BotProject, user?: UserIdentity) {
//         super(project.ref, user, project.eTag);

//         this._originalBuildFiles = this.buildFiles;
//         this.buildFiles = this.newBuildFiles;
//     }

//     public newBuildFiles: (buildConfig: IBuildConfig) => Promise<void> = async (buildConfig: IBuildConfig) => {
//         try {
//             await this._originalBuildFiles(buildConfig);
//         }
//         catch (err) {
//             throw err;
//         }
//     }
// }

// export class TxBotProjectProxy {

//     public static initialize() {
//         try {
//             const originalBotProject = BotProject
//             //const originalBuildFiles = (<any>BotProject)._proto.buidFiles
//             console.log(`${originalBotProject} `) //${originalBuildFiles}
//         }
//         catch(err) {
//             console.error(err)
//         }
//     }
// }
