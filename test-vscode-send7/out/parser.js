"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarkdown = void 0;
const vscode = __importStar(require("vscode"));
const testRe = /^([0-9]+)\s*([+*/-])\s*([0-9]+)\s*=\s*([0-9]+)/;
const headingRe = /^(#+)\s*(.+)$/;
const parseMarkdown = (text, events) => {
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo];
        const test = testRe.exec(line);
        if (test) {
            const [, a, operator, b, expected] = test;
            const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, test[0].length));
            events.onTest(range, Number(a), operator, Number(b), Number(expected));
            continue;
        }
        const heading = headingRe.exec(line);
        if (heading) {
            const [, pounds, name] = heading;
            const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, line.length));
            events.onHeading(range, name, pounds.length);
        }
        // Add new logic for identifying cpp tests
        const cppTestRe = /^\/\/\s*TEST:\s*([^\s]+)\s*=\s*(.*)$/; // Example pattern for cpp test cases
        const cppTest = cppTestRe.exec(line);
        if (cppTest) {
            const [, cppFile, expectedOutput] = cppTest;
            const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, line.length));
            const cppUri = vscode.Uri.file(cppFile); // Convert file path to Uri
            events.onCppTest(range, cppUri, expectedOutput); // Trigger the cpp test event
        }
    }
};
exports.parseMarkdown = parseMarkdown;
