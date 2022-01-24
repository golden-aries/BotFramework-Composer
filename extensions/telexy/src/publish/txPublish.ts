// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable security/detect-non-literal-fs-filename */
import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';

import max from 'lodash/max';
import map from 'lodash/map';
import portfinder from 'portfinder';
import { v4 as uuid } from 'uuid';
import killPort from 'kill-port';
import * as tcpPortUsed from 'tcp-port-used';
import {
  DialogSetting,
  PublishPlugin,
  IExtensionRegistration,
  IBotProject,
  UserIdentity,
} from '@botframework-composer/types';
import { RuntimeLogServerOriginal } from './txRuntimeLogServerOriginal';
import { ILogger, IProfiler } from '../common/interfaces';
import { TxBotProjectEx } from '../common/txBotProjectEx';
import { ITxClient } from '../common/iTxClient';

/** stores data about running bot */
interface RunningBot {
  process?: ChildProcess;
  port?: number;
  status: number;
  result: {
    message: string;
    runtimeLog?: string;
    runtimeError?: string;
  };
  name?: string;
  dir?: string;
  isTelexyHostedBot?: boolean;
}

export interface PublishConfig {
  botId: string;
  version: string;
  fullSettings: any;
}

const isWin = process.platform === 'win32';

// eslint-disable-next-line security/detect-unsafe-regex
const localhostRegex = /^https?:\/\/(localhost|127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|::1)/;

const isLocalhostUrl = (matchUrl: string) => {
  return localhostRegex.test(matchUrl);
};

const isSkillHostUpdateRequired = (skillHostEndpoint?: string) => {
  return !skillHostEndpoint || isLocalhostUrl(skillHostEndpoint);
};

const stringifyError = (error: any): string => {
  if (typeof error === 'object') {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } else {
    return error.toString();
  }
};

export class TxPublish implements PublishPlugin<PublishConfig> {
  public name = 'localpublish';
  public description = 'Publish bot to local runtime';
  static runningBots: { [key: string]: RunningBot } = {};

  constructor(
    private _composer: IExtensionRegistration,
    private _telexyBotForwarderPort: number,
    private _projectHelper: TxBotProjectEx,
    private _txClient: ITxClient,
    private _logger: ILogger,
    private _profiler: IProfiler
  ) {
    if (!this._composer) {
      throw new Error(`${this}.constructor: parameter _composer is falsy`);
    }

    if (!this._logger) {
      throw new Error(`${this}.constructor: parameter _logger is falsy`);
    }

    if (!this._profiler) {
      throw new Error(`${this}.constructor parameter _logger is falsy`);
    }
    this._logger.logTrace('%s created!', this);
  }

  private setBotStatus = (botId: string, data: RunningBot) => {
    const updatedBotData: RunningBot = {
      ...TxPublish.runningBots[botId],
      status: data.status,
    };

    this._composer.log(`SETTING STATUS OF ${botId} to port ${data.port} and status ${data.status}`);
    // preserve the pid and port if one is available
    if (data.process && !TxPublish.runningBots[botId]?.process) {
      updatedBotData.process = data.process;
    }

    if (data.port && !TxPublish.runningBots[botId]?.port) {
      updatedBotData.port = data.port;
    }

    if (data.result.message) {
      updatedBotData.result = {
        ...updatedBotData.result,
        message: data.result.message,
      };
    }
    TxPublish.runningBots[botId] = updatedBotData;
  };

  private appendRuntimeLogs = (botId: string, newContent: string, logType: 'stdout' | 'stderr' = 'stdout') => {
    const botData = TxPublish.runningBots[botId];
    if (logType === 'stdout') {
      const runtimeLog = botData.result.runtimeLog ? botData.result.runtimeLog + newContent : newContent;
      TxPublish.runningBots[botId] = {
        ...botData,
        result: {
          ...botData.result,
          runtimeLog,
        },
      };
    } else {
      const runtimeError = botData.result.runtimeError ? botData.result.runtimeError + newContent : newContent;
      TxPublish.runningBots[botId] = {
        ...botData,
        result: {
          ...botData.result,
          runtimeError: runtimeError,
        },
      };
    }
    RuntimeLogServerOriginal.sendRuntimeLogToSubscribers(
      botId,
      TxPublish.runningBots[botId].result.runtimeLog ?? '',
      TxPublish.runningBots[botId].result.runtimeError ?? ''
    );
  };

