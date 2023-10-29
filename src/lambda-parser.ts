import * as Transport from "./transports/https";
const dotenv = require("dotenv");
const NodeFS = require("fs");
const NodeChildProcess = require("child_process");
const NodeCrytpo = require("crypto");

type Method =
  | Transport.netlang.Method
  | "run"
  | "host"
  | "echo_reply"
  | "echo_request"
  | "define"
  | "when"
  | "protect";
type File = Transport.netlang.File;
interface ParseResult {
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
  | "job";
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
  | "%embed"
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

interface Parameter {
  type: ParameterType;
  contents: string | number;
}

interface Accepted {
  present: boolean;
  contents: string;
}
interface Expected {
  present: boolean;
  contents: string;
}
interface TransportVariableDeclaration {
  transport: Transport;
  name: string;
  line: number;
}
interface EnvImport {
  key: string;
  value: string;
}
export class LambdaParser {
  buffer: string;
  offset: number;
  line: number;
  logic: string;
  includes: Array<string>;
  transportLibraries: Array<TransportVariableDeclaration>;
  userIncludes: Array<string>;
  userEmbeds: Array<string>;
  envImports: Array<EnvImport>;
  requiresDbImport: boolean;
  constructor() {
    this.buffer = "";
    this.offset = 0;
    this.line = 0;
    this.transportLibraries = [];
    this.includes = [];
    this.logic = "";
    this.userIncludes = [];
    this.userEmbeds = [];
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
      case "numeric": {
        let match = this.buffer.substr(this.offset).match(/^([0-9]+)/);
        if (match) {
          return { present: true, contents: match[1] };
        }
        break;
      }
      case "lambda-capture": {
        let match = this.buffer.substr(this.offset).match(/^(\[[^\]]*\])/);
        if (match) {
          return { present: true, contents: match[1] };
        }
        break;
      }
      case "transport":
        let match = this.buffer
          .substr(this.offset, String("websocket").length)
          .match(
            /^(https|http|http2|udp|tcp|arp|icmp|ssh|scp|sftp|ftp|websocket|crontab|arp|job)/
          );
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
        if (this.buffer[this.offset] === ",") {
          return { present: true, contents: "," };
        }
        break;
      case ";":
        if (this.buffer[this.offset] === ";") {
          return { present: true, contents: ";" };
        }
        break;
      case "=>":
        if (this.buffer.substr(this.offset, 2) === "=>") {
          return { present: true, contents: "=>" };
        }
        break;
      case "%include":
        if (
          this.buffer.substr(this.offset, String("%include").length) ===
          "%include"
        ) {
          return { present: true, contents: "%include" };
        }
        break;
      case "%embed":
        if (
          this.buffer.substr(this.offset, String("%embed").length) === "%embed"
        ) {
          return { present: true, contents: "%embed" };
        }
        break;
      case "newline":
        if (this.buffer.substr(this.offset, 1) === "\n") {
          return { present: true, contents: "\n" };
        }
        break;
      case "whitespace":
        let matches = this.buffer.substr(this.offset).match(/^([\s]+)/);
        if (matches) {
          return { present: true, contents: matches[1] };
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
          .match(
            /^.(when|define|exec|protect|run|knock|host|get|put|post|delete|options)/
          );
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
        if (this.buffer.substr(this.offset, 2) == "=>") {
          return { present: true, contents: "=>" };
        }
        break;
      case "filename":
        let is_file: boolean = true;
        let ctr: number;
        let file_name: string = "";
        for (ctr = this.offset; is_file; ++ctr) {
          is_file = !!this.buffer[ctr].match(/[\(\)_\/ \\a-zA-Z0-9\.]/);
          if (is_file) {
            file_name += this.buffer[ctr];
          }
        }
        return { present: file_name.length > 0, contents: file_name };
        break;
      case "whitespace":
        {
          let matches = this.buffer.substr(this.offset).match(/^([\s]+)/);
          if (matches) {
            return { present: true, contents: matches[1] };
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
  getTransportLibrary(transport: Transport): string {
    for (const lib of this.transportLibraries) {
      if (lib.transport == transport) {
        return lib.name;
      }
    }
    let name: string = `lib_${transport}_${this.randomAlpha(8)}`;
    this.logic += `std::unique_ptr<netlang::transports::${transport}::lib> ${name} = netlang::transports::${transport}::make();\n`;
    this.transportLibraries.push({
      transport: transport,
      name,
      line: this.line,
    });
    return name;
  }
  randomAlpha(len: number): string {
    let str: string = "";
    do {
      str += NodeCrytpo.randomBytes(16)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]+/g, "");
    } while (str.length < len);
    return str.substr(0, len);
  }
  acceptableTransportMethod(transport: Transport, method: Method): boolean {
    if (
      ["https", "http", "http2"].includes(transport) &&
      [
        "when",
        "host",
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "options",
        "protect",
      ].includes(method)
    ) {
      return true;
    }
    if (transport === "crontab" && !["run"].includes(method)) {
      return false;
    }
    if (transport === "job" && !["define"].includes(method)) {
      return false;
    }
    if (
      transport === "icmp" &&
      !["echo_request", "echo_reply"].includes(method)
    ) {
      return false;
    }
    if (transport === "ssh" && !["exec"].includes(method)) {
      return false;
    }
    return true;
  }
  parseLambda(): string {
    /**
     * THis is extremely one-dimensional and needs work:
     * currently, it only accepts:
     * []() -> {
     *   logic goes here
     *   logic goes here
     *   logic goes here
     * }
     */
    let l: string = "";
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
    for (
      ;
      this.buffer.length > this.offset && this.buffer[this.offset] != "}";
      this.offset++
    ) {
      l += this.buffer[this.offset];
    }
    this.expect("}");
    this.offset += 1;
    return l;
  }
  parseNumeric(): string {
    let n: string = "";
    for (
      ;
      this.buffer.length > this.offset &&
      !isNaN(parseInt(this.buffer[this.offset], 10));
      this.offset++
    ) {
      n += this.buffer[this.offset];
    }
    return n;
  }
  parameters(): Array<Parameter> {
    let params: Array<Parameter> = [];
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
    if (this.accept(")").present) {
      return params;
    }
    acc = this.accept("lambda-capture");
    if (acc.present) {
      this.debug("lambda capture recognized");
      let lambda: string = this.parseLambda();
      this.debug(`lambda: "${lambda}"`);
      params.push({
        type: "lambda",
        contents: lambda,
      });
      let tmp: Array<Parameter> = this.parameters();
      if (tmp.length) {
        for (const t of tmp) {
          params.push(t);
        }
      }
      return params;
    }
    let single_quote: boolean = false;
    let double_quote: boolean = false;
    acc = this.accept("single-quote");
    let acDoubleQuote: Accepted = this.accept("double-quote");
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
    } else if (acDoubleQuote.present) {
      let url: string = this.parseUrl(single_quote);
      this.expect("double-quote");
      this.offset += 1;
      params.push({
        type: "string",
        contents: url,
      });
    } else if (acNumeric.present) {
      params.push({
        type: "number",
        contents: this.parseNumeric(),
      });
    }
    if (this.accept(",").present) {
      this.offset += 1;
      let tmp: Array<Parameter> = this.parameters();
      if (tmp.length) {
        for (const t of tmp) {
          params.push(t);
        }
      }
    }
    return params;
  }
  warn(msg: string): void {
    console.warn(`WARNING: ${msg}`);
  }
  makeLogicParams(params: Array<Parameter>): string {
    let prog: string = "";
    let ctr: number = 0;
    const PARAM_LEN: number = params.length;

    for (const param of params) {
      switch (param.type) {
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
      if (++ctr < PARAM_LEN) {
        prog += `,`;
      }
    }

    return prog;
  }
  programBlock(): void {
    try {
      let acc: Accepted = { present: false, contents: "" };
      let exp: Expected = { present: false, contents: "" };
      if (this.accept("newline").present) {
        this.debug("found newline. consuming line");
        this.consumeLine();
        return this.programBlock();
      }
      acc = this.accept("whitespace");
      if (acc.present) {
        this.debug("found whitespace");
        this.offset += acc.contents.length;
        return this.programBlock();
      }

      if(this.accept("lambda-capture").present){
        this.logic += this.parseLambda();
        return;
      }
    } catch (e: any) {
      this.reportError(e);
    }
  }
  cpp_method(transport: string, method: string): string {
    let m: string = `netlang::transports::${transport}::method_t`;
    return `${m}::NETLANG_${String(transport).toUpperCase()}_${String(
      method
    ).toUpperCase()}`;
  }
  consumeIf(sym: SymToken) {
    switch (sym) {
      case "whitespace":
        for (
          ;
          this.buffer.length > this.offset &&
          ["\n", "\t", " "].includes(this.buffer[this.offset]);

        ) {
          this.offset += 1;
        }
        break;
      case ",":
        for (
          ;
          this.buffer.length > this.offset && this.buffer[this.offset] === ",";
          this.offset += 1
        ) {}
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
  debug(msg: any) {
    console.debug(JSON.stringify(msg, null, 2));
  }
  initialize(): void {
    this.logic = "";
    this.buffer = "";
    this.offset = 0;
    this.line = 0;
    this.includes = [];
    this.transportLibraries = [];
    this.userIncludes = [];
    this.userEmbeds = [];
    this.envImports = [];
    this.requiresDbImport = false;
  }

  parse(buffer: string, offset: number): string {
    this.initialize();
    this.buffer = buffer;
    this.offset = offset;
    this.programBlock();
    this.debug(this.logic);
    return this.logic;
  }
}
