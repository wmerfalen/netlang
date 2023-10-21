import * as Transport from "./transports/https";
const NodeFS = require("fs");
const NodeChildProcess = require('child_process');

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
  | "filename"
  |"whitespace"
    | "open-paren"
    | "close-paren"
    | "single-quote"
    | "double-quote"
    | "scheme"
    | "host"
    | "uri"
  |"semicolon"
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
    logic: string;
    constructor(file: File) {
      this.buffer = "";
      this.file = file;
      this.offset = 0;
      this.line = 0;
      this.logic = '#include <iostream>\n';
    }
    async readFile(name: string): Promise<string> {
      this.buffer = (await NodeFS.readFileSync(name)).toString();
      this.offset = 0;
      this.line = 1;
      console.debug(this.buffer, "<-- buffer");
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
        case "single-quote":
          if (this.buffer[this.offset] === `'`) {
            return { present: true, contents: `'` };
          }
          break;
        case "double-quote":
          if (this.buffer[this.offset] === `"`) {
            return { present: true, contents: `"` };
          }
          break;
        case "semicolon":
          if(this.buffer[this.offset] === ';'){
            return {present: true,contents: ';'};
          }
          break;
        case "=>":
          if(this.buffer.substr(this.offset,2) === '=>'){
            return {present: true,contents: '=>'};
          }
          break;
        default:
          break;
      }
      return { present: false, contents: "" };
    }
    consumeLine() {
      for (
        let i = this.offset;
        this.buffer.length > this.offset && this.buffer[this.offset] != "\n";
        this.offset++
      ) {}
      ++this.offset;
      ++this.line;
    }
    expect(sym: SymToken): Expected {
      let exp: Expected = {
        present: false,
        contents: "",
      };
      switch (sym) {
        case "method":
          let matches = this.buffer
            .substr(this.offset, String("options").length + 1)
            .match(/^.(get|put|post|delete|options)/);
          if (matches) {
            return {
              present: true,
              contents: matches[1],
            };
          }
          break;
        case "close-paren":
          if (this.buffer[this.offset] === ")") {
            return {
              present: true,
              contents: ")",
            };
          }
          break;
        case "open-paren":
          if (this.buffer[this.offset] === "(") {
            return {
              present: true,
              contents: "(",
            };
          }
          break;
        case "single-quote":
          if (this.buffer[this.offset] === `'`) {
            return {
              present: true,
              contents: `'`,
            };
          }
          break;
        case "double-quote":
          if (this.buffer[this.offset] === `"`) {
            return {
              present: true,
              contents: `"`,
            };
          }
          break;
        case "=>":
          if(this.buffer.substr(this.offset,2) == '=>'){
            return {present: true,contents: '=>'};
          }
          break;
        case "filename":
          let is_file: boolean = true;
          let ctr : number;
          let file_name: string = '';
          for(ctr=this.offset;is_file;++ctr){
            is_file = !!this.buffer[ctr].match(/[a-zA-Z0-9\.]/);
            if(is_file){
              file_name += this.buffer[ctr];
            }
          }
          return {present: file_name.length > 0,contents: file_name};
          break;
        default:
          return exp;
      }
      throw `Expected ${sym}`;
      return exp;
    }
    reportError(msg: string) {
      console.error(`ERROR: ${msg} on line: ${this.line}`);
    }
    programBlock(): void {
      try {
        let acc: Accepted = { present: false, contents: "" };
        let exp: Expected = { present: false, contents: "" };
        acc = this.accept("comment");
        if (acc.present) {
          console.debug("found comment. consuming line");
          this.consumeLine();
          return this.programBlock();
        }
        acc = this.accept("transport");
        if (acc.present) {
          this.logic += `#include "transports/${acc.contents}.hpp"\n`
          this.logic += `#include "transports/factory.hpp"\n`
          this.logic += `#include <memory>\n`;
          this.logic += `int main(int argc,char** argv){\n`;
          this.logic += ` std::unique_ptr<netlang::transports::${acc.contents}::lib> lib = netlang::transports::${acc.contents}::make();\n`;
          this.offset += acc.contents.length;
          this.debug("Transport recognized: " + acc.contents);
          let transport : string = acc.contents
          exp = this.expect("method");
          let method: string = exp.contents;
          if (!exp.present) {
            this.reportError("Expected method");
            return;
          } else {
            this.debug(`Method found: "${exp.contents}"`);
            this.offset += exp.contents.length + 1; // +1 to account for .
          }
          this.expect("open-paren");
          this.offset += 1;
          let single_quote: boolean = false;
          acc = this.accept("single-quote");
          if (!acc.present) {
            this.expect("double-quote");
          }
          if (acc.present) {
            single_quote = true;
          }
          this.offset += 1;
          let url: string = this.parseUrl(single_quote);
          this.debug(`url: "${url}"`);
          if (single_quote) {
            this.expect("single-quote");
          } else {
            this.expect("double-quote");
          }
          this.offset += 1;
          this.expect("close-paren");
          this.offset += 1;
          this.consumeIf("whitespace");
          if(this.accept("semicolon").present){
            this.offset += 1;
            this.logic += `lib.${method}("${url}");\n`;
            return this.programBlock();
          }
          if(this.accept("=>").present){
            this.debug("found =>");
            this.offset += 2;
            this.consumeIf("whitespace");
            let file_name: string = this.expect("filename").contents
            this.debug(`file_name: "${file_name}"`);
            this.logic += `lib->stream_method_to(${this.cpp_method(transport,method)},"${url}","${file_name}");\n`;
          }
          this.consumeIf("whitespace");
        }
      } catch (e: any) {
        this.reportError(e);
      }
    }
    cpp_method(transport: string,method: string) : string{
      let m : string = `netlang::transports::${transport}::method_t`
      return `${m}::NETLANG_${String(transport).toUpperCase()}_${String(method).toUpperCase()}`;
    }
    consumeIf(sym: SymToken) {
      switch(sym){
        case "whitespace":
          for(; this.buffer.length > this.offset && ["\n","\t"," "].includes(this.buffer[this.offset]);){
            this.offset += 1;
          }
          break;
        default:
          break;
      }
    }
    dump() {
      this.debug(`buff: "${this.buffer.substr(this.offset)}"`);
    }
    parseUrl(single_quote: boolean): string {
      let url: string = "";
      for (
        ;
        this.buffer.length > this.offset &&
        this.buffer[this.offset] != (single_quote ? `'` : `"`);
        this.offset++
      ) {
        url += this.buffer[this.offset];
      }
      return url;
    }
    debug(msg: string) {
      console.debug(msg);
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
      this.logic += `\nreturn 0;}\n`;
      this.debug(this.logic);
      return res;
    }
    async generateProgram()  {
      await this.parse();
      await NodeFS.writeFileSync('/tmp/netlang-0.cpp',this.logic);
      await NodeChildProcess.execSync("g++ -I$PWD/cpp/ -std=c++20 /tmp/netlang-0.cpp -o /tmp/netlang.out ; /tmp/netlang.out");
      this.debug('done. look for /tmp/netlang.out');
    }
  }
}
