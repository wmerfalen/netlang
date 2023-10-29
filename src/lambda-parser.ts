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
  | "."
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
  | "db-prefix"
  | "db-table"
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

export interface LambdaMetadata {
  includes: Array<string>;
  userIncludes: Array<string>;
  userEmbeds: Array<string>;
  logic: Array<string>;
}

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
  logic: Array<string>;
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
    this.logic = [];
    this.userIncludes = [];
    this.userEmbeds = [];
    this.envImports = [];
    this.requiresDbImport = false;
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
      case "|=>":
        if (this.buffer.substr(this.offset, 3) === "|=>") {
          return { present: true, contents: "|=>" };
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
      case "db-table": // Purposeful fall-through
      case "db-prefix":{
        let ctr: number = this.offset;
        let contents : string = '';
        for(; this.buffer.length > ctr; ctr++){
          if(this.buffer[ctr].match(/[a-z0-9_]+/i)){
            contents += this.buffer[ctr];
            continue;
          }
          break;
        }
        if(contents.length > 0){
          return {present: true,contents,};
        }
        break;
      }
      case "method":
        let matches = this.buffer
          .substr(this.offset, String("echo_request").length + 1)
          .match(
            /^.(echo_request|when|define|exec|protect|run|knock|host|get|put|post|delete|options)/
          );
        if (matches) {
          return {
            present: true,
            contents: matches[1],
          };
        }
        break;
      case ")":
      case ".":
      case "(":
        if (this.buffer[this.offset] === sym) {
          return {
            present: true,
            contents: sym,
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
      case "|=>":
        if (this.buffer.substr(this.offset, 3) == "|=>") {
          return { present: true, contents: "|=>" };
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
  getTransportLibrary(transport: Transport): string {
    for (const lib of this.transportLibraries) {
      if (lib.transport == transport) {
        return lib.name;
      }
    }
    let name: string = `lib_${transport}_${this.randomAlpha(8)}`;
    this.logic.push(
      `auto ${name} = netlang::transports::${transport}::make();\n`
    );
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
  dd(): void {
    this.dump();
    process.exit(0);
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
      throw "Lambdas cannot be nested";
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
    let acc: Accepted = { present: false, contents: "" };
    let exp: Expected = { present: false, contents: "" };
    this.consumeIf("whitespace");
    acc = this.accept("comment");
    if (acc.present) {
      this.consumeLine();
      return this.programBlock();
    }
    if(this.accept("}").present){
      return;
    }
    acc = this.accept("transport");
    let lib_id: string = "";
    if (acc.present) {
      lib_id = this.getTransportLibrary(<Transport>acc.contents);
      this.includes.push(`"transports/${acc.contents}.hpp"`);
      this.offset += acc.contents.length;
      let transport: string = acc.contents;
      exp = this.expect("method");
      let method: string = exp.contents;
      if (!exp.present) {
        throw "Expected method";
        return;
      } else {
        this.offset += exp.contents.length + 1; // +1 to account for .
      }
      if (
        !this.acceptableTransportMethod(
          <Transport>transport,
          <Method>exp.contents
        )
      ) {
        throw "Invalid method for transport";
        return;
      }
      this.expect("(");
      this.offset += 1;

      let params: Array<Parameter> = this.parameters();

      this.expect(")");
      this.offset += 1;
      this.consumeIf("whitespace");
      if(this.accept("|=>").present){
        this.offset += 3;
        this.consumeIf("whitespace");
        this.expect("[");
        this.offset += 1;
        const db : string = this.expect("db-prefix").contents;
        this.offset += db.length;
        this.expect(".");
        this.offset += 1;
        const table : string = this.expect("db-table").contents;
        this.offset += table.length;
        params.push({
          type: 'string',
          contents: db,
        });
        params.push({
          type: 'string',
          contents: table,
        });
        this.expect("]");
        this.offset += 1;
      }
      if (this.accept(";").present) {
        this.offset += 1;
        this.logic.push(
          `${lib_id}.${method}(` + this.makeLogicParams(params) + `);\n`
        );
        return this.programBlock();
      }
      if (this.accept("=>").present) {
        this.offset += 2;
        this.consumeIf("whitespace");
        let file_name: string = this.expect("filename").contents;
        this.logic.push(
          `${lib_id}->stream_method_to(${this.cpp_method(transport, method)},` +
            this.makeLogicParams(params) +
            `,"${file_name}");\n`
        );
        this.offset += file_name.length;
      }
      if (this.accept(")").present) {
        this.offset += 1;
      }
      this.expect(";");
      this.offset += 1;
      this.consumeIf("whitespace");
      return this.programBlock();
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
    process.stdout.write('LAMBDA_PARSER: ');
    console.debug(msg);
  }
  initialize(): void {
    this.logic = [];
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

  parse(buffer: string, offset: number): void {
    this.initialize();
    this.buffer = buffer;
    this.offset = offset;
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
    this.offset += 1;
    this.consumeIf("whitespace");

    this.programBlock();

    this.expect("}");
    this.offset += 1;
  }
  generateProgram(): LambdaMetadata {
    return {
      includes: this.includes,
      userIncludes: this.userIncludes,
      userEmbeds: this.userEmbeds,
      logic: this.logic,
    };
  }
  getOffset(): number {
    return this.offset;
  }
}
