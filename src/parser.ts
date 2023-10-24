import * as Transport from "./transports/https";
const NodeFS = require("fs");
const NodeChildProcess = require('child_process');
const NodeCrytpo = require('crypto');

export namespace netlang.parser {
  type Method = Transport.netlang.Method | "run" | "host" | "echo_reply" | "echo_request" | "define" | "when" | "protect";
  type File = Transport.netlang.File;
  export interface ParseResult {
    ok: boolean;
    issue: string;
    line: number;
  }
  type Transport = 
    | "https"
    | "http"
    | "http2"
    | "udp"
    | "tcp"
    | "arp"
    | "icmp"
    | "ssh"
    | "scp"
    | "sftp"
    | "ftp"
    | "websocket"
    | "crontab"
    | "job"
  export type SymToken =
    | "=>"
    | "=>>"
    | "|=>"
    | "<=|"
    | ")"
    | "("
    | ","
    | "}"
    | "{"
    | "->"
    | ";"
    | "["
    | "]"
    | "comment"
    | "crontab"
    | "crontab-minute"
    | "crontab-hour"
    | "crontab-domonth"
    | "crontab-month"
    | "crontab-doweek"
    | "double-quote"
    | "file"
    | "filename"
    | "host"
    | "%include"
    | "lambda-capture"
    | "lambda-param-name"
    | "lambda-param-type"
    | "method"
    | "newline"
    | "numeric"
    | "run"
    | "scheme"
    | "single-quote"
    | "transport"
    | "uri"
    | "whitespace";

  type ParameterType = "string" | "lambda" | "number";

  export interface Parameter {
    type: ParameterType;
    contents: string | number;
  }

