/**
 * LINTER.TS
 * ---------
 * Parses javalint output and adds linting hints to files.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { runOnFile } from './runner';

// let outputChannel: vscode.OutputChannel;
// outputChannel = vscode.window.createOutputChannel('JavaLint');

function getCorrectFileName(p: string): string {
    if (!fs.existsSync(p)) {
        p = path.join(vscode.workspace.rootPath, p);
        if (!fs.existsSync(p)) {
            return null;
        }
    }

    return p;
}

function javalintSeverityToDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
        case 'Error':
            return vscode.DiagnosticSeverity.Error;
        case 'Warn':
            return vscode.DiagnosticSeverity.Warning;
        default:
            return vscode.DiagnosticSeverity.Information;
    }
}

export function analysisResult(diagnosticCollection: vscode.DiagnosticCollection, result: string[]) {
    diagnosticCollection.clear();

    // 1 = path, 2 = line, 3 = severity, 4 = message
    let regex = /^(.*):([0-9]+):(\w+):(.*)$/m;
    let regexArray: RegExpExecArray;
    let fileData: { [key: string]: RegExpExecArray[] } = {};

    for (let item of result) {
        regexArray = regex.exec(item);
        if (regexArray === null || regexArray[1] === undefined || regexArray[2] === undefined
            || regexArray[3] === undefined || regexArray[4] === undefined) {
            continue;
        }

        let fileName = getCorrectFileName(regexArray[1]);
        if (!(fileName in fileData)) {
            fileData[fileName] = [];
        }

        fileData[fileName].push(regexArray);
    }

    for (let fileName in fileData) {
        vscode.workspace.openTextDocument(fileName).then((doc: vscode.TextDocument) => {
            let diagnostics: vscode.Diagnostic[] = [];

            for (let index = 0; index < fileData[fileName].length; index++) {
                let array = fileData[fileName][index];
                let line = Number(array[2]);
                let severity = array[3];
                let message = array[4].trim();

                if (line > 0) {
                    line--;
                }

                let l = doc.lineAt(line);
                let r = new vscode.Range(line, 0, line, l.text.length);
                let d = new vscode.Diagnostic(r, `${message}`, javalintSeverityToDiagnosticSeverity(severity));

                d.source = 'javalint';
                diagnostics.push(d);
            }

            diagnosticCollection.set(doc.uri, diagnostics);
        });
    }
}

export function Lint(diagnosticCollection: vscode.DiagnosticCollection) {
    let javalintOutput;

    javalintOutput = runOnFile();
    analysisResult(diagnosticCollection, javalintOutput)
}