  private isPortUsed = (port: number) => {
    for (const key in TxPublish.runningBots) {
      const bot = TxPublish.runningBots[key];
      if (bot?.port === port) {
        return true;
      }
    }
    return false;
  };

  private publishAsync = async (
    botId: string,
    version: string,
    fullSettings: DialogSetting,
    project: IBotProject,
    user: any
  ) => {
    try {
      this._logger.logTrace('%s.publishAsync %s, %s', this, botId, version);
      const t = this._profiler.hrtime();
      let port;
      if (TxPublish.runningBots[botId]) {
        this._composer.log('Bot already running. Stopping bot...');
        // this may or may not be set based on the status of the bot
        port = TxPublish.runningBots[botId].port;
        await this.stopBot(botId);
      }
      if (!port) {
        let isTelexyHostedProject: boolean = false;
        if (this._projectHelper.isTelexyHostedProject(project)) {
          port = this._telexyBotForwarderPort;
          isTelexyHostedProject = true;
        } else {
          // Portfinder is the stablest amongst npm libraries for finding ports. https://github.com/http-party/node-portfinder/issues/61. It does not support supplying an array of ports to pick from as we can have a race conidtion when starting multiple bots at the same time. As a result, getting the max port number out of the range and starting the range from the max.
          const maxPort = max(map(TxPublish.runningBots, 'port')) ?? 3979;
          const retry = 10;
          let i = 0;
          do {
            port = await portfinder.getPortPromise({ port: maxPort + 1, stopPort: 6000 });
            i++;
          } while (this.isPortUsed(port) && i < retry);
        }
        const updatedBotData: RunningBot = {
          ...TxPublish.runningBots[botId],
          port,
          name: project.name,
          dir: project.dir,
          isTelexyHostedBot: isTelexyHostedProject,
        };
        TxPublish.runningBots[botId] = updatedBotData;
      }

      const runtime = this._composer.getRuntimeByProject(project);
      if (project.settings?.runtime.path && project.settings.runtime.command) {
        const runtimePath = project.getRuntimePath();
        this._logger.logTrace('%s.publishAsync launch building %s, %s', this, botId, version);
        await runtime.build(runtimePath, project, fullSettings, port);
        this._profiler.loghrtime('TelexyPublisher build finished', botId, t);
      } else {
        throw new Error('Custom runtime settings are incomplete. Please specify path and command.');
      }
      await this.setBot(botId, version, fullSettings, project, port);
      this._profiler.loghrtime('TelexyPublisher started', botId, t);
    } catch (error) {
      await this.stopBot(botId);
      this.setBotStatus(botId, {
        status: 500,
        result: {
          message: stringifyError(error),
        },
      });
    }
  };

  // config include botId and version, project is content
  publish = async (config: PublishConfig, project: IBotProject, metadata: any, user?: UserIdentity): Promise<any> => {
    const { fullSettings } = config;
    const botId = project.id;
    const version = 'default';

    this._composer.log('Starting publish');

    // set the running bot status
    this.setBotStatus(botId!, {
      status: 202,
      result: { message: 'Reloading...' },
    });

    try {
      // start or restart the bot process
      // do NOT await this, as it can take a long time
      this.publishAsync(botId!, version, fullSettings, project, user);
      return {
        status: 202,
        result: {
          id: uuid(),
          message: 'Local publish success.',
        },
      };
    } catch (error) {
      return {
        status: 500,
        result: {
          message: stringifyError(error),
        },
      };
    }
  };

