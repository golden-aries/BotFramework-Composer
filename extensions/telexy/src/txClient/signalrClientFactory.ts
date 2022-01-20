import { ISignalrClient } from '../common/iSignalrClient';

let signalR: any = require('signalr-client');
export class SignalrClientFactory {
  private _url: string;

  /**
   *
   */
  constructor(url: string, private _hubs: string[], private _sessionCookie: string) {
    //this._url = url.replace(/^http/, "ws")
    if (url.startsWith('https')) {
      this._url = `wss${url.slice(5)}`;
    } else {
      this._url = url;
    }
  }

  getSignalrClient(): Promise<ISignalrClient> {
    return new Promise((resolve, reject) => {
      const client: ISignalrClient = <ISignalrClient>(
        new signalR.client(`${this._url}/signalR`, this._hubs, undefined, true)
      );

      client.toString = () => 'ISignalrClient';

      client.headers = {
        cookie: this._sessionCookie,
      };

      client.serviceHandlers = {
        connected: (_connection: any) => {
          resolve(client);
        },
        connectFailed: (error: any) => {
          reject(error);
        },
      };

      client.start();
    });
  }

  toString(): string {
    return `TxSignalrClientFactory ${this._url}[${this._hubs}]`;
  }
}
