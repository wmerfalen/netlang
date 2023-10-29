"use strict";
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
        this.logic = [];
        this.userIncludes = [];
        this.userEmbeds = [];
        this.envImports = [];
        this.requiresDbImport = false;
    }
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
            case "|=>":
                if (this.buffer.substr(this.offset, 3) === "|=>") {
                    return { present: true, contents: "|=>" };
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
            case "db-table": // Purposeful fall-through
            case "db-prefix": {
                var ctr_1 = this.offset;
                var contents = '';
                for (; this.buffer.length > ctr_1; ctr_1++) {
                    if (this.buffer[ctr_1].match(/[a-z0-9_]+/i)) {
                        contents += this.buffer[ctr_1];
                        continue;
                    }
                    break;
                }
                if (contents.length > 0) {
                    return { present: true, contents: contents, };
                }
                break;
            }
            case "method":
                var matches = this.buffer
                    .substr(this.offset, String("echo_request").length + 1)
                    .match(/^.(echo_request|when|define|exec|protect|run|knock|host|get|put|post|delete|options)/);
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
            case "|=>":
                if (this.buffer.substr(this.offset, 3) == "|=>") {
                    return { present: true, contents: "|=>" };
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
    LambdaParser.prototype.getTransportLibrary = function (transport) {
        for (var _i = 0, _a = this.transportLibraries; _i < _a.length; _i++) {
            var lib = _a[_i];
            if (lib.transport == transport) {
                return lib.name;
            }
        }
        var name = "lib_".concat(transport, "_").concat(this.randomAlpha(8));
        this.logic.push("auto ".concat(name, " = netlang::transports::").concat(transport, "::make();\n"));
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
    LambdaParser.prototype.dd = function () {
        this.dump();
        process.exit(0);
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
            throw "Lambdas cannot be nested";
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
                for (var _i = 0, tmp_1 = tmp; _i < tmp_1.length; _i++) {
                    var t = tmp_1[_i];
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
        var acc = { present: false, contents: "" };
        var exp = { present: false, contents: "" };
        this.consumeIf("whitespace");
        acc = this.accept("comment");
        if (acc.present) {
            this.consumeLine();
            return this.programBlock();
        }
        if (this.accept("}").present) {
            return;
        }
        acc = this.accept("transport");
        var lib_id = "";
        if (acc.present) {
            lib_id = this.getTransportLibrary(acc.contents);
            this.includes.push("\"transports/".concat(acc.contents, ".hpp\""));
            this.offset += acc.contents.length;
            var transport = acc.contents;
            exp = this.expect("method");
            var method = exp.contents;
            if (!exp.present) {
                throw "Expected method";
                return;
            }
            else {
                this.offset += exp.contents.length + 1; // +1 to account for .
            }
            if (!this.acceptableTransportMethod(transport, exp.contents)) {
                throw "Invalid method for transport";
                return;
            }
            this.expect("(");
            this.offset += 1;
            var params = this.parameters();
            this.expect(")");
            this.offset += 1;
            this.consumeIf("whitespace");
            if (this.accept("|=>").present) {
                this.offset += 3;
                this.consumeIf("whitespace");
                this.expect("[");
                this.offset += 1;
                var db = this.expect("db-prefix").contents;
                this.offset += db.length;
                this.expect(".");
                this.offset += 1;
                var table = this.expect("db-table").contents;
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
                this.logic.push("".concat(lib_id, ".").concat(method, "(") + this.makeLogicParams(params) + ");\n");
                return this.programBlock();
            }
            if (this.accept("=>").present) {
                this.offset += 2;
                this.consumeIf("whitespace");
                var file_name = this.expect("filename").contents;
                this.logic.push("".concat(lib_id, "->stream_method_to(").concat(this.cpp_method(transport, method), ",") +
                    this.makeLogicParams(params) +
                    ",\"".concat(file_name, "\");\n"));
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
        process.stdout.write('LAMBDA_PARSER: ');
        console.debug(msg);
    };
    LambdaParser.prototype.initialize = function () {
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
    };
    LambdaParser.prototype.parse = function (buffer, offset) {
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
    };
    LambdaParser.prototype.generateProgram = function () {
        return {
            includes: this.includes,
            userIncludes: this.userIncludes,
            userEmbeds: this.userEmbeds,
            logic: this.logic,
        };
    };
    LambdaParser.prototype.getOffset = function () {
        return this.offset;
    };
    return LambdaParser;
}());
exports.LambdaParser = LambdaParser;
//# sourceMappingURL=lambda-parser.js.map