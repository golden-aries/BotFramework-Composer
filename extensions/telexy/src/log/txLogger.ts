import { ILogger, ISettings, LogLevel } from "../common/interfaces";

export class ConsoleLogger implements ILogger {

    private _settings : ISettings;

    constructor(settings: ISettings){
        this._settings = settings;
    }
    log(logLevel: LogLevel, message?: any, ...optionalParams: any[]) {
        if (this._settings.logLevel <= logLevel)
        {
            switch(logLevel)
            {
                case LogLevel.Error:
                    console.error("Tx%s: " + message, LogLevel[logLevel], ...optionalParams);
                    break;
                case LogLevel.Trace:
                    console.log("Tx%s: " + message, LogLevel[logLevel], ...optionalParams);
                    break;
                case LogLevel.Warning:
                    console.warn("Tx%s: " + message, LogLevel[logLevel], ...optionalParams);
                    break;
                case LogLevel.Debug:
                    console.debug("Tx%s: " + message, LogLevel[logLevel], ...optionalParams);
                    break;
                case LogLevel.Information:
                    console.info("Tx%s: " + message, LogLevel[logLevel], ...optionalParams);
                    break;
                default:
                    console.log("Tx%s: " + message, LogLevel[logLevel], ...optionalParams);
            }
        }
    };

    logDebug(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.Debug, message, ...optionalParams);
    }
    logWarning(message?: any, ...optionalParams: any[]){
        this.log(LogLevel.Warning, message, ...optionalParams);
    }

    logCritical(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.Warning, message, ...optionalParams);
    }

    logInformation(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.Information, message, ...optionalParams);
    }

    logError(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.Error, message, ...optionalParams);
    }

    logTrace(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.Trace, message, ...optionalParams);
    }
}