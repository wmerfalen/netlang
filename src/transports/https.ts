const NodeHttps = require("node:https");
const NodeFs = require("node:fs/promises");
const NodeCrypto = require("node:crypto");

export namespace netlang {
  export type Method = "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  export type Handle = typeof NodeFs.FileHandle;

  export interface File {
    name: string;
    size: number;
    fd: Handle;
  }

  export interface Request {
    hostname: string;
    port: number;
    path: string;
    method: Method;
  }

  export class Https {
    request: Request;
    constructor() {
      this.request = {
        hostname: "",
        port: 443,
        path: "/",
        method: "GET",
      };
    }
    async generateFileName(): Promise<File> {
      let FILE_NAME: string = "";
      while (FILE_NAME.length < 24) {
        FILE_NAME += NodeCrypto.randomBytes(16)
          .toString("base64")
          .replace(/[^a-z0-9]+/g, "");
      }
      FILE_NAME = "/tmp/netlang-" + FILE_NAME;

      let file: File = {
        name: FILE_NAME,
        size: 0,
        fd: await NodeFs.open(FILE_NAME, "w+"),
      };
      return file;
    }
    async run(host: string, method: Method, uri: string): Promise<File> {
      return new Promise(async (resolve, reject) => {
        let file: File = await this.generateFileName();
        this.request.hostname = host;
        this.request.port = 443;
        this.request.path = uri;
        this.request.method = method;

        const req = NodeHttps.request(
          this.request,
          (res: typeof NodeHttps.ClientResponse) => {
            res.on("data", (d: Buffer) => {
              file.size += d.length;
              file.fd.write(d, 0);
            });
            res.on("end", () => {
              file.fd.close();
              resolve(file);
            });
          }
        );

        req.on("error", (e: Error | string) => {
          console.error(e);
          reject(file);
        });
        req.end();
      });
    }
  }
}
