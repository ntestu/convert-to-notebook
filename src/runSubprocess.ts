import { spawn } from 'child_process';
import * as vscode from 'vscode';
import { logger } from './extension';
import { commandToDisplayString } from './util';

export type SubprocessResult = {
    exitCode: number | null;
    stdout: string;
    stderr: string;
};

export async function runSubprocess(
    executable: string,
    args: string[],
    stdin: string = "",
    token?: vscode.CancellationToken,
): Promise<SubprocessResult> {
    logger.info(`Running command ${commandToDisplayString(executable, args)}`);

    try {
        const result = await new Promise<SubprocessResult>((resolve, reject) => {
            const child = spawn(executable, args, {});
            const stdout: string[] = [];
            const stderr: string[] = [];

            child.stdout.on('data', chunk => stdout.push(chunk.toString()));
            child.stderr.on('data', chunk => stderr.push(chunk.toString()));

            child.on('close', exitCode => resolve({
                exitCode,
                stdout: stdout.join(''),
                stderr: stderr.join(''),
            }));

            child.on('error', error => {
                reject(new Error(
                    `Could not run command "${executable}": ${error}`,
                    { cause: error }));
            });

            child.stdin.end(stdin);

            token?.onCancellationRequested(() => {
                logger.info('Command canceled');
                reject(new vscode.CancellationError());
                child.kill();
            });
        });
        (result.exitCode === 0 ? logger.info : logger.warn)(`Command finished with exit code ${result.exitCode}`);
        return result;
    } catch (error) {
        logger.warn(`Command failed: ${error}`);
        throw error;
    }
}
