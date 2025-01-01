import * as vscode from 'vscode';
// import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as util from 'util';

const execPromise = util.promisify(exec);

/**
 * Compiles and runs a C++ file, returning the output.
 * @param cppFile The URI of the C++ file.
 * @returns The output of the program, or an error message if compilation or execution fails.
 */
export async function compileAndRunCppFile(cppFile: vscode.Uri): Promise<string> {
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
  } catch (error) {
    // Type assertion to treat 'error' as an instance of Error
    const e = error as Error;
    console.error(`Error compiling or running the C++ file: ${e.message}`);
    return `Error: ${e.message}`;
  }
  
}
