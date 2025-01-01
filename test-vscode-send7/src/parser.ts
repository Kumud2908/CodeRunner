import * as vscode from 'vscode';

const testRe = /^([0-9]+)\s*([+*/-])\s*([0-9]+)\s*=\s*([0-9]+)/;
const headingRe = /^(#+)\s*(.+)$/;

export const parseMarkdown = (text: string, events: {
    onTest(range: vscode.Range, a: number, operator: string, b: number, expected: number): void;
    onHeading(range: vscode.Range, name: string, depth: number): void;
    onCppTest(range: vscode.Range, cppFile: vscode.Uri, expectedOutput: string): void;  // New event for cpp tests
}) => {
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
        const cppTestRe = /^\/\/\s*TEST:\s*([^\s]+)\s*=\s*(.*)$/;  // Example pattern for cpp test cases
        const cppTest = cppTestRe.exec(line);
        if (cppTest) {
            const [, cppFile, expectedOutput] = cppTest;
            const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, line.length));
            const cppUri = vscode.Uri.file(cppFile);  // Convert file path to Uri
            events.onCppTest(range, cppUri, expectedOutput);  // Trigger the cpp test event
        }
    }
};
