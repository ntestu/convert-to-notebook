import * as assert from 'assert';
import * as vscode from 'vscode';
import { NotebookDeserializer } from '../notebookDeserializer';
import { NotebookDto } from '../dtos';

suite('NotebookDeserializer', () => {
    test('Successful deserialization', () => {
        const deserializer = new NotebookDeserializer();
        const data: NotebookDto = {
            nbformat: 4,
            nbformat_minor: 5,
            cells: [
                {
                    cell_type: 'markdown',
                    source: 'Hello world'
                },
                {
                    cell_type: 'code',
                    source: [
                        'print(1)',
                        'print(2)',
                    ]
                }
            ]
        };
        const actual = deserializer.deserialize(JSON.stringify(data));
        const expected = new vscode.NotebookData([
            new vscode.NotebookCellData(
                vscode.NotebookCellKind.Markup,
                'Hello world',
                'markdown'
            ),
            new vscode.NotebookCellData(
                vscode.NotebookCellKind.Code,
                'print(1)\nprint(2)',
                'python'
            ),
        ]);
        assert.deepStrictEqual(actual, expected);
    });

    test('Non-JSON input', () => {
        const deserializer = new NotebookDeserializer();
        assert.throws(() => deserializer.deserialize('some bad input'), /The input is not a valid JSON value/);
    });

    test('Non-notebook input', () => {
        const deserializer = new NotebookDeserializer();
        const data: NotebookDto | { cells: any } = {
            nbformat: 4,
            nbformat_minor: 5,
            cells: [{}]
        };
        assert.throws(() => deserializer.deserialize(JSON.stringify(data)), /The input is not a valid notebook/);
    });
});
