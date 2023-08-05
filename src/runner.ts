import {spawnSync} from "child_process";
import * as vscode from 'vscode';
import {ConfigManager} from "./configuration";

export function runOnFile() {
    if (vscode.window.activeTextEditor == undefined) {
        return [];
    }

    let activedoc = vscode.window.activeTextEditor.document;
    let filename = activedoc.fileName;

    if (ConfigManager.getInstance().isSupportLanguage(activedoc.languageId)) {
        return runJavaLint(filename);
    } else {
        return [];
    }
}

export function runJavaLint(filename: string) {
    let config = ConfigManager.getInstance().getConfig();
    let param: string[] = ["-jar"];

    param.push(config["javalintPath"]);
    param.push("--file");
    param.push(filename);

    return lint("java", param);
}

function lint(exec: string, params: string[]) {
    let buf = [];
    let result = spawnSync(exec, params, {encoding: 'utf-8'});

    if (result.stdout && result.stdout.length > 0) {
        buf = String(result.stdout).split('\n');
    }

    if (result.stderr && result.stderr.length > 0) {
        buf.concat(String(result.stderr).split('\n'));
    }

    return buf;
}
