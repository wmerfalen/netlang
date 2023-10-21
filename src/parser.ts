import * as Transport from "./transports/https";
const NodeFS = require("fs");

export namespace netlang.parser {
  type Method = Transport.netlang.Method;
  type File = Transport.netlang.File;
  export interface ParseResult {
    ok: boolean;
    issue: string;
    line: number;
  }
  export type SymToken =
    | "transport"
    | "comment"
    | "method"
    | "scheme"
    | "host"
    | "uri"
    | "=>"
    | "file";

  export interface Accepted {
    present: boolean;
    contents: string;
  }
  export interface Expected {
    present: boolean;
    contents: string;
  }
  export class RecursiveDescentParser {
    buffer: string;
    file: File;
    offset: number;
    line: number;
    constructor(file: File) {
      this.buffer = "";
      this.file = file;
      this.offset = 0;
      this.line = 0;
    }
    async readFile(name: string): Promise<string> {
      this.buffer = (await NodeFS.readFileSync(name)).toString();
      this.offset = 0;
      this.line = 1;
      console.debug(this.buffer,'<-- buffer');
      return this.buffer;
    }
    accept(sym: SymToken): Accepted {
      switch (sym) {
        case "transport":
          let match = this.buffer
            .substr(this.offset, 5)
            .match(/^(https|http|tcp|udp|icmp|arp)/);
          if (match) {
            return { present: true, contents: match[1] };
          }
          break;
        case "comment":
          if (this.buffer[this.offset] === "#") {
            return { present: true, contents: this.buffer[this.offset] };
          }
          break;
      }
      return { present: false, contents: "" };
    }
    consumeLine() {
      for(let i=this.offset; this.buffer.length > this.offset && this.buffer[this.offset] != '\n';this.offset++){}
      ++this.offset;
      ++this.line;
    }
    expect(sym : SymToken) : Expected {
      let exp : Expected = {
        present: false,
        contents: ''
      };
      switch(sym){
        case "method":
          let matches = this.buffer.substr(this.offset,String('options').length + 1).match(/^.(get|put|post|delete|options)/);
          if(matches){
            return {
              present: true,
              contents: matches[1],
            };
          }
          break;
        default:
          return exp;
      }
      return exp;
    }
    reportError(msg: string) {
      console.error(`ERROR: ${msg} on line: ${this.line}`);
    }
    programBlock() : void {
      let acc: Accepted = { present: false, contents: "" };
      let exp: Expected = { present: false, contents: ""};
      acc = this.accept("comment");
      if(acc.present){
        console.debug('found comment. consuming line');
        this.consumeLine();
        return this.programBlock();
      }
      acc = this.accept("transport");
      if (acc.present) {
        this.offset += acc.contents.length;
        console.debug("Transport recognized: " + acc.contents);
        exp = this.expect("method");
        if(!exp.present){
          this.reportError('Expected method');
          return;
        }else{
          console.debug(`Method found: "${exp.contents}"`);
          this.offset += exp.contents.length;
        }
      }
    }

    async parse(): Promise<ParseResult> {
      if (this.buffer.length == 0) {
        await this.readFile(this.file.name);
        if (this.buffer.length == 0) {
          return {
            ok: false,
            issue: "File buffer empty",
            line: 0,
          };
        }
      }
      let res: ParseResult = { ok: false, issue: "", line: -1 };

      this.programBlock();
      return res;
    }
  }
}
