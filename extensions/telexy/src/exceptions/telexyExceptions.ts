export class BaseError extends Error {
  /**
   *
   */
  constructor(public exceptionId: string, message?: string, public originalError?: unknown, public data?: any) {
    super(message ?? exceptionId);
    //logger?.logTrace('%s\n%o', message, originalError);
  }

  static PathIsNotAFile: string = 'Path is not a file!';
  static PathNotADirectory: string = 'Path is not a directory!';
  static NotIplemented: string = 'Not Implemented!';
  static NotAClass: string = 'Not a Class';
  static UnknownError: string = 'Unknown Error Encountered';
  static UnableToLoadConfiguration: string = 'Unable to load configuration!';
}

export class UnknownError extends BaseError {
  /**
   *
   */
  constructor(originalError?: unknown, message?: string, data?: any) {
    super(BaseError.UnknownError, message, originalError, data);
  }
}
export class PathIsNotAFileException extends BaseError {
  /**
   *
   */
  constructor(public path: string) {
    super(BaseError.PathIsNotAFile, BaseError.PathIsNotAFile, path);
  }
}

export class PathIsNotADirectoryException extends BaseError {
  /**
   *
   */
  constructor(public path: string) {
    super(BaseError.PathNotADirectory, BaseError.PathNotADirectory, path);
  }
}

/**
 * Not Implemented Exception!
 */
export class NotImplementedException extends BaseError {
  /**
   *
   */
  constructor(details: string) {
    super(BaseError.NotIplemented, BaseError.NotIplemented, details);
  }
}

/**
 * Not Implemented Exception!
 */
export class NotAClassException extends BaseError {
  /**
   *
   */
  constructor(obj: string) {
    super(BaseError.NotAClass, BaseError.NotAClass, obj);
  }
}

export class UnableToLoadConfiguration extends BaseError {
  /**
   *
   */
  constructor(originalError?: unknown, message?: string, data?: any) {
    super(BaseError.UnableToLoadConfiguration, message ?? BaseError.UnableToLoadConfiguration, originalError, data);
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
