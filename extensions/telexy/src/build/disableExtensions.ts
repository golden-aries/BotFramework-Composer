import fs from 'fs';
import path from 'path';
const packageJson = 'package.json';

const builtInExtDir = '/app/extensions';
const extToDisable = [
  'azurePublish',
  'azurePublishNew',
  'githubAuth',
  'mockRemotePublish',
  'localPublish',
  'mongoStorage',
  'pvaPublish',
  'runtimes',
  'sample-ui-plugin',
];

for (const ext of extToDisable) {
  disableExtension(path.join(builtInExtDir, ext, packageJson));
}

function disableExtension(file: string) {
  let rawdata = fs.readFileSync(file);
  const obj = JSON.parse(rawdata.toString());
  obj['composer'] = { enabled: false };
  fs.writeFileSync(file, JSON.stringify(obj));
}
