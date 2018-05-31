const vscode = require('vscode');

const selectionReplaceFunctionCreator = (editorCallback) => {
    return () => {
        const editor = vscode.window.activeTextEditor;
        const selections = editor.selections;
        return editor.edit(editBuilder => {
            for (let dex = 0; dex < selections.length; dex += 1) {
                editorCallback(editBuilder, editor, selections[dex], dex);
            }
        });
    }
}

const replaceCursorIndex = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    editBuilder.replace(selection, '' + dex);
});

const replaceLine = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    editBuilder.replace(selection, '' + (selection.start.line + 1));
});

const replaceEval = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    const currentText = editor.document.getText(selection);
    try {
        const result = eval(currentText);
        if (typeof result === 'object') {
            editBuilder.replace(selection, JSON.stringify(result));
        } else {
            editBuilder.replace(selection, '' + result);
        }
    } catch (err) {
        console.error(err);
    }
});

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_line', replaceLine));
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_cursor_index', replaceCursorIndex));
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_eval', replaceEval));
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
exports.replaceCursorIndex = replaceCursorIndex;
exports.replaceLine = replaceLine;
exports.replaceEval = replaceEval;
