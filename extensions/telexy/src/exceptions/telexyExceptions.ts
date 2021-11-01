export class TelexyException extends Error {
  /**
   *
   */
  constructor(public exeptionId: string, public message: string, public data: any) {
    super();
  }

  static PathIsNotAFile: string = 'Path is not a file!';
  static PathNotADirectory: string = 'Path is not a directory!';
  static NotIplemented: string = 'Not Implemented!';
  static NotAClass: string = 'Not a Class';
  static UnknownError: string = 'Unknown Error Encountered';
}

export class UnknownErrorException extends TelexyException {
  /**
   *
   */
  constructor(err: unknown) {
    super(TelexyException.UnknownError, TelexyException.UnknownError, err);
  }
}
export class PathIsNotAFileException extends TelexyException {
  /**
   *
   */
  constructor(public path: string) {
    super(TelexyException.PathIsNotAFile, TelexyException.PathIsNotAFile, path);
  }
}

export class PathIsNotADirectoryException extends TelexyException {
  /**
   *
   */
  constructor(public path: string) {
    super(TelexyException.PathNotADirectory, TelexyException.PathNotADirectory, path);
  }
}

/**
 * Not Implemented Exception!
 */
export class NotImplementedException extends TelexyException {
  /**
   *
   */
  constructor(details: string) {
    super(TelexyException.NotIplemented, TelexyException.NotIplemented, details);
  }
}

/**
 * Not Implemented Exception!
 */
export class NotAClassException extends TelexyException {
  /**
   *
   */
  constructor(obj: string) {
    super(TelexyException.NotAClass, TelexyException.NotAClass, obj);
  }
}

export class ApiException extends Error {
  message: string;
  status: number;
  response: string;
  headers: { [key: string]: any };
  result: any;

  constructor(message: string, status: number, response: string, headers: { [key: string]: any }, result: any) {
    super();

    this.message = message;
    this.status = status;
    this.response = response;
    this.headers = headers;
    this.result = result;
  }

  protected isApiException = true;

  static isApiException(obj: any): obj is ApiException {
    return obj.isApiException === true;
  }
}
