import 'express-serve-static-core';
import { IncomingMessage, ServerResponse } from 'http';
// this declaration is to fix the error
//{
// 	"resource": "/d:/src/try/bot-framework/BotFramework-Composer/extensions/telexy/src/publish/runtimeLogServer.ts",
// 	"owner": "typescript",
// 	"code": "2345",
// 	"severity": 8,
// 	"message": "Argument of type 'IncomingMessage' is not assignable to parameter of type 'Request'.\n  Type 'IncomingMessage' is missing the following properties from type 'Request': get, header, accepts, acceptsCharsets, and 33 more.",
// 	"source": "ts",
// 	"startLineNumber": 37,
// 	"startColumn": 20,
// 	"endLineNumber": 37,
// 	"endColumn": 23
// }
declare module 'express-serve-static-core' {
  interface Express {
    (req: IncomingMessage, res: ServerResponse): void;
  }
}
