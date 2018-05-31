const vscode = require('vscode');

const selectionReplaceFunctionCreator = (editorCallback) => {
    return () => {
        const editor = vscode.window.activeTextEditor;
        const selections = editor.selections;
        return editor.edit(editBuilder => {
            for (let dex = 0; dex < selections.length; dex += 1) {
                editorCallback(editBuilder, selections[dex], dex);
            }
        });
    }
}

const replaceCursorIndex = selectionReplaceFunctionCreator((editBuilder, selection, dex) => {
    editBuilder.replace(selection, '' + dex);
});

const replaceLine = selectionReplaceFunctionCreator((editBuilder, selection, dex) => {
    editBuilder.replace(selection, '' + (selection.start.line + 1));
});

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_line', replaceLine));
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_cursor_index', replaceCursorIndex));
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
exports.replaceCursorIndex = replaceCursorIndex;
exports.replaceLine = replaceLine;
