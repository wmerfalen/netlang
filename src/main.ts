import * as Transport from './transports/https';

(async function main() {
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
})();
