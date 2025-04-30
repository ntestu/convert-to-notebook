import * as vscode from 'vscode';
import { CELL_KIND_BY_TYPE, validateNotebookDto } from './dtos';

export class NotebookDeserializer {
    public deserialize(source: string): vscode.NotebookData {
        let notebookDto: unknown;

        try {
            notebookDto = JSON.parse(source);
        } catch (e) {
            throw new NotebookDeserializationError('The input is not a valid JSON value', {
                cause: e
            });
        }

        validateNotebookDto(notebookDto);
        const cells = notebookDto.cells.map(cellDto => new vscode.NotebookCellData(
            CELL_KIND_BY_TYPE[cellDto.cell_type],
            Array.isArray(cellDto.source) ? cellDto.source.join("\n") : cellDto.source,
            cellDto.cell_type === 'code' ? 'python' : 'markdown'
        ));
        return new vscode.NotebookData(cells);
    }
}

export class NotebookDeserializationError extends Error {}
