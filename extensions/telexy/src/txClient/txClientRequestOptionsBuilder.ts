import { IncomingHttpHeaders } from 'http';

export class TxClientRequestOptionsBuilder {
  private _headers: IncomingHttpHeaders;
  private _method: string = 'POST';
  private _content?: string;

  /**
   *
   */
  constructor(sessionCookie: string) {
    this._headers = {
      cookie: sessionCookie,
    };
    // some defaults
    this.withHeaderCharset_UTF8();
    this.useMethod_Get();
  }

  withHeaderCharset_UTF8(): TxClientRequestOptionsBuilder {
    this._headers['charset'] = 'UTF-8';
    return this;
  }

  useMethod_Get(): TxClientRequestOptionsBuilder {
    this._method = 'GET';
    return this;
  }

  useMethod_Delete(): TxClientRequestOptionsBuilder {
    this._method = 'DELETE';
    return this;
  }

  useMethod_Post(): TxClientRequestOptionsBuilder {
    this._method = 'POST';
    return this;
  }

  withHeader_ContentType_ApplicationJson(): TxClientRequestOptionsBuilder {
    this._headers['Content-Type'] = 'application/json';
    return this;
  }

  withHeader_Accept_ApplicationJson(): TxClientRequestOptionsBuilder {
    this._headers['Accept'] = 'application/json';
    return this;
  }

  withHeader_Accept_ApplicationOctetStream(): TxClientRequestOptionsBuilder {
    this._headers['Accept'] = 'application/octet-stream';
    return this;
  }

  withData(data?: any): TxClientRequestOptionsBuilder {
    if (data) {
      this._headers = data['headers'];
      this._method = data['method'];
      this._content = data['content'];
    }
    return this;
  }

  withBody(content: string): TxClientRequestOptionsBuilder {
    this._content = content;
    return this;
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
