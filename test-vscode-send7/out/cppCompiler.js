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
exports.compileAndRunCppFile = compileAndRunCppFile;
// import * as fs from 'fs';
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util = __importStar(require("util"));
const execPromise = util.promisify(child_process_1.exec);
/**
 * Compiles and runs a C++ file, returning the output.
 * @param cppFile The URI of the C++ file.
 * @returns The output of the program, or an error message if compilation or execution fails.
 */
async function compileAndRunCppFile(cppFile) {
    const cppFilePath = cppFile.fsPath;
    const dirPath = path.dirname(cppFilePath);
    const fileName = path.basename(cppFilePath, '.cpp');
    const executableName = `${fileName}.out`; // Output executable name
    try {
        // Step 1: Compile the C++ file
        const compileCommand = `g++ -o ${path.join(dirPath, executableName)} ${cppFilePath}`;
        await execPromise(compileCommand);
        console.log(`Compilation successful for ${cppFilePath}`);
        // Step 2: Run the compiled executable
        const runCommand = path.join(dirPath, executableName);
        const { stdout, stderr } = await execPromise(runCommand);
        // If there's an error during execution, return stderr
        if (stderr) {
            console.error(`Execution error: ${stderr}`);
            return stderr;
        }
        console.log(`Execution successful: ${stdout}`);
        return stdout.trim(); // Return the output of the program
    }
    catch (error) {
        // Type assertion to treat 'error' as an instance of Error
        const e = error;
        console.error(`Error compiling or running the C++ file: ${e.message}`);
        return `Error: ${e.message}`;
    }
}
