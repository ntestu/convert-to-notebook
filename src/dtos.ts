import * as vscode from 'vscode';
import schema from './notebookDto.schema.json';
import Ajv from 'ajv';
import { NotebookDeserializationError } from './notebookDeserializer';

export type NotebookDto = {
    nbformat: number;
    nbformat_minor: number;
    cells: CellDto[];
};

export type CellDto = {
    cell_type: CellDtoType;
    source: string | string[];
};

type CellDtoType = 'markdown' | 'code';

export const CELL_KIND_BY_TYPE = {
    markdown: vscode.NotebookCellKind.Markup,
    code: vscode.NotebookCellKind.Code,
} as const satisfies Record<CellDtoType, vscode.NotebookCellKind>;

const ajvValidateNotebookDto = new Ajv().compile(schema);

export function validateNotebookDto(value: any): asserts value is NotebookDto {
    if (!ajvValidateNotebookDto(value)) {
        let message = "The input is not a valid notebook.";

        if ((ajvValidateNotebookDto.errors?.length ?? 0) > 0) {
            message += ' Validation errors:\n';
            message += ajvValidateNotebookDto.errors!
                .map(error => `${error.instancePath || '/'} ${error.message || 'is not valid'}`)
                .join('\n');
        }

        throw new NotebookDeserializationError(message);
    }
}
