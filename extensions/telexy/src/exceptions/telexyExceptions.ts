import { logger } from '../services/serviceProvider';
export class BaseError extends Error {
  public data = new Map();
  /**
   *
   */
  constructor(public exceptionId: string, message?: string, public originalError?: unknown) {
    super(message ?? exceptionId);
    logger.logTrace('%s\n%o', message, originalError);
  }

  static PathIsNotAFile: string = 'Path is not a file!';
  static PathNotADirectory: string = 'Path is not a directory!';
  static NotIplemented: string = 'Not Implemented!';
  static NotAClass: string = 'Not a Class';
  static UnknownError: string = 'Unknown Error Encountered';
}

export class UnknownError extends BaseError {
  /**
   *
   */
  constructor(originalError?: unknown, message?: string) {
    super(BaseError.UnknownError, message, originalError);
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
