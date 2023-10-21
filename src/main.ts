import * as Transport from './transports/https';
import * as Parser from './parser';
const NodeFS = require('node:fs/promises');

(async function main() {
  type File = Transport.netlang.File;
  type RDP = Parser.netlang.parser.RecursiveDescentParser;
  const inputFile: string = process.argv[2];
  let file : File = {
    name: inputFile,
    size: 0,
    fd: await NodeFS.open(inputFile,'r'),
  };
  let rdp: RDP = new Parser.netlang.parser.RecursiveDescentParser(file);
  await rdp.generateProgram();
})();
