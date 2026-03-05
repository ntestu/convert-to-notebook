import * as vscode from 'vscode';
import { Config } from './config';
import { NotebookDeserializer } from './notebookDeserializer';
import { runSubprocess, SubprocessResult } from './runSubprocess';
import { commandToDisplayString, EXTENSION_NAME, formatErrorForLogs } from './util';

export const logger = vscode.window.createOutputChannel(EXTENSION_NAME, { log: true });

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('convertToNotebook.convertToNotebook', async () => {
        const config = Config.get();
        if (!config.executable) {
            vscode.window.showWarningMessage("The executable to use has not been configured.");
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active text editor.');
            return;
        }

        let subprocessResults: SubprocessResult;
        try {
            const executable = config.executable;
            const args = config.args;
            const workingDirectory = config.workingDirectory;

            subprocessResults = await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `Running command ${commandToDisplayString(executable, args)}`,
                    cancellable: true,
                },
                async (_, token) => {
                    return runSubprocess(executable, args, workingDirectory, editor.document.getText(), token);
                }
            );
        } catch (error) {
            if (!(error instanceof vscode.CancellationError)) {
                vscode.window.showErrorMessage(`Failed to convert the current file to a notebook: ${error}`);
                logger.error(`Failed to convert the current file to a notebook: ${formatErrorForLogs(error)}`);
            }
            return;
        }

        if (subprocessResults.exitCode !== 0) {
            vscode.window.showErrorMessage(
                `The command failed (exit code: ${subprocessResults.exitCode}).\n`
                + `Stderr: ${subprocessResults.stderr || '(no output)'}`
            );
            return;
        }

        let notebookData: vscode.NotebookData;
        try {
            notebookData = new NotebookDeserializer().deserialize(subprocessResults.stdout);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to convert command output to a notebook: ${error}`);
            logger.error(`Failed to convert command output to a notebook: ${formatErrorForLogs(error)}`);
            return;
        }

        const document = await vscode.workspace.openNotebookDocument('jupyter-notebook', notebookData);
        await vscode.window.showNotebookDocument(document);
    }));
}

export function deactivate() {}
