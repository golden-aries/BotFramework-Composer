import util from 'util';
const nanosecondsInMinute = 60000000000;
const nanosecondsInSecond = 1000000000;
const nanosecondsInMilisecond = 1000000;
const nanosecondsInMicrosecond = 1000;

export class Span {
  private _span: number;

  /**
   *
   */
  constructor(span: bigint) {
    this._span = Number(span);
  }

  toString(): string {
    const min = Math.floor(this._span / nanosecondsInMinute);
    const sec = Math.floor((this._span - min * nanosecondsInMinute) / nanosecondsInSecond);
    const ms = Math.floor(
      (this._span - min * nanosecondsInMinute - sec * nanosecondsInSecond) / nanosecondsInMilisecond
    );
    const μs = Math.floor(
      (this._span - min * nanosecondsInMinute - sec * nanosecondsInSecond - ms * nanosecondsInMilisecond) /
        nanosecondsInMicrosecond
    );
    const ns =
      this._span -
      min * nanosecondsInMinute -
      sec * nanosecondsInSecond -
      ms * nanosecondsInMilisecond -
      μs * nanosecondsInMicrosecond;

    if (min > 0) {
      return util.format('%i min : %i sec : %i ms : %i μs : %i ns', min, sec, ms, μs, ns);
    } else if (sec > 0) {
      return util.format('%i sec : %i ms : %i μs : %i ns', sec, ms, μs, ns);
    } else if (ms > 0) {
      return util.format('%i ms : %i μs : %i ns', ms, μs, ns);
    } else if (μs > 0) {
      return util.format('%i μs : %i ns', μs, ns);
    } else {
      return util.format('%i ns', μs, ns);
    }
  }
}
