import packageJson from '../package.json';

export const EXTENSION_NAME = packageJson.displayName;

export function formatErrorForLogs(error: unknown): string {
    if (error instanceof Error) {
        return error.stack ?? error.toString();
    } else {
        return String(error);
    }
}

export function commandToDisplayString(executable: string, args: string[]): string {
    return [executable, ...args].map(cliArgToDisplayString).join(' ');
}

function cliArgToDisplayString(arg: string): string {
    if (/^[a-z0-9.-/_]+$/i.test(arg)) {
        return arg;
    } else {
        return `'${arg.replace(/([\\'])/g, '\\$1')}'`;
    }
}