  getStatus = async (config: PublishConfig, project: any, user: any) => {
    const botId = project.id;
    if (TxPublish.runningBots[botId]) {
      if (TxPublish.runningBots[botId].status === 200) {
        const port = TxPublish.runningBots[botId].port;
        const url = `http://localhost:${port}`;
        return {
          status: 200,
          result: {
            message: 'Running',
            port,
            endpointURL: url,
          },
        };
      } else {
        const publishResult = {
          status: TxPublish.runningBots[botId].status,
          result: TxPublish.runningBots[botId].result,
        };
        if (TxPublish.runningBots[botId].status === 500) {
          // after we return the 500 status once, delete it out of the running bots list.
          delete TxPublish.runningBots[botId];
        }
        return publishResult;
      }
    } else {
      return {
        status: 404,
        result: {
          message: 'Status cannot be obtained for this bot.',
        },
      };
    }
  };

  setupRuntimeLogServer = async (projectId: string) => {
    await RuntimeLogServerOriginal.init();
    return RuntimeLogServerOriginal.getRuntimeLogStreamingUrl(projectId);
  };

  // start bot in current version

  private setBot = async (botId: string, version: string, settings: any, project: IBotProject, port: number) => {
    // get port, and stop previous bot if exist
    try {
      if (this._projectHelper.isTelexyHostedProject(project)) {
        await this.startBot(botId, port, settings, project);
      } else {
        // if a port (e.g. --port 5000) is configured in the custom runtime command try to parse and set this port
        if (settings.runtime.command && settings.runtime.command.includes('--port')) {
          try {
            port = parseInt(/--port (\d+)/.exec(settings.runtime.command)![1]);
          } catch (err) {
            console.warn(`Custom runtime command has an invalid port argument.`);
          }
        }
        // start the bot process
        await this.startBot(botId, port, settings, project);
      }
    } catch (error) {
      await this.stopBot(botId);
      this.setBotStatus(botId, {
        status: 500,
        result: {
          message: stringifyError(error),
        },
      });
    }
  };

  private startBot = async (botId: string, port: number, settings: any, project: IBotProject): Promise<string> => {
    const botDir = project.getRuntimePath();

    if (this._projectHelper.isTelexyHostedProject(project)) {
      this.setBotStatus(botId, {
        port: port,
        status: 200,
        result: { message: 'Runtime started' },
      });
      return 'Runtime started';
    } else {
      const commandAndArgs =
        settings.runtime?.customRuntime === true
          ? settings.runtime.command.split(/\s+/)
          : this._composer.getRuntimeByProject(project).startCommand.split(/\s+/);

      return new Promise((resolve, reject) => {
        // ensure the specified runtime path exists
        if (!fs.existsSync(botDir)) {
          reject(`Runtime path ${botDir} does not exist.`);
          return;
        }
        // take the 0th item off the array, leaving just the args
        this._composer.log('Starting bot on port %d. (%s)', port, commandAndArgs.join(' '));
        const startCommand = commandAndArgs.shift();

        let config: string[] = [];
        let skillHostEndpoint;
        if (isSkillHostUpdateRequired(settings?.skillHostEndpoint)) {
          // Update skillhost endpoint only if ngrok url not set meaning empty or localhost url
          skillHostEndpoint = `http://127.0.0.1:${port}/api/skills`;
        }
        config = this.getConfig(settings, skillHostEndpoint);
        let spawnProcess: any;
        const args = [...commandAndArgs, '--port', port, `--urls`, `http://0.0.0.0:${port}`, ...config];
        this._composer.log('Executing command with arguments: %s %s', startCommand, args.join(' '));
        try {
          spawnProcess = spawn(startCommand, args, {
            cwd: botDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: !isWin, // detach in non-windows
            shell: true, // run in a shell on windows so `npm start` doesn't need to be `npm.cmd start`
          });
          this._composer.log('Started process %d', spawnProcess.pid);
          this.setBotStatus(botId, {
            process: spawnProcess,
            port,
            status: 202,
            result: { message: 'Starting runtime' },
          });

          // check if the port if ready for connecting, issue: https://github.com/microsoft/BotFramework-Composer/issues/3728
          // retry every 500ms, timeout 2min
          const retryTime = 500;
          const timeOutTime = 120000;
          const processLog = this._composer.log.extend(spawnProcess.pid);
          this.addListeners(spawnProcess, botId, processLog);

          tcpPortUsed.waitUntilUsedOnHost(port, '0.0.0.0', retryTime, timeOutTime).then(
            () => {
              this.setBotStatus(botId, {
                process: spawnProcess,
                port: port,
                status: 200,
                result: { message: 'Runtime started' },
              });
              resolve('Runtime started');
            },
            (err) => {
              reject(`Bot on localhost:${port} not working, error message: ${err.message}`);
            }
          );
        } catch (err) {
          reject(err);
          throw err;
        }
      });
    }
  };

