import { IncomingHttpHeaders } from 'http';
import { Options } from 'sync-request';

export class RequestOptionsBuilder {
  private _headers: IncomingHttpHeaders;
  private _method: string = 'POST';
  private _content?: string;

  /**
   *
   */
  constructor(apiKey: string) {
    this._headers = {
      'DS-ACCESS-KEY': apiKey,
    };
  }

  useMethod_Delete(): RequestOptionsBuilder {
    this._method = 'DELETE';
    return this;
  }

  withHeader_ContentType_ApplicationJson(): RequestOptionsBuilder {
    this._headers['Content-Type'] = 'application/json';
    return this;
  }

  withHeader_Accept_ApplicationJson(): RequestOptionsBuilder {
    this._headers['Accept'] = 'application/json';
    return this;
  }

  withHeader_Accept_ApplicationOctetStream(): RequestOptionsBuilder {
    this._headers['Accept'] = 'application/octet-stream';
    return this;
  }

  withData(data?: any): RequestOptionsBuilder {
    if (data) {
      this._headers = data['headers'];
      this._method = data['method'];
      this._content = data['content'];
    }
    return this;
  }

  withBody(content: string): RequestOptionsBuilder {
    this._content = content;
    return this;
  }

  buildSyncOptions(): Options {
    const obj: any = {
      headers: this._headers,
      body: this._content,
    };
    return <Options>obj;
  }

  buildRequestInit(): RequestInit {
    const obj: any = {
      headers: this._headers,
      body: this._content,
      method: this._method,
    };
    return <RequestInit>obj;
  }
}
