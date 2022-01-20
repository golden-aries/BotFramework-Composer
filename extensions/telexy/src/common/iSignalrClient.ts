import { ISignalrHub } from './iSignalrHub';

export interface ISignalrClient {
  abort(): void;

  /**
   * returns hub interface
   * @param ciHubName  Hub Name (case insensitive)
   */
  hub(ciHubName: string): ISignalrHub;
  start(): void;
  serviceHandlers: any;
  headers: { [key: string]: string };

  /**
   * Binding callbacks from signalr hub
   * @param ciHubName Hub Name (case insensitive)
   * @param ciMethodName  Method Name (case insensitive)
   * @param cb Callback function with parameters matching call from hub
   */
  on(ciHubName: string, ciMethodName: string, cb: (...args: any[]) => void): void;
}
