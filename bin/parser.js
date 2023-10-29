"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.netlang = void 0;
var dotenv = require("dotenv");
var NodeFS = require("fs");
var NodeChildProcess = require("child_process");
var NodeCrytpo = require("crypto");
var lambda_parser_1 = require("./lambda-parser");
var netlang;
(function (netlang) {
    var parser;
    (function (parser) {
        var RecursiveDescentParser = /** @class */ (function () {
            function RecursiveDescentParser(file) {
                this.buffer = "";
                this.file = file;
                this.offset = 0;
                this.line = 0;
                this.transportLibraries = [];
                this.includes = [];
                this.includes.push("<iostream>");
                this.includes.push("\"transports/factory.hpp\"");
                this.includes.push("<memory>");
                this.logic = "";
                this.userIncludes = [];
                this.userEmbeds = [];
                this.envImports = [];
                this.requiresDbImport = false;
                this.lambdaParser = new lambda_parser_1.LambdaParser();
            }
            RecursiveDescentParser.prototype.readFile = function (name) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = this;
                                return [4 /*yield*/, NodeFS.readFileSync(name)];
                            case 1:
                                _a.buffer = (_b.sent()).toString();
                                this.offset = 0;
                                this.line = 1;
                                return [2 /*return*/, this.buffer];
                        }
                    });
                });
            };
            RecursiveDescentParser.prototype.dd = function () {
                this.dump();
                process.exit(0);
            };
            RecursiveDescentParser.prototype.accept = function (sym) {
                switch (sym) {
                    case "numeric": {
                        var match_1 = this.buffer.substr(this.offset).match(/^([0-9]+)/);
                        if (match_1) {
                            return { present: true, contents: match_1[1] };
                        }
                        break;
                    }
                    case "lambda-capture": {
                        var match_2 = this.buffer.substr(this.offset).match(/^(\[[^\]]*\])/);
                        if (match_2) {
                            return { present: true, contents: match_2[1] };
                        }
                        break;
                    }
                    case "transport":
                        var match = this.buffer
                            .substr(this.offset, String("websocket").length)
                            .match(/^(https|http|http2|udp|tcp|arp|icmp|ssh|scp|sftp|ftp|websocket|crontab|arp|job)/);
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
                        if (this.buffer[this.offset] === "'") {
                            return { present: true, contents: "'" };
                        }
                        break;
                    case "double-quote":
                        if (this.buffer[this.offset] === "\"") {
                            return { present: true, contents: "\"" };
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
                        if (this.buffer.substr(this.offset, String("%include").length) ===
                            "%include") {
                            return { present: true, contents: "%include" };
                        }
                        break;
                    case "%embed":
                        if (this.buffer.substr(this.offset, String("%embed").length) ===
                            "%embed") {
                            return { present: true, contents: "%embed" };
                        }
                        break;
                    case "newline":
                        if (this.buffer.substr(this.offset, 1) === "\n") {
                            return { present: true, contents: "\n" };
                        }
                        break;
                    case "whitespace":
                        var matches = this.buffer.substr(this.offset).match(/^([\s]+)/);
                        if (matches) {
                            return { present: true, contents: matches[1] };
                        }
                        break;
                    default:
                        break;
                }
                return { present: false, contents: "" };
            };
            RecursiveDescentParser.prototype.consumeLine = function () {
                for (var i = this.offset; this.buffer.length > this.offset && this.buffer[this.offset] != "\n"; this.offset++) { }
                ++this.offset;
                ++this.line;
            };
            RecursiveDescentParser.prototype.expect = function (sym) {
                var exp = {
                    present: false,
                    contents: "",
                };
                switch (sym) {
                    case "method":
                        var matches = this.buffer
                            .substr(this.offset, String("options").length + 1)
                            .match(/^.(when|define|exec|protect|run|knock|host|get|put|post|delete|options)/);
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
                        if (this.buffer[this.offset] === "'") {
                            return {
                                present: true,
                                contents: "'",
                            };
                        }
                        break;
                    case "double-quote":
                        if (this.buffer[this.offset] === "\"") {
                            return {
                                present: true,
                                contents: "\"",
                            };
                        }
                        break;
                    case "=>":
                        if (this.buffer.substr(this.offset, 2) == "=>") {
                            return { present: true, contents: "=>" };
                        }
                        break;
                    case "filename":
                        var is_file = true;
                        var ctr = void 0;
                        var file_name = "";
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
                            var matches_1 = this.buffer.substr(this.offset).match(/^([\s]+)/);
                            if (matches_1) {
                                return { present: true, contents: matches_1[1] };
                            }
                        }
                        break;
                    default:
                        return exp;
                }
                throw "Expected ".concat(sym);
                return exp;
            };
            RecursiveDescentParser.prototype.reportError = function (msg) {
                console.error("ERROR: ".concat(msg, " on line: ").concat(this.line));
            };
            RecursiveDescentParser.prototype.getTransportLibrary = function (transport) {
                for (var _i = 0, _a = this.transportLibraries; _i < _a.length; _i++) {
                    var lib = _a[_i];
                    if (lib.transport == transport) {
                        return lib.name;
                    }
                }
                var name = "lib_".concat(transport, "_").concat(this.randomAlpha(8));
                this.logic += "std::unique_ptr<netlang::transports::".concat(transport, "::lib> ").concat(name, " = netlang::transports::").concat(transport, "::make();\n");
                this.transportLibraries.push({
                    transport: transport,
                    name: name,
                    line: this.line,
                });
                return name;
            };
            RecursiveDescentParser.prototype.randomAlpha = function (len) {
                var str = "";
                do {
                    str += NodeCrytpo.randomBytes(16)
                        .toString("base64")
                        .replace(/[^a-zA-Z0-9]+/g, "");
                } while (str.length < len);
                return str.substr(0, len);
            };
            RecursiveDescentParser.prototype.acceptableTransportMethod = function (transport, method) {
                if (["https", "http", "http2"].includes(transport) &&
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
                    ].includes(method)) {
                    return true;
                }
                if (transport === "crontab" && !["run"].includes(method)) {
                    return false;
                }
                if (transport === "job" && !["define"].includes(method)) {
                    return false;
                }
                if (transport === "icmp" &&
                    !["echo_request", "echo_reply"].includes(method)) {
                    return false;
                }
                if (transport === "ssh" && !["exec"].includes(method)) {
                    return false;
                }
                return true;
            };
            RecursiveDescentParser.prototype.parseLambda = function () {
                this.lambdaParser.parse(this.buffer, this.offset);
                this.offset = this.lambdaParser.getOffset();
                var ast = this.lambdaParser.generateProgram();
                for (var _i = 0, _a = ast.includes; _i < _a.length; _i++) {
                    var inc = _a[_i];
                    this.includes.push(inc);
                }
                for (var _b = 0, _c = ast.userIncludes; _b < _c.length; _b++) {
                    var uinc = _c[_b];
                    this.userIncludes.push(uinc);
                }
                for (var _d = 0, _e = ast.userEmbeds; _d < _e.length; _d++) {
                    var emb = _e[_d];
                    this.userEmbeds.push(emb);
                }
                return ast.logic.join("\n");
            };
            RecursiveDescentParser.prototype.parseNumeric = function () {
                var n = "";
                for (; this.buffer.length > this.offset &&
                    !isNaN(parseInt(this.buffer[this.offset], 10)); this.offset++) {
                    n += this.buffer[this.offset];
                }
                return n;
            };
            RecursiveDescentParser.prototype.parameters = function () {
                var params = [];
                var acc = { present: false, contents: "" };
                var exp = { present: false, contents: "" };
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
                    var lambda = this.parseLambda();
                    this.debug("lambda: \"".concat(lambda, "\""));
                    params.push({
                        type: "lambda",
                        contents: lambda,
                    });
                    var tmp = this.parameters();
                    if (tmp.length) {
                        for (var _i = 0, tmp_1 = tmp; _i < tmp_1.length; _i++) {
                            var t = tmp_1[_i];
                            params.push(t);
                        }
                    }
                    return params;
                }
                var single_quote = false;
                var double_quote = false;
                acc = this.accept("single-quote");
                var acDoubleQuote = this.accept("double-quote");
                var acNumeric = this.accept("numeric");
                if (acc.present) {
                    single_quote = true;
                    this.offset += 1;
                    var url = this.parseUrl(single_quote);
                    this.expect("single-quote");
                    this.offset += 1;
                    params.push({
                        type: "string",
                        contents: url,
                    });
                    this.debug("single quote url: \"".concat(url, "\""));
                }
                else if (acDoubleQuote.present) {
                    var url = this.parseUrl(single_quote);
                    this.expect("double-quote");
                    this.offset += 1;
                    params.push({
                        type: "string",
                        contents: url,
                    });
                }
                else if (acNumeric.present) {
                    params.push({
                        type: "number",
                        contents: this.parseNumeric(),
                    });
                }
                if (this.accept(",").present) {
                    this.offset += 1;
                    var tmp = this.parameters();
                    if (tmp.length) {
                        for (var _a = 0, tmp_2 = tmp; _a < tmp_2.length; _a++) {
                            var t = tmp_2[_a];
                            params.push(t);
                        }
                    }
                }
                return params;
            };
            RecursiveDescentParser.prototype.warn = function (msg) {
                console.warn("WARNING: ".concat(msg));
            };
            RecursiveDescentParser.prototype.makeLogicParams = function (params) {
                var prog = "";
                var ctr = 0;
                var PARAM_LEN = params.length;
                for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                    var param = params_1[_i];
                    switch (param.type) {
                        case "string":
                            prog += "\"".concat(param.contents, "\"");
                            break;
                        case "lambda":
                            prog += "[]() -> void {";
                            prog += param.contents;
                            prog += "}";
                            break;
                        case "number":
                            prog += param.contents;
                            break;
                        default:
                            this.warn("Unrecognized param type: '".concat(param.type, "'"));
                            break;
                    }
                    if (++ctr < PARAM_LEN) {
                        prog += ",";
                    }
                }
                return prog;
            };
            RecursiveDescentParser.prototype.programBlock = function () {
                try {
                    var acc = { present: false, contents: "" };
                    var exp = { present: false, contents: "" };
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
                    acc = this.accept("comment");
                    if (acc.present) {
                        console.debug("found comment. consuming line");
                        this.consumeLine();
                        return this.programBlock();
                    }
                    acc = this.accept("%embed");
                    if (acc.present) {
                        this.debug("found %embed");
                        this.offset += String("%embed").length;
                        this.offset += this.expect("whitespace").contents.length;
                        var single_quote = this.accept("single-quote").present;
                        if (!single_quote) {
                            this.expect("double-quote");
                        }
                        this.offset += 1;
                        var include = "";
                        include = this.expect("filename").contents;
                        this.userEmbeds.push(include);
                        this.offset += include.length;
                        this.expect(single_quote ? "single-quote" : "double-quote");
                        this.offset += 1;
                        this.expect("newline");
                        this.offset += 1;
                        return this.programBlock();
                    }
                    acc = this.accept("%include");
                    if (acc.present) {
                        this.debug("found %include");
                        this.offset += String("%include").length;
                        this.offset += this.expect("whitespace").contents.length;
                        var single_quote = this.accept("single-quote").present;
                        if (!single_quote) {
                            this.expect("double-quote");
                        }
                        this.offset += 1;
                        var include = "";
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
                    var lib_id = "";
                    if (acc.present) {
                        lib_id = this.getTransportLibrary(acc.contents);
                        this.includes.push("\"transports/".concat(acc.contents, ".hpp\""));
                        // TODO: change this to a randomized variable name and register it
                        // as being associated with the specific transport library
                        this.offset += acc.contents.length;
                        this.debug("Transport recognized: " + acc.contents);
                        var transport = acc.contents;
                        exp = this.expect("method");
                        var method = exp.contents;
                        this.debug("Method found: \"".concat(exp.contents, "\""));
                        this.offset += exp.contents.length + 1; // +1 to account for .
                        if (!this.acceptableTransportMethod(transport, exp.contents)) {
                            this.reportError("Invalid method for transport");
                            return;
                        }
                        this.expect("(");
                        this.offset += 1;
                        var params = this.parameters();
                        this.expect(")");
                        this.offset += 1;
                        this.logic += "".concat(lib_id, "->").concat(method, "(");
                        var n = 0;
                        for (var _i = 0, params_2 = params; _i < params_2.length; _i++) {
                            var p = params_2[_i];
                            switch (p.type) {
                                case "lambda":
                                    this.logic += "[]() -> {";
                                    this.logic += p.contents;
                                    this.logic += '}';
                                    break;
                                case "string":
                                    this.logic += "\"".concat(p.contents, "\""); //TODO escape
                                    break;
                                case "number":
                                    this.logic += p.contents; // TODO: sanitize
                                    break;
                                default:
                                    this.logic += p.contents;
                                    break;
                            }
                            if (++n < params.length) {
                                this.logic += ',';
                            }
                        }
                        this.consumeIf("whitespace");
                        if (this.accept(";").present) {
                            this.offset += 1;
                            this.logic += "".concat(lib_id, ".").concat(method, "(");
                            this.logic += this.makeLogicParams(params);
                            this.logic += ");\n";
                            return this.programBlock();
                        }
                        if (this.accept("=>").present) {
                            this.debug("found =>");
                            this.offset += 2;
                            this.consumeIf("whitespace");
                            var file_name = this.expect("filename").contents;
                            this.debug("file_name: \"".concat(file_name, "\""));
                            // TODO: assoicate "lib" with the randomly generated library name above
                            this.logic += "".concat(lib_id, "->stream_method_to(").concat(this.cpp_method(transport, method), ",");
                            this.logic += this.makeLogicParams(params);
                            this.logic += ",\"".concat(file_name, "\");\n");
                            this.offset += file_name.length;
                        }
                        this.expect(";");
                        this.offset += 1;
                        this.consumeIf("whitespace");
                        return this.programBlock();
                    }
                }
                catch (e) {
                    this.reportError(e);
                }
            };
            RecursiveDescentParser.prototype.cpp_method = function (transport, method) {
                var m = "netlang::transports::".concat(transport, "::method_t");
                return "".concat(m, "::NETLANG_").concat(String(transport).toUpperCase(), "_").concat(String(method).toUpperCase());
            };
            RecursiveDescentParser.prototype.consumeIf = function (sym) {
                switch (sym) {
                    case "whitespace":
                        for (; this.buffer.length > this.offset &&
                            ["\n", "\t", " "].includes(this.buffer[this.offset]);) {
                            this.offset += 1;
                        }
                        break;
                    case ",":
                        for (; this.buffer.length > this.offset &&
                            this.buffer[this.offset] === ","; this.offset += 1) { }
                        break;
                    default:
                        break;
                }
            };
            RecursiveDescentParser.prototype.dump = function () {
                this.debug("buff: \"".concat(this.buffer.substr(this.offset), "\""));
            };
            RecursiveDescentParser.prototype.parseUrl = function (single_quote) {
                var url = "";
                for (; this.buffer.length > this.offset &&
                    this.buffer[this.offset] != (single_quote ? "'" : "\""); this.offset++) {
                    url += this.buffer[this.offset];
                }
                return url;
            };
            RecursiveDescentParser.prototype.escapeEnvString = function (str) {
                var s = "";
                for (var i = 0; i < str.length; i++) {
                    s += "\\x" + str.charCodeAt(i).toString(16);
                }
                return s;
            };
            RecursiveDescentParser.prototype.tokenizeEmbeds = function (file) {
                return __awaiter(this, void 0, void 0, function () {
                    var list, parsed, key;
                    return __generator(this, function (_a) {
                        list = [];
                        parsed = dotenv.config({ path: file }).parsed;
                        for (key in parsed) {
                            list.push([key, this.escapeEnvString(parsed[key])]);
                        }
                        return [2 /*return*/, list];
                    });
                });
            };
            RecursiveDescentParser.prototype.debug = function (msg) {
                process.stdout.write("PARSER: ");
                console.debug(msg);
            };
            RecursiveDescentParser.prototype.parse = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(this.buffer.length == 0)) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.readFile(this.file.name)];
                            case 1:
                                _a.sent();
                                if (this.buffer.length == 0) {
                                    return [2 /*return*/, {
                                            ok: false,
                                            issue: "File buffer empty",
                                            line: 0,
                                        }];
                                }
                                _a.label = 2;
                            case 2:
                                res = { ok: false, issue: "", line: -1 };
                                this.programBlock();
                                this.debug(this.logic);
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            RecursiveDescentParser.prototype.generateProgram = function (requested_out_file) {
                return __awaiter(this, void 0, void 0, function () {
                    var out_file, _i, requested_out_file_1, ch, main, includes, _a, _b, lib, userIncludes, _c, _d, file, userEmbeds, _e, _f, file, embeds, _g, embeds_1, pair, compile_statement;
                    return __generator(this, function (_h) {
                        switch (_h.label) {
                            case 0:
                                out_file = "";
                                for (_i = 0, requested_out_file_1 = requested_out_file; _i < requested_out_file_1.length; _i++) {
                                    ch = requested_out_file_1[_i];
                                    if (ch.match(/^[a-zA-Z0-9-\/.]{1}$/)) {
                                        out_file += ch;
                                    }
                                }
                                main = "int main(int argc,char** argv){\n";
                                return [4 /*yield*/, this.parse()];
                            case 1:
                                _h.sent();
                                includes = "";
                                this.includes = this.unique(this.includes);
                                for (_a = 0, _b = this.includes; _a < _b.length; _a++) {
                                    lib = _b[_a];
                                    includes += "#include ".concat(lib, "\n");
                                }
                                userIncludes = "";
                                this.userIncludes = this.unique(this.userIncludes);
                                for (_c = 0, _d = this.userIncludes; _c < _d.length; _c++) {
                                    file = _d[_c];
                                    userIncludes += "netlang::register_env(\"".concat(file, "\");\n");
                                }
                                userEmbeds = "";
                                this.userEmbeds = this.unique(this.userEmbeds);
                                _e = 0, _f = this.userEmbeds;
                                _h.label = 2;
                            case 2:
                                if (!(_e < _f.length)) return [3 /*break*/, 5];
                                file = _f[_e];
                                return [4 /*yield*/, this.tokenizeEmbeds(file)];
                            case 3:
                                embeds = _h.sent();
                                this.debug({ embeds: embeds });
                                for (_g = 0, embeds_1 = embeds; _g < embeds_1.length; _g++) {
                                    pair = embeds_1[_g];
                                    userEmbeds += "static constexpr const char* netlang_embed_".concat(pair[0], " = \"").concat(pair[1], "\";\n");
                                }
                                _h.label = 4;
                            case 4:
                                _e++;
                                return [3 /*break*/, 2];
                            case 5:
                                this.logic = "".concat(includes, "\n").concat(userEmbeds, "\n").concat(main).concat(userIncludes, "\n").concat(this.logic);
                                this.logic += "\nreturn 0;}\n";
                                return [4 /*yield*/, NodeFS.writeFileSync("/tmp/netlang-0.cpp", this.logic)];
                            case 6:
                                _h.sent();
                                compile_statement = "g++ -I$PWD/cpp/ -I$PWD/cpp/boost-includes -std=c++20 /tmp/netlang-0.cpp -o '".concat(out_file, "'");
                                this.debug("############################################");
                                this.debug(compile_statement);
                                this.debug("############################################");
                                return [4 /*yield*/, NodeChildProcess.execSync(compile_statement)];
                            case 7:
                                _h.sent();
                                this.debug("done. look for /tmp/netlang.out");
                                return [2 /*return*/];
                        }
                    });
                });
            };
            RecursiveDescentParser.prototype.unique = function (arr) {
                var u = [];
                for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                    var c = arr_1[_i];
                    if (u.indexOf(c) === -1) {
                        u.push(c);
                    }
                }
                return u;
            };
            return RecursiveDescentParser;
        }());
        parser.RecursiveDescentParser = RecursiveDescentParser;
    })(parser = netlang.parser || (netlang.parser = {}));
})(netlang || (exports.netlang = netlang = {}));
//# sourceMappingURL=parser.js.map