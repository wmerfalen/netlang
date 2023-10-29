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
exports.LambdaParser = void 0;
var dotenv = require("dotenv");
var NodeFS = require("fs");
var NodeChildProcess = require("child_process");
var NodeCrytpo = require("crypto");
var LambdaParser = /** @class */ (function () {
    function LambdaParser() {
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
    LambdaParser.prototype.readFile = function (name) {
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
    LambdaParser.prototype.accept = function (sym) {
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
                if (this.buffer.substr(this.offset, String("%embed").length) === "%embed") {
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
    LambdaParser.prototype.consumeLine = function () {
        for (var i = this.offset; this.buffer.length > this.offset && this.buffer[this.offset] != "\n"; this.offset++) { }
        ++this.offset;
        ++this.line;
    };
    LambdaParser.prototype.expect = function (sym) {
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
    LambdaParser.prototype.reportError = function (msg) {
        console.error("ERROR: ".concat(msg, " on line: ").concat(this.line));
    };
    LambdaParser.prototype.getTransportLibrary = function (transport) {
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
    LambdaParser.prototype.randomAlpha = function (len) {
        var str = "";
        do {
            str += NodeCrytpo.randomBytes(16)
                .toString("base64")
                .replace(/[^a-zA-Z0-9]+/g, "");
        } while (str.length < len);
        return str.substr(0, len);
    };
    LambdaParser.prototype.acceptableTransportMethod = function (transport, method) {
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
    LambdaParser.prototype.parseLambda = function () {
        /**
         * THis is extremely one-dimensional and needs work:
         * currently, it only accepts:
         * []() -> {
         *   logic goes here
         *   logic goes here
         *   logic goes here
         * }
         */
        var l = "";
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
        for (; this.buffer.length > this.offset && this.buffer[this.offset] != "}"; this.offset++) {
            l += this.buffer[this.offset];
        }
        this.expect("}");
        this.offset += 1;
        return l;
    };
    LambdaParser.prototype.parseNumeric = function () {
        var n = "";
        for (; this.buffer.length > this.offset &&
            !isNaN(parseInt(this.buffer[this.offset], 10)); this.offset++) {
            n += this.buffer[this.offset];
        }
        return n;
    };
    LambdaParser.prototype.parameters = function () {
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
    LambdaParser.prototype.warn = function (msg) {
        console.warn("WARNING: ".concat(msg));
    };
    LambdaParser.prototype.makeLogicParams = function (params) {
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
    LambdaParser.prototype.programBlock = function () {
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
            if (this.accept("lambda-capture").present) {
                this.logic += this.parseLambda();
                return;
            }
        }
        catch (e) {
            this.reportError(e);
        }
    };
    LambdaParser.prototype.cpp_method = function (transport, method) {
        var m = "netlang::transports::".concat(transport, "::method_t");
        return "".concat(m, "::NETLANG_").concat(String(transport).toUpperCase(), "_").concat(String(method).toUpperCase());
    };
    LambdaParser.prototype.consumeIf = function (sym) {
        switch (sym) {
            case "whitespace":
                for (; this.buffer.length > this.offset &&
                    ["\n", "\t", " "].includes(this.buffer[this.offset]);) {
                    this.offset += 1;
                }
                break;
            case ",":
                for (; this.buffer.length > this.offset && this.buffer[this.offset] === ","; this.offset += 1) { }
                break;
            default:
                break;
        }
    };
    LambdaParser.prototype.dump = function () {
        this.debug("buff: \"".concat(this.buffer.substr(this.offset), "\""));
    };
    LambdaParser.prototype.parseUrl = function (single_quote) {
        var url = "";
        for (; this.buffer.length > this.offset &&
            this.buffer[this.offset] != (single_quote ? "'" : "\""); this.offset++) {
            url += this.buffer[this.offset];
        }
        return url;
    };
    LambdaParser.prototype.debug = function (msg) {
        console.debug(JSON.stringify(msg, null, 2));
    };
    LambdaParser.prototype.initialize = function () {
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
    };
    LambdaParser.prototype.parse = function (buffer, offset) {
        this.initialize();
        this.buffer = buffer;
        this.offset = offset;
        this.programBlock();
        this.debug(this.logic);
        return this.logic;
    };
    return LambdaParser;
}());
exports.LambdaParser = LambdaParser;
//# sourceMappingURL=lambda-parser.js.map