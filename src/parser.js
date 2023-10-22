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
                this.logic = '#include <iostream>\n';
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
                            is_file = !!this.buffer[ctr].match(/[a-zA-Z0-9\.]/);
                            if (is_file) {
                                file_name += this.buffer[ctr];
                            }
                        }
                        return { present: file_name.length > 0, contents: file_name };
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
            RecursiveDescentParser.prototype.programBlock = function () {
                try {
                    var acc = { present: false, contents: "" };
                    var exp = { present: false, contents: "" };
                    acc = this.accept("comment");
                    if (acc.present) {
                        console.debug("found comment. consuming line");
                        this.consumeLine();
                        return this.programBlock();
                    }
                    acc = this.accept("transport");
                    if (acc.present) {
                        this.logic += "#include \"transports/".concat(acc.contents, ".hpp\"\n");
                        this.logic += "#include \"transports/factory.hpp\"\n";
                        this.logic += "#include <memory>\n";
                        this.logic += "int main(int argc,char** argv){\n";
                        this.logic += " std::unique_ptr<netlang::transports::".concat(acc.contents, "::lib> lib = netlang::transports::").concat(acc.contents, "::make();\n");
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
                            this.logic += "lib.".concat(method, "(\"").concat(url, "\");\n");
                            return this.programBlock();
                        }
                        if (this.accept("=>").present) {
                            this.debug("found =>");
                            this.offset += 2;
                            this.consumeIf("whitespace");
                            var file_name = this.expect("filename").contents;
                            this.debug("file_name: \"".concat(file_name, "\""));
                            this.logic += "lib->stream_method_to(".concat(this.cpp_method(transport, method), ",\"").concat(url, "\",\"").concat(file_name, "\");\n");
                        }
                        this.consumeIf("whitespace");
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
                                this.logic += "\nreturn 0;}\n";
                                this.debug(this.logic);
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            RecursiveDescentParser.prototype.generateProgram = function (requested_out_file) {
                return __awaiter(this, void 0, void 0, function () {
                    var out_file, _i, requested_out_file_1, ch;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                out_file = '';
                                for (_i = 0, requested_out_file_1 = requested_out_file; _i < requested_out_file_1.length; _i++) {
                                    ch = requested_out_file_1[_i];
                                    if (ch.match(/^[a-zA-Z0-9-\/.]{1}$/)) {
                                        out_file += ch;
                                    }
                                }
                                return [4 /*yield*/, this.parse()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, NodeFS.writeFileSync('/tmp/netlang-0.cpp', this.logic)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, NodeChildProcess.execSync("g++ -I$PWD/cpp/ -I$PWD/cpp/boost-includes -std=c++20 /tmp/netlang-0.cpp -o '".concat(out_file, "'"))];
                            case 3:
                                _a.sent();
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