  private getConfig = (config: DialogSetting, skillHostEndpointUrl?: string): string[] => {
    const configList: string[] = [];
    if (config.MicrosoftAppPassword) {
      configList.push('--MicrosoftAppPassword');
      configList.push(`"${config.MicrosoftAppPassword}"`);
    }
    if (config.luis && (config.luis.endpointKey || config.luis.authoringKey)) {
      configList.push('--luis:endpointKey');
      configList.push(config.luis.endpointKey || config.luis.authoringKey);
    }
    if (config.qna.endpointKey) {
      configList.push('--qna:endpointKey');
      configList.push(config.qna.endpointKey);
    }

    if (skillHostEndpointUrl) {
      configList.push('--SkillHostEndpoint');
      configList.push(skillHostEndpointUrl);
    }

    return configList;
  };

  private removeListener = (child: ChildProcess) => {
    child.stdout!.removeAllListeners('data');
    child.stderr!.removeAllListeners('data');

    child.removeAllListeners('message');
    child.removeAllListeners('error');
    child.removeAllListeners('exit');
  };

  private addListeners = (
    child: ChildProcess,
    botId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: (...args: any[]) => void
  ) => {
    let errOutput = '';
    child.stdout &&
      child.stdout.on('data', (data: any) => {
        const runtimeData = data.toString();
        this.appendRuntimeLogs(botId, runtimeData);
        logger('%s', data.toString());
      });

    child.stderr &&
      child.stderr.on('data', (err: any) => {
        errOutput += err.toString();
      });

    child.on('exit', (code) => {
      if (code !== 0) {
        logger('error on exit: %s, exit code %d', errOutput, code);
        if (TxPublish.runningBots[botId].status === 200) {
          this.appendRuntimeLogs(botId, errOutput, 'stderr');
        }
        this.setBotStatus(botId, {
          status: 500,
          result: { message: errOutput },
        });
      }
    });

    child.on('error', (err) => {
      this.setBotStatus(botId, {
        status: 500,
        result: { message: err.message },
      });
    });

    child.on('message', (msg) => {
      logger('%s', msg);
    });
  };

  // make it public, so that able to stop runtime before switch ejected runtime.
  public stopBot = async (botId: string): Promise<void> => {
    const runningBot = TxPublish.runningBots[botId];
    if (runningBot.isTelexyHostedBot) {
      await this._txClient.resetBot(runningBot.name!);
    } else {
      const proc = TxPublish.runningBots[botId]?.process;
      const port = TxPublish.runningBots[botId]?.port;

      if (port) {
        this._composer.log('Killing process at port %d', port);

        await new Promise((resolve, reject) => {
          setTimeout(async () => {
            killPort(port)
              .then(() => {
                if (proc) {
                  this.removeListener(proc);
                }
                delete TxPublish.runningBots[botId];
                resolve('Stopped');
              })
              .catch((err: any) => {
                reject(err);
              });
          }, 1000);
        });
      }
    }
  };

  static stopAll = () => {
    for (const botId in TxPublish.runningBots) {
      const bot = TxPublish.runningBots[botId];
      // Kill the bot process AND all child processes
      try {
        process.kill(isWin ? bot.process!.pid : -bot.process!.pid);
      } catch (err) {
        // swallow this error which happens if the child process is already gone
      }
      delete TxPublish.runningBots[botId];
    }
  };

  toString(): string {
    return 'TxPublishLocal';
  }
}

// stop all the runningBot when process exit
const cleanup = () => {
  TxPublish.stopAll();
  process.exit(0);
};

(['SIGINT', 'SIGTERM', 'SIGQUIT'] as NodeJS.Signals[]).forEach((signal: NodeJS.Signals) => {
  process.on(signal, cleanup.bind(null, signal));
});
