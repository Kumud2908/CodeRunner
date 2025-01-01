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
exports.CppTestCase = exports.TestCase = exports.TestHeading = exports.TestFile = exports.getContentFromFilesystem = exports.testData = void 0;
const util_1 = require("util");
const vscode = __importStar(require("vscode"));
const parser_1 = require("./parser");
const cppCompiler_1 = require("./cppCompiler"); // Assuming you have this function
const textDecoder = new util_1.TextDecoder('utf-8');
exports.testData = new WeakMap();
let generationCounter = 0;
const getContentFromFilesystem = async (uri) => {
    try {
        const rawContent = await vscode.workspace.fs.readFile(uri);
        return textDecoder.decode(rawContent);
    }
    catch (e) {
        console.warn(`Error providing tests for ${uri.fsPath}`, e);
        return '';
    }
};
exports.getContentFromFilesystem = getContentFromFilesystem;
class TestFile {
    didResolve = false;
    async updateFromDisk(controller, item) {
        try {
            const content = await (0, exports.getContentFromFilesystem)(item.uri);
            item.error = undefined;
            this.updateFromContents(controller, content, item);
        }
        catch (e) {
            item.error = e.stack;
        }
    }
    /**
     * Parses the tests from the input text, and updates the tests contained
     * by this file to be those from the text,
     */
    updateFromContents(controller, content, item) {
        const ancestors = [{ item, children: [] }];
        const thisGeneration = generationCounter++;
        this.didResolve = true;
        const ascend = (depth) => {
            while (ancestors.length > depth) {
                const finished = ancestors.pop();
                finished.item.children.replace(finished.children);
            }
        };
        (0, parser_1.parseMarkdown)(content, {
            onTest: (range, a, operator, b, expected) => {
                const parent = ancestors[ancestors.length - 1];
                const data = new TestCase(a, operator, b, expected, thisGeneration);
                const id = `${item.uri}/${data.getLabel()}`;
                const tcase = controller.createTestItem(id, data.getLabel(), item.uri);
                exports.testData.set(tcase, data);
                tcase.range = range;
                parent.children.push(tcase);
            },
            onHeading: (range, name, depth) => {
                ascend(depth);
                const parent = ancestors[ancestors.length - 1];
                const id = `${item.uri}/${name}`;
                const thead = controller.createTestItem(id, name, item.uri);
                thead.range = range;
                exports.testData.set(thead, new TestHeading(thisGeneration));
                parent.children.push(thead);
                ancestors.push({ item: thead, children: [] });
            },
            // New handler for cpp test cases
            onCppTest: (range, cppFile, expectedOutput) => {
                const parent = ancestors[ancestors.length - 1];
                const data = new CppTestCase(cppFile, expectedOutput, thisGeneration);
                const id = `${item.uri}/${cppFile.fsPath}`;
                const cppTest = controller.createTestItem(id, `Test: ${cppFile.fsPath}`, item.uri);
                exports.testData.set(cppTest, data);
                cppTest.range = range;
                parent.children.push(cppTest);
            }
        });
        ascend(0); // finish and assign children for all remaining items
    }
}
exports.TestFile = TestFile;
class TestHeading {
    generation;
    constructor(generation) {
        this.generation = generation;
    }
}
exports.TestHeading = TestHeading;
class TestCase {
    a;
    operator;
    b;
    expected;
    generation;
    constructor(a, operator, b, expected, generation) {
        this.a = a;
        this.operator = operator;
        this.b = b;
        this.expected = expected;
        this.generation = generation;
    }
    getLabel() {
        return `${this.a} ${this.operator} ${this.b} = ${this.expected}`;
    }
    async run(item, options) {
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        const actual = this.evaluate();
        const duration = Date.now() - start;
        if (actual === this.expected) {
            options.passed(item, duration);
        }
        else {
            const message = vscode.TestMessage.diff(`Expected ${item.label}`, String(this.expected), String(actual));
            message.location = new vscode.Location(item.uri, item.range);
            options.failed(item, message, duration);
        }
    }
    evaluate() {
        switch (this.operator) {
            case '-':
                return this.a - this.b;
            case '+':
                return this.a + this.b;
            case '/':
                return Math.floor(this.a / this.b);
            case '*':
                return this.a * this.b;
        }
    }
}
exports.TestCase = TestCase;
// New class to handle cpp test cases
class CppTestCase {
    cppFile;
    expectedOutput;
    generation;
    constructor(cppFile, expectedOutput, generation) {
        this.cppFile = cppFile;
        this.expectedOutput = expectedOutput;
        this.generation = generation;
    }
    getLabel() {
        return `Test: ${this.cppFile.fsPath}`;
    }
    async run(item, options) {
        const start = Date.now();
        const actualOutput = await (0, cppCompiler_1.compileAndRunCppFile)(this.cppFile);
        const duration = Date.now() - start;
        if (actualOutput === this.expectedOutput) {
            options.passed(item, duration);
        }
        else {
            const message = vscode.TestMessage.diff(`Expected output for ${item.label}`, this.expectedOutput, actualOutput);
            message.location = new vscode.Location(item.uri, item.range);
            options.failed(item, message, duration);
        }
    }
}
exports.CppTestCase = CppTestCase;
