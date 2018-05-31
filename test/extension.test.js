const assert = require('assert');
const vscode = require('vscode');
const extension = require('../extension');
const replaceCursorIndex = extension.replaceCursorIndex;
const replaceLine = extension.replaceLine;
const replaceEval = extension.replaceEval;

function clearCurrentDocument() {
    return vscode.window.activeTextEditor.edit(editBuilder => {
        const fullText = vscode.window.activeTextEditor.document.getText();

        const fullRange = new vscode.Range(
            vscode.window.activeTextEditor.document.positionAt(0),
            vscode.window.activeTextEditor.document.positionAt(fullText.length)
        )

        editBuilder.delete(fullRange);
    });
}


// I'm so so sorry.
/**
 * In order to run these tests completely we will open a new document or clear the current one
 *
 * This odd mixture of promises and intervals is just to avoid a message that comes up frequently
 * if you use only promises, "window has already been disposed" it's almost certainly something
 * I'm doing wrong, but this fixes the issue 95% of the time
 */
function setupEditorForTest() {
    return new Promise((resolve, reject) => {
        let step = 0;
        let waiting = 0;
        let currentDocument = null;

        let interval = setInterval(() => {
            if (waiting) return null;
            if (step === 0) {
                waiting = true;
                if (vscode.window) {
                    step += 1
                }
                waiting = false;
            } else if (step === 1) {
                waiting = true;
                if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
                    clearInterval(interval);
                    clearCurrentDocument().then(resolve);
                } else {
                    vscode.workspace.openTextDocument().then((document) => {
                        step += 1;
                        currentDocument = document;
                        waiting = false;
                    }, reject);
                }
            } else if (step === 2) {
                waiting = true;
                vscode.window.showTextDocument(currentDocument).then(editor => {
                    step += 1;
                    waiting=false;
                });
            } else if (step === 10) {
                clearInterval(interval);
                resolve();
            } else {
                step += 1;
            }
        }, 10);
    });
}

/**
 * Step 1. Load a blank text document
 * Step 2. Load a new editor window for that document
 * Step 3. Set the blank document content to a test string
 * Step 4. Select some text using multiple cursors in the editor window
 * Step 5. Execute extension code to replace selections with line numbers
 * Step 6. Assert replacement was successful
 */
suite("Selection Replacement Tests", () => {
	test("Replaces Selection With Line Numbers", (done) => {
        setupEditorForTest().then(() => {
            const editor = vscode.window.activeTextEditor;

            editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
            }).then(() => {
                editor.selections = [
                    new vscode.Selection(0, 0, 0, 0),
                    new vscode.Selection(4, 0, 4, 0),
                ];
                replaceLine().then(wasReplaced => {
                    assert.equal(editor.document.getText(), '1first\nsecond\nthird\nfourth\n5fifth\nsixth');

                    done();
                }, done);
            }, done);
        }).catch(done);
	});

    test("Replaces Selection With Cursor Numbers", (done) => {
        setupEditorForTest().then(() => {
            const editor = vscode.window.activeTextEditor;

            editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
            }).then(() => {
                editor.selections = [
                    new vscode.Selection(0, 0, 0, 0),
                    new vscode.Selection(4, 0, 4, 0),
                ];
                replaceCursorIndex().then(wasReplaced => {
                    assert.equal(editor.document.getText(), '0first\nsecond\nthird\nfourth\n1fifth\nsixth');

                    done();
                }, done);
            }, done);
        }).catch(done);
	});


    test("Replaces Selection With Evaluated JS", (done) => {
        setupEditorForTest().then(() => {
            const editor = vscode.window.activeTextEditor;

            editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), '1+2+3\n2*2\n"a".repeat(3)');
            }).then(() => {
                editor.selections = [
                    new vscode.Selection(0, 0, 0, 5),
                    new vscode.Selection(1, 0, 1, 3),
                    new vscode.Selection(2, 0, 2, 13),
                ];
                replaceEval().then(wasReplaced => {
                    assert.equal(editor.document.getText(), '6\n4\naaa');

                    done();
                }, done);
            }, done);
        }).catch(done);
    });
});
