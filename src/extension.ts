// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import findGitRoot = require('find-git-root');
import * as cp from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	if (process.platform !== 'linux') {
		vscode.window.showInformationMessage('Could not activate Terminal Switcher extension: Only available on linux');
		return;
	}

	vscode.window.onDidChangeActiveTextEditor(switchTerminal)

	switchTerminal(vscode.window.activeTextEditor)

}

async function switchTerminal(textEditor: vscode.TextEditor | undefined) {
	if (!textEditor) return;
	if (textEditor.document.isUntitled) return;

	var gitDir: string
	try {
		gitDir = findGitRoot(textEditor.document.fileName);
	} catch { 	
		return 
	}

	var rejectors: ((reason?: any) => void)[] = [];
	var cwdTerm = await new Promise<vscode.Terminal>((resolveAll, rejectAll) => {		
		Promise.allSettled(vscode.window.terminals.map(term => new Promise<vscode.Terminal>((resolve, reject) => {
			rejectors.push(reject)

			term.processId.then(pid => {
				if (pid === undefined) {
					reject("no PID found")
				}
				return new Promise<string>((resolve, reject) => {
					cp.exec(`lsof -p ${pid} | awk '$4=="cwd" {print $9}'`, (err, stdout) => {
						if (err) 
							reject(`"lsof" call failed: ${err}`)
						else if (!stdout)
							reject(`couldn't retrieve cwd from "lsof"`)
						else
							resolve(stdout)
					})
				})
			}).then(termDir => {
				var termGitDir: string;
				try {
					termGitDir = findGitRoot(termDir.trimEnd())
				} catch { 
					reject("terminal not in git dir")
					return 
				}
				if (termGitDir === gitDir)
					resolve(term)
				else
					reject("terminal in wrong git root")
			})
		}).then(term => {
			rejectors.forEach(x => x("cwd terminal already found"));
			resolveAll(term)
		}))).then(_ => rejectAll())
		
	}).catch(_ => console.log("no terminals in cwd found"))

	gitDir = gitDir.replace(/.git$/, '')

	if (cwdTerm == undefined) {
		cwdTerm = vscode.window.createTerminal({
			name: gitDir.replace(vscode.workspace.workspaceFolders![0].uri.fsPath, '').replace(/^\/|\/$/g, ''),
			cwd: gitDir
		})
	}

	cwdTerm.show()
}

// this method is called when your extension is deactivated
export function deactivate() {}