  export interface Accepted {
    present: boolean;
    contents: string;
  }
  export interface Expected {
    present: boolean;
    contents: string;
  }
  export interface TransportVariableDeclaration {
    transport: Transport;
    name: string;
    line: number;
  }
  export interface EnvImport {
    key: string;
    value: string;
  }
  export class RecursiveDescentParser {
    buffer: string;
    file: File;
    offset: number;
    line: number;
    logic: string;
    /**
     * Includes that are internal. This means includes that are
     * part of the generated C++ and not requested by the user
     * in a program via %include "file"
     */
    includes: Array<string>;
    transportLibraries: Array<TransportVariableDeclaration>;
    /**
     * Includes that are requested by the user via %include "file"
     * These are not actual #includes that are generated in the
     * C++ code.
     */
    userIncludes: Array<string>;
    envImports: Array<EnvImport>;
    requiresDbImport: boolean;
    constructor(file: File) {
      this.buffer = "";
      this.file = file;
      this.offset = 0;
      this.line = 0;
      this.transportLibraries = [];
      this.includes = [];
      this.includes.push(`<iostream>`);
      this.includes.push(`"transports/factory.hpp"`);
      this.includes.push(`<memory>`);
      this.logic = '';
      this.userIncludes = [];
      this.envImports = [];
      this.requiresDbImport = false;
    }
    async readFile(name: string): Promise<string> {
      this.buffer = (await NodeFS.readFileSync(name)).toString();
      this.offset = 0;
      this.line = 1;
      return this.buffer;
    }
    accept(sym: SymToken): Accepted {
      switch (sym) {
        case "numeric":{
          let match = this.buffer.substr(this.offset).match(/^([0-9]+)/)
          if(match){
            return {present: true,contents: match[1] };
          }
          break;
        }
        case "lambda-capture":{
          let match = this.buffer.substr(this.offset).match(/^(\[[^\]]*\])/)
          if(match){
            return { present: true, contents: match[1] };
          }
          break;
        }
        case "transport":
          let match = this.buffer
            .substr(this.offset, String('websocket').length)
            .match(/^(https|http|http2|udp|tcp|arp|icmp|ssh|scp|sftp|ftp|websocket|crontab|arp)/);
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
        case ",":
          if(this.buffer[this.offset] === ','){
            return {present: true,contents: ','};
          }
          break;
        case ";":
          if(this.buffer[this.offset] === ';'){
            return {present: true,contents: ';'};
          }
          break;
        case "=>":
          if(this.buffer.substr(this.offset,2) === '=>'){
            return {present: true,contents: '=>'};
          }
          break;
        case "%include":
          if(this.buffer.substr(this.offset,String('%include').length) === '%include'){
            return {present: true,contents: '%include'};
          }
          break;
        case "newline":
          if(this.buffer.substr(this.offset,1) === '\n'){
            return {present: true,contents: '\n'};
          }
          break;
        case "whitespace":
          let matches = this.buffer.substr(this.offset).match(/^([\s]+)/);
          if(matches){
            return {present: true,contents: matches[1]}
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
            .match(/^.(run|knock|host|get|put|post|delete|options)/);
          if (matches) {
            return {
              present: true,
              contents: matches[1],
            };
          }
          break;
        case ")":
          if (this.buffer[this.offset] === ")") {
            return {
              present: true,
              contents: ")",
            };
          }
          break;
        case "(":
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
            is_file = !!this.buffer[ctr].match(/[\(\)_\/ \\a-zA-Z0-9\.]/);
            if(is_file){
              file_name += this.buffer[ctr];
            }
          }
          return {present: file_name.length > 0,contents: file_name};
          break;
        case "whitespace": {
          let matches = this.buffer.substr(this.offset).match(/^([\s]+)/);
          if(matches){
            return {present: true,contents: matches[1]};
          }
        }
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
    getTransportLibrary(transport: Transport) : string {
      for(const lib of this.transportLibraries){
        if(lib.transport == transport){
          return lib.name;
        }
      }
      let name: string = `lib_${transport}_${this.randomAlpha(8)}`
      this.logic += `std::unique_ptr<netlang::transports::${transport}::lib> ${name} = netlang::transports::${transport}::make();\n`;
      this.transportLibraries.push({
        transport: transport,
        name,
        line: this.line,
      });
      return name;

    }
    randomAlpha(len: number) : string {
      let str : string = '';
      do {
        str += NodeCrytpo.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]+/g,'');
      }while(str.length < len);
      return str.substr(0,len);
    }
    acceptableTransportMethod(transport: Transport,method: Method) : boolean {
      if(['https','http','http2'].includes(transport) && [
        'get','post','put','patch','delete','options',
      'host'].includes(method)){
        return true;
      }
      if(transport === "crontab" && !['run'].includes(method)){
        return false;
      }
      if(transport === "icmp" && ![
        'echo_request','echo_reply',
      ].includes(method)){
        return false;
      }
      return true;
    }
    parseLambda() : string {
      /**
       * THis is extremely one-dimensional and needs work:
       * currently, it only accepts:
       * []() -> {
       *   logic goes here
       *   logic goes here
       *   logic goes here
       * }
       */
      let l : string = '';
      this.expect("[");
      this.offset += 1;
      this.expect("]");
      this.offset += 1;
      this.expect("(");
      this.offset += 1;
      this.expect(")");
      this.offset += 1;
      this.consumeIf("whitespace");
      this.expect("->");
      this.offset += 2;
      this.consumeIf("whitespace");
      this.expect("{");
      this.consumeIf("whitespace");
      for(; this.buffer.length > this.offset && this.buffer[this.offset] != '}';this.offset++){
        l += this.buffer[this.offset];
      }
      this.expect("}");
      this.offset += 1;
      return l;
    }
    parseNumeric() : string {
      let n : string = '';
      for(; this.buffer.length > this.offset && !isNaN(parseInt(this.buffer[this.offset],10)); this.offset++){
        n += this.buffer[this.offset];
      }
      return n;
    }
    parameters() : Array<Parameter> {
      let params : Array<Parameter> = [];
      let acc: Accepted = { present: false, contents: "" };
      let exp: Expected = { present: false, contents: "" };
      /**
       * Start parsing a parameter. Note: a parameter can be either a string
       * literal, or a lambda
       */
      this.consumeIf("whitespace");
      this.consumeIf(",");
      /**
       * If the user simply decides to not pass parameters...
       */
      if(this.accept(")").present){
        return params
      }
      acc = this.accept("lambda-capture");
      if(acc.present) {
        this.debug('lambda capture recognized');
        let lambda : string = this.parseLambda()
        this.debug(`lambda: "${lambda}"`);
        params.push({
          type: "lambda",
          contents: lambda,
        });
        this.dump();
        let tmp: Array<Parameter> = this.parameters();
        if(tmp.length){
          for(const t of tmp){
            params.push(t);
          }
        }
        return params;
      }
      let single_quote: boolean = false;
      let double_quote: boolean = false;
      acc = this.accept("single-quote");
      let acDoubleQuote : Accepted = this.accept("double-quote");
      let acNumeric: Accepted = this.accept("numeric");
      if (acc.present) {
        single_quote = true;
        this.offset += 1;
        let url: string = this.parseUrl(single_quote);
        this.expect("single-quote");
        this.offset += 1;
        params.push({
          type: "string",
          contents: url,
        });
        this.debug(`single quote url: "${url}"`);
      }else if(acDoubleQuote.present){
        let url: string = this.parseUrl(single_quote);
        this.expect("double-quote");
        this.offset += 1;
        params.push({
          type: "string",
          contents: url,
        });
      }else if(acNumeric.present){
        params.push({
          type: "number",
          contents: this.parseNumeric(),
        });
      }
      if(this.accept(",").present){
        this.offset += 1;
        let tmp: Array<Parameter> = this.parameters();
        if(tmp.length){
          for(const t of tmp){
            params.push(t);
          }
        }
      }
      return params;
    }
    warn(msg: string) : void {
      console.warn(`WARNING: ${msg}`);
    }
    makeLogicParams(params: Array<Parameter>) : string {
      let prog : string = '';
      let ctr: number = 0;
      const PARAM_LEN : number = params.length;

      for(const param of params){
        switch(param.type){
          case "string":
            prog += `"${param.contents}"`;
            break;
          case "lambda":
            prog += `[]() -> void {`;
            prog += param.contents;
            prog += `}`;
            break;
          case "number":
            prog += param.contents;
            break;
          default:
            this.warn(`Unrecognized param type: '${param.type}'`);
            break;
        }
        if(++ctr < PARAM_LEN){
          prog += `,`;
        }
      }

      return prog;
    }
    programBlock(): void {
      try {
        let acc: Accepted = { present: false, contents: "" };
        let exp: Expected = { present: false, contents: "" };
        if(this.accept("newline").present){
          this.debug('found newline. consuming line');
          this.consumeLine();
          return this.programBlock();
        }
        acc = this.accept("whitespace");
        if(acc.present){
          this.debug("found whitespace");
          this.offset += acc.contents.length;
          return this.programBlock();
        }
        acc = this.accept("comment");
        if (acc.present) {
          console.debug("found comment. consuming line");
          this.consumeLine();
          return this.programBlock();
        }
        acc = this.accept("%include");
        if(acc.present){
          this.debug('found %include');
          this.offset += String('%include').length;
          this.offset += this.expect("whitespace").contents.length;
          //this.dump();
          let single_quote: boolean = this.accept("single-quote").present;
          if(!single_quote){
            this.expect("double-quote");
          }
          this.offset += 1;
          let include : string = '';
          include = this.expect("filename").contents;
          this.userIncludes.push(include);
          this.offset += include.length;
          this.expect(single_quote ? "single-quote" : "double-quote");
          this.offset += 1;
          this.expect("newline");
          this.offset += 1;
          return this.programBlock();
        }
        acc = this.accept("transport");
        let lib_id : string = '';
        if (acc.present) {
          lib_id = this.getTransportLibrary(<Transport>acc.contents);
          this.includes.push(`"transports/${acc.contents}.hpp"`);
          // TODO: change this to a randomized variable name and register it
          // as being associated with the specific transport library
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
          if(!this.acceptableTransportMethod(<Transport>transport,<Method>exp.contents)){
            this.reportError("Invalid method for transport");
            return;
          }
          this.expect("(");
          this.offset += 1;

          let params : Array<Parameter> = this.parameters();

          this.expect(")");
          this.offset += 1;
          this.consumeIf("whitespace");
          if(this.accept(";").present){
            this.offset += 1;
            this.logic += `${lib_id}.${method}(`;
            this.logic += this.makeLogicParams(params);
            this.logic += `);\n`;
            return this.programBlock();
          }
          if(this.accept("=>").present){
            this.debug("found =>");
            this.offset += 2;
            this.consumeIf("whitespace");
            let file_name: string = this.expect("filename").contents
            this.debug(`file_name: "${file_name}"`);
            // TODO: assoicate "lib" with the randomly generated library name above
            this.logic += `${lib_id}->stream_method_to(${this.cpp_method(transport,method)},`;
            this.logic += this.makeLogicParams(params);
            this.logic += `,"${file_name}");\n`;
            this.offset += file_name.length;
          }
          this.dump();
          this.expect(";");
          this.offset += 1;
          this.consumeIf("whitespace");
          return this.programBlock();
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
        case ",":
          for(;this.buffer.length > this.offset && this.buffer[this.offset] === ',';this.offset += 1){
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
      this.debug(this.logic);
      return res;
    }
    async generateProgram(requested_out_file: string)  {
      let out_file: string = '';
      for(const ch of requested_out_file){
        if(ch.match(/^[a-zA-Z0-9-\/.]{1}$/)){
          out_file += ch;
        }
      }
      this.logic = `int main(int argc,char** argv){\n`;
      await this.parse();
      let includes: string = '';
      for(const lib of this.includes){
        includes += `#include ${lib}\n`
      }
      this.logic = `${includes}\n${this.logic}`;
      this.logic += `\nreturn 0;}\n`;
      await NodeFS.writeFileSync('/tmp/netlang-0.cpp',this.logic);
      await NodeChildProcess.execSync(`g++ -I$PWD/cpp/ -I$PWD/cpp/boost-includes -std=c++20 /tmp/netlang-0.cpp -o '${out_file}'`);
      this.debug('done. look for /tmp/netlang.out');
    }
  }
}
