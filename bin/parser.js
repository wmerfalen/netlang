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
var NodeFS = require("fs");
var NodeChildProcess = require('child_process');
var NodeCrytpo = require('crypto');
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
                this.logic = '';
                this.userIncludes = [];
                this.envImports = [];
                this.requiresDbImport = false;
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
            RecursiveDescentParser.prototype.accept = function (sym) {
                switch (sym) {
                    case "transport":
                        var match = this.buffer
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
                        if (this.buffer[this.offset] === "'") {
                            return { present: true, contents: "'" };
                        }
                        break;
                    case "double-quote":
                        if (this.buffer[this.offset] === "\"") {
                            return { present: true, contents: "\"" };
                        }
                        break;
                    case "semicolon":
                        if (this.buffer[this.offset] === ';') {
                            return { present: true, contents: ';' };
                        }
                        break;
                    case "=>":
                        if (this.buffer.substr(this.offset, 2) === '=>') {
                            return { present: true, contents: '=>' };
                        }
                        break;
                    case "%include":
                        if (this.buffer.substr(this.offset, String('%include').length) === '%include') {
                            return { present: true, contents: '%include' };
                        }
                        break;
                    case "newline":
                        if (this.buffer.substr(this.offset, 1) === '\n') {
                            return { present: true, contents: '\n' };
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
                            .match(/^.(run|knock|host|get|put|post|delete|options)/);
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
                        if (this.buffer.substr(this.offset, 2) == '=>') {
                            return { present: true, contents: '=>' };
                        }
                        break;
                    case "filename":
                        var is_file = true;
                        var ctr = void 0;
                        var file_name = '';
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
                var str = '';
                do {
                    str += NodeCrytpo.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]+/g, '');
                } while (str.length < len);
                return str.substr(0, len);
            };
            RecursiveDescentParser.prototype.acceptableTransportMethod = function (transport, method) {
                if (['https', 'http', 'http2'].includes(transport) && [
                    'get', 'post', 'put', 'patch', 'delete', 'options',
                    'host'
                ].includes(method)) {
                    return true;
                }
                if (transport === "crontab" && !['run'].includes(method)) {
                    return false;
                }
                if (transport === "icmp" && ![
                    'echo_request', 'echo_reply',
                ].includes(method)) {
                    return false;
                }
                return true;
            };
            RecursiveDescentParser.prototype.programBlock = function () {
                try {
                    var acc = { present: false, contents: "" };
                    var exp = { present: false, contents: "" };
                    if (this.accept("newline").present) {
                        this.debug('found newline. consuming line');
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
                    acc = this.accept("%include");
                    if (acc.present) {
                        this.debug('found %include');
                        this.offset += String('%include').length;
                        this.offset += this.expect("whitespace").contents.length;
                        this.dump();
                        var single_quote = this.accept("single-quote").present;
                        if (!single_quote) {
                            this.expect("double-quote");
                        }
                        this.offset += 1;
                        var include = '';
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
                    var lib_id = '';
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
                        if (!exp.present) {
                            this.reportError("Expected method");
                            return;
                        }
                        else {
                            this.debug("Method found: \"".concat(exp.contents, "\""));
                            this.offset += exp.contents.length + 1; // +1 to account for .
                        }
                        if (!this.acceptableTransportMethod(transport, exp.contents)) {
                            this.reportError("Invalid method for transport");
                            return;
                        }
                        this.expect("open-paren");
                        this.offset += 1;
                        var single_quote = false;
                        acc = this.accept("single-quote");
                        if (!acc.present) {
                            this.expect("double-quote");
                        }
                        if (acc.present) {
                            single_quote = true;
                        }
                        this.offset += 1;
                        var url = this.parseUrl(single_quote);
                        this.debug("url: \"".concat(url, "\""));
                        if (single_quote) {
                            this.expect("single-quote");
                        }
                        else {
                            this.expect("double-quote");
                        }
                        this.offset += 1;
                        this.expect("close-paren");
                        this.offset += 1;
                        this.consumeIf("whitespace");
                        if (this.accept("semicolon").present) {
                            this.offset += 1;
                            this.logic += "".concat(lib_id, ".").concat(method, "(\"").concat(url, "\");\n");
                            return this.programBlock();
                        }
                        if (this.accept("=>").present) {
                            this.debug("found =>");
                            this.offset += 2;
                            this.consumeIf("whitespace");
                            var file_name = this.expect("filename").contents;
                            this.debug("file_name: \"".concat(file_name, "\""));
                            // TODO: assoicate "lib" with the randomly generated library name above
                            this.logic += "".concat(lib_id, "->stream_method_to(").concat(this.cpp_method(transport, method), ",\"").concat(url, "\",\"").concat(file_name, "\");\n");
                            this.offset += file_name.length;
                        }
                        this.dump();
                        this.expect("semicolon");
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
                        for (; this.buffer.length > this.offset && ["\n", "\t", " "].includes(this.buffer[this.offset]);) {
                            this.offset += 1;
                        }
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
            RecursiveDescentParser.prototype.debug = function (msg) {
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
                    var out_file, _i, requested_out_file_1, ch, includes, _a, _b, lib;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                out_file = '';
                                for (_i = 0, requested_out_file_1 = requested_out_file; _i < requested_out_file_1.length; _i++) {
                                    ch = requested_out_file_1[_i];
                                    if (ch.match(/^[a-zA-Z0-9-\/.]{1}$/)) {
                                        out_file += ch;
                                    }
                                }
                                this.logic = "int main(int argc,char** argv){\n";
                                return [4 /*yield*/, this.parse()];
                            case 1:
                                _c.sent();
                                includes = '';
                                for (_a = 0, _b = this.includes; _a < _b.length; _a++) {
                                    lib = _b[_a];
                                    includes += "#include ".concat(lib, "\n");
                                }
                                this.logic = "".concat(includes, "\n").concat(this.logic);
                                this.logic += "\nreturn 0;}\n";
                                return [4 /*yield*/, NodeFS.writeFileSync('/tmp/netlang-0.cpp', this.logic)];
                            case 2:
                                _c.sent();
                                return [4 /*yield*/, NodeChildProcess.execSync("g++ -I$PWD/cpp/ -I$PWD/cpp/boost-includes -std=c++20 /tmp/netlang-0.cpp -o '".concat(out_file, "'"))];
                            case 3:
                                _c.sent();
                                this.debug('done. look for /tmp/netlang.out');
                                return [2 /*return*/];
                        }
                    });
                });
            };
            return RecursiveDescentParser;
        }());
        parser.RecursiveDescentParser = RecursiveDescentParser;
    })(parser = netlang.parser || (netlang.parser = {}));
})(netlang || (exports.netlang = netlang = {}));
//# sourceMappingURL=parser.js.map