import { ILogger, IProfiler, ISettings } from './interfaces';
import { Span } from './span';
import * as util from 'util';

/** @inheritdoc */
export class Profiler implements IProfiler {
  constructor(private _settings: ISettings, private _logger: ILogger) {}
  hrtime(): bigint | undefined {
    if (this._settings.performanceProfiling) {
      process.hrtime.bigint();
      return process.hrtime.bigint();
    }
    return undefined;
  }

  /** @deprecated use log instead */
  loghrtime(msg: any, details: any, previousTime?: bigint): void {
    if (previousTime) {
      const elapsed = process.hrtime.bigint() - previousTime;
      const span = new Span(elapsed);

      if (!!details) {
        this._logger.logTrace('%s %s finished in %s', msg, details, span);
      } else {
        this._logger.logTrace('%s finished in %s', msg, span);
      }
    }
  }

  log(previousTime: bigint | undefined, format: string, ...optionalParams: any[]): void {
    if (previousTime) {
      const elapsed = process.hrtime.bigint() - previousTime;
      const span = new Span(elapsed);
      this._logger.logTrace('%s finished in %s', util.format(format, ...optionalParams), span);
    }
  }
}
