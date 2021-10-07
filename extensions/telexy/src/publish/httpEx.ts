import 'http';

// this is fix for
// Property 'claimUpgrade' does not exist on type 'IncomingMessage'.
//{
// 	"resource": "/d:/src/try/bot-framework/BotFramework-Composer/extensions/telexy/src/publish/runtimeLogServer.ts",
// 	"owner": "typescript",
// 	"code": "2339",
// 	"severity": 8,
// 	"message": "Property 'claimUpgrade' does not exist on type 'IncomingMessage'.",
// 	"source": "ts",
// 	"startLineNumber": 32,
// 	"startColumn": 13,
// 	"endLineNumber": 32,
// 	"endColumn": 25
// }
// make sure the file that contains the module augmentation is itself a module (i.e. includes at least one top-level import or export).
// https://github.com/microsoft/TypeScript/issues/10859

declare module 'http' {
  interface IncomingMessage {
    claimUpgrade: () => void;
  }
}
