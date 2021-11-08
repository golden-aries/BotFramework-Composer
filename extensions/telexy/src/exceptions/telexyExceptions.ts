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
  static FileOperationError: string = 'File operation error!';
  static CopyOperationError: string = 'File system copy operation error';
  static GlobOperationError: string = 'Glob operation error!';
  static RenameOperationError: string = 'Rename operation error!';
  static ZipOperationError: string = 'Zip operation error!';
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
export class TxFileSystemOperationError extends BaseError {
  /**
   *
   */
  constructor(path: string, originalError?: unknown, message?: string, data?: any) {
    super(BaseError.FileOperationError, message ?? BaseError.FileOperationError, originalError, data);
    data['path'] = path;
  }
}

export class TxCopyOperationError extends BaseError {
  /**
   *
   */
  constructor(src: string, dst: string, originalError?: unknown, message?: string, data?: any) {
    super(BaseError.CopyOperationError, message ?? BaseError.CopyOperationError, originalError, data);
    data['source'] = src;
    data['destination'] = dst;
  }
}
export class TxRenameOperationError extends BaseError {
  /**
   *
   */
  constructor(oldPath: string, newPath: string, originalError?: unknown, message?: string, data?: any) {
    super(BaseError.RenameOperationError, message ?? BaseError.RenameOperationError, originalError, data);
    data['oldPath'] = oldPath;
    data['newPath'] = newPath;
  }
}
export class TxGlobOperationError extends BaseError {
  /**
   *
   */
  constructor(path: string, glob: string | string[], originalError?: unknown, message?: string, data?: any) {
    super(BaseError.GlobOperationError, message ?? BaseError.GlobOperationError, originalError, data);
    data['path'] = path;
    data['glob'] = glob;
  }
}

export class TxZipOperationError extends BaseError {
  /**
   *
   */
  constructor(src: string, exclusions: string | string[], originalError?: unknown, message?: string, data?: any) {
    super(BaseError.ZipOperationError, message ?? BaseError.ZipOperationError, originalError, data);
    data['source'] = src;
    data['exclusions'] = exclusions;
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
