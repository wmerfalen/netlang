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
  let parseResult: Parser.netlang.parser.ParseResult = await rdp.parse();
  console.debug(parseResult);

  /*
  let lib: Transport.netlang.Https = new Transport.netlang.Https();
  let resp: File = await lib.run(
    "gist.githubusercontent.com",
    "GET",
    "/wmerfalen/38fa07a9691d5681f771c5f381a3a830/raw/f87573aad733e5f577e00d3ead4d22641df71057/screeps-db.json"
  ).catch((issue: any) => {
    console.error('there was an issue');
    return issue;
  });
  console.debug({ resp });
  */
})();
