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

function hexify() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    if (selections.length === 0) return undefined;

    return editor.edit(editBuilder => {
        for (let dex = 0; dex < selections.length; dex += 1) {
            const storedValue = editor.document.getText(selections[dex]);
            const hexValue = Buffer.from(storedValue).toString('hex');
            editBuilder.replace(selections[dex], hexValue);
        }
    });
}

function dehexify() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    if (selections.length === 0) return undefined;

    return editor.edit(editBuilder => {
        for (let dex = 0; dex < selections.length; dex += 1) {
            const storedValue = editor.document.getText(selections[dex]);
            const hexValue = Buffer.from(storedValue, 'hex').toString();
            editBuilder.replace(selections[dex], hexValue);
        }
    });
}

function rotateRight() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    if (selections.length === 0) return undefined;

    return editor.edit(editBuilder => {
        let swappies = editor.document.getText(selections[selections.length - 1]);
        for (let dex = 0; dex < selections.length; dex += 1) {
            const storedValue = editor.document.getText(selections[dex]);
            editBuilder.replace(selections[dex], swappies);
            swappies = storedValue;
        }
    });
}

function swap() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    if (selections.length === 0) return undefined;

    return editor.edit(editBuilder => {
        for (let dex = 0; dex < Math.floor(selections.length / 2); dex += 1) {
            const fromIndex = dex;
            const toIndex = selections.length - dex - 1;

            const fromValue = editor.document.getText(selections[fromIndex]);
            const toValue = editor.document.getText(selections[toIndex]);

            editBuilder.replace(selections[fromIndex], toValue);
            editBuilder.replace(selections[toIndex], fromValue);
        }
    });
}

function rotateLeft() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    if (selections.length === 0) return undefined;

    return editor.edit(editBuilder => {
        let swappies = editor.document.getText(selections[0]);
        for (let dex = selections.length - 1; dex >= 0; dex -= 1) {
            const storedValue = editor.document.getText(selections[dex]);
            editBuilder.replace(selections[dex], swappies);
            swappies = storedValue;
        }
    });
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
    context.subscriptions.push(vscode.commands.registerCommand('extension.rotate_left', rotateLeft));
    context.subscriptions.push(vscode.commands.registerCommand('extension.rotate_right', rotateRight));
    context.subscriptions.push(vscode.commands.registerCommand('extension.swap', swap));
    context.subscriptions.push(vscode.commands.registerCommand('extension.hexify', hexify));
    context.subscriptions.push(vscode.commands.registerCommand('extension.dehexify', dehexify));
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
exports.replaceCursorIndex = replaceCursorIndex;
exports.replaceLine = replaceLine;
exports.replaceEval = replaceEval;
exports.rotateLeft = rotateLeft;
exports.rotateRight = rotateRight;
exports.swap = swap;
exports.hexify = hexify;
exports.dehexify = dehexify;
