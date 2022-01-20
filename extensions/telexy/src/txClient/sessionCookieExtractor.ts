import { ITxServerInfo } from '../common/iTxServerInfo';

export class SessionCookieExtractor {
  /**
   * converts session cookie which is a sring in json format
   * into a string of name/value pairs divided by semicolon
   *  */
  static getSessionCookie(serverInfo: ITxServerInfo): string {
    let cookie: [{ name: string; value: string }];
    try {
      const cookieStr = serverInfo.sessionCookie;
      cookie = <[{ name: string; value: string }]>JSON.parse(cookieStr);
    } catch {
      throw new Error(`${this}: Cookie is not in JSON parseable format!`);
    }
    let result: string = '';
    cookie.forEach((element, index) => {
      if (index === 0) {
        result += `${element.name}=${element.value}`;
      } else {
        result += `; ${element.name}=${element.value}`;
      }
    });
    return result;
  }
}
