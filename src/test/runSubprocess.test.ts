import * as assert from 'assert';
import { runSubprocess, SubprocessResult } from '../runSubprocess';

suite('runSubprocess', () => {
    test('Successful run', async () => {
        const results = await runSubprocess('python', ['-c', 'import sys; print(1); print(2); print(3, file=sys.stderr)']);
        assertResultsEqual(results, {
            exitCode: 0,
            stdout: '1\n2\n',
            stderr: '3\n',
        });
    });

    test('Long output', async () => {
        const results = await runSubprocess('python', ['-c', 'print(*range(100000), sep="\\n")']);
        const expectedStdout = Array.from(new Array(100000), (_, i) => `${i}\n`).join('');
        assertResultsEqual(results, {
            exitCode: 0,
            stdout: expectedStdout,
            stderr: '',
        });
    });

    test('Non-zero exit code', async () => {
        const results = await runSubprocess('python', ['-c', 'print(1); exit(1)']);
        assertResultsEqual(results, {
            exitCode: 1,
            stdout: '1\n',
            stderr: '',
        });
    });

    test('Bad executable', async () => {
        assert.rejects(runSubprocess('some file that does not exist', []));
    });

    test('Stdin', async () => {
        const stdin = '123\n456\n\n78\n9';
        const results = await runSubprocess('python', ['-c', 'import sys; print(sys.stdin.read())'], stdin);

        assertResultsEqual(results, {
            exitCode: 0,
            stdout: stdin + '\n',
            stderr: '',
        });
    });
});

function assertResultsEqual(actual: SubprocessResult, expected: SubprocessResult): void {
    actual = {
        ...actual,
        stdout: actual.stdout.replaceAll('\r', ''),
        stderr: actual.stderr.replaceAll('\r', ''),
    };
    assert.deepStrictEqual(actual, expected);
}
