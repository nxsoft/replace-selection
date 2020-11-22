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

function swapCommentString(commentString) {
    const replacer = commentString.match(/^(.*?)\s*\/\/\s*(.*)$/);
    if (!replacer) return '// ' + commentString;
    return replacer[2] + ' // ' + replacer[1];
}

function swapCommentStringSmarter(commentString) {
    const state = {};
    for (let dex = 0; dex < commentString.length; dex += 1) {
        const char = commentString[dex];
        if (char === '"') {
            if (state.inDoubleQuote) {
                if (!state.inBackSlash) {
                    state.inDoubleQuote = false;
                }
            } else if (!state.inSingleQuote && !state.inBackTick && !state.inBlockComment) {
                state.inDoubleQuote = true;
            }
        }
        if (char === "'") {
            if (state.inSingleQuote) {
                if (!state.inBackSlash) {
                    state.inSingleQuote = false;
                }
            } else if (!state.inDoubleQuote && !state.inBackTick && !state.inBlockComment) {
                state.inSingleQuote = true;
            }
        }
        if (char === "`") {
            if (state.inBackTick) {
                if (!state.inBackSlash) {
                    state.inBackTick = false;
                }
            } else if (!state.inDoubleQuote && !state.inSingleQuote && !state.inBlockComment) {
                state.inBackTick = true;
            }
        }
        if (char === '\\' && (state.inDoubleQuote || state.inSingleQuote || state.inBackTick)) {
            state.inBackSlash = true;
        } else {
            state.inBackSlash = false;
        }
        if (char === '/' && (!state.inDoubleQuote && !state.inSingleQuote && !state.inBackTick && !state.inBackSlash && !state.inBlockComment)) {
            if (state.lastForwardSlash === dex - 1) {
                const first = commentString.slice(dex + 1).trim();
                const second = commentString.slice(0, state.lastForwardSlash).trim();
                if (second.length === 0) return first;
                return first + ' // ' + second;
            }
            state.lastForwardSlash = dex;
        }
    }

    return '// ' + commentString;
}

function swapCommentContent() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    if (selections.length === 0) return undefined;

    return editor.edit(editBuilder => {
        for (let dex = 0; dex < selections.length; dex += 1) {
            const selection = selections[dex];
            if (selection.start.isEqual(selection.end)) {
                const line = editor.document.lineAt(selections[dex].start.line);
                editBuilder.replace(line.range, swapCommentStringSmarter(line.text));
            } else {
                const fromValue = editor.document.getText(selection);
                editBuilder.replace(selection, swapCommentStringSmarter(fromValue));
            }
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
    return editBuilder.replace(selection, '' + dex);
});

function replaceCasing(input, caseReplaceFunction) {
    const separatorRegex = new RegExp(/(\w)[-_](\w)/g);
    const capsRegex = new RegExp(/([a-z])([A-Z])/g);
    let replaced = input;
    let nth = 0;
    replaced = replaced.replace(separatorRegex, (match, firstCapture, secondCapture) => {
        const result = caseReplaceFunction(firstCapture, secondCapture, nth);
        nth += 1;
        return result;
    });
    replaced = replaced.replace(capsRegex, (match, firstCapture, secondCapture) => {
        const result = caseReplaceFunction(firstCapture, secondCapture, nth);
        nth += 1;
        return result;
    });
    return replaced;
}

function replaceCasingWithSeparator(input, separator) {
    return replaceCasing(input, (first, second) => {
        return first.toLowerCase() + separator + second.toLowerCase();
    });
}

function replaceCasingWithCamel(input, firstAsWell) {
    const replaced = replaceCasing(input, (first, second, dex) => {
        return first.toLowerCase() + second.toUpperCase();
    });
    if (firstAsWell) {
        return replaced.slice(0, 1).toUpperCase() + replaced.slice(1);
    }
    return replaced;
}

const replaceSnake = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    const currentValue = editor.document.getText(selection);
    return editBuilder.replace(selection, replaceCasingWithSeparator(currentValue, '_'));
});

const replaceCamel = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    const currentValue = editor.document.getText(selection);
    return editBuilder.replace(selection, replaceCasingWithCamel(currentValue, false));
});

const replaceUpperCamel = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    const currentValue = editor.document.getText(selection);
    return editBuilder.replace(selection, replaceCasingWithCamel(currentValue, true));
});

const replaceEvenSpacing = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    const currentValue = editor.document.getText(selection);
    return editBuilder.replace(selection, currentValue.replace(/([^\s])\s\s+/g, '$1 '));
});

const replaceAddPadding = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    const currentValue = editor.document.getText(selection);
    return editBuilder.replace(selection, ` ${currentValue} `);
});

const replaceLine = selectionReplaceFunctionCreator((editBuilder, editor, selection, dex) => {
    return editBuilder.replace(selection, '' + (selection.start.line + 1));
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
    context.subscriptions.push(vscode.commands.registerCommand('extension.swap_comment', swapCommentContent));
    context.subscriptions.push(vscode.commands.registerCommand('extension.hexify', hexify));
    context.subscriptions.push(vscode.commands.registerCommand('extension.dehexify', dehexify));
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_snake', replaceSnake));
    context.subscriptions.push(vscode.commands.registerCommand('extension.replaceCamel', replaceCamel));
    context.subscriptions.push(vscode.commands.registerCommand('extension.ReplaceUpperCamel', replaceUpperCamel));
    context.subscriptions.push(vscode.commands.registerCommand('extension.replace_even_spacing', replaceEvenSpacing));
    context.subscriptions.push(vscode.commands.registerCommand('extension.add_padding_to_selection', replaceAddPadding));
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
exports.swapCommentContent = swapCommentContent;
exports.swapCommentStringSmarter = swapCommentStringSmarter;
exports.hexify = hexify;
exports.dehexify = dehexify;
exports.replaceSnake = replaceSnake;
exports.replaceCamel = replaceCamel;
exports.replaceUpperCamel = replaceUpperCamel;
exports.replaceEvenSpacing = replaceEvenSpacing;
exports.replaceAddPadding = replaceAddPadding;
