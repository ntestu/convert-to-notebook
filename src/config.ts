import * as vscode from 'vscode';

export class Config {
    private readonly configuration: vscode.WorkspaceConfiguration;

    private constructor() {
        this.configuration = vscode.workspace.getConfiguration('convertToNotebook');
    }

    public static get(): Config {
        return new Config();
    }

    public get executable(): string {
        return this.configuration.get('executable', '');
    }

    public get args(): string[] {
        return this.configuration.get('args', []);
    }

    public get workingDirectory(): string {
        return this.configuration.get('workingDirectory', '.');
    }
}
