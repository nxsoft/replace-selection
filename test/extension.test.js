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
            vscode.window.activeTextEditor.document.positionAt(fullText.length - 1)
        )

        editBuilder.delete(fullRange);
    });
}

/**
 * This is ugly AF, but unfortunately nesting these statements in a .then() chain fails. This
 * nasty work around is indeed nasty, I'm sorry you have to see it.
 * Step 1. Load a blank text document
 * Step 2. Load a new editor window for that document
 * Step 3. Set the blank document content to a test string
 * Step 4. Select some text using multiple cursors in the editor window
 * Step 5. Execute extension code to replace selections with line numbers
 * Step 6. Assert replacement was successful
 */
suite("Selection Replacement Tests", () => {
	test("Replaces Selection With Line Numbers", (done) => {
        let step = 0;
        let globalDocument = null;
        let globalEditor = null;
        let timeout = null;
        let waiting = false;

        timeout = setInterval(() => {
            if (waiting) return null;

            if (step === 0) {
                waiting = true;
                vscode.workspace.openTextDocument().then((document) => {
                    step += 1;
                    globalDocument = document;
                    waiting = false;
                }, (error) => { assert.fail(error);done(); });
            } else if (step === 1) {
                waiting = true;
                vscode.window.showTextDocument(globalDocument).then(editor => {
                    step += 1;
                    globalEditor = editor;
                    waiting=false;
                });
            } else if (step === 2) {
                clearInterval(timeout);

                globalEditor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
                }).then(wasEdited => {
                    const innerEditor = vscode.window.activeTextEditor;
                    innerEditor.selections = [
                        new vscode.Selection(0, 0, 0, 0),
                        new vscode.Selection(4, 0, 4, 0),
                    ];
                    assert.equal(globalDocument.getText(), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
                    replaceLine().then(wasReplaced => {
                        assert.equal(globalDocument.getText(), '1first\nsecond\nthird\nfourth\n5fifth\nsixth');

                        done();
                    }, (error) => { assert.fail(error);done(); });
                }, (error) => { assert.fail(error);done(); });
            }
        }, 10);
	});

    test("Replaces Selection With Cursor Numbers", (done) => {
        let step = 0;
        let globalDocument = null;
        let globalEditor = null;
        let timeout = null;
        let waiting = false;


        timeout = setInterval(() => {
            if (waiting) return null;

            if (step === 0) {
                waiting = true;
                vscode.workspace.openTextDocument().then((document) => {
                    step += 1;
                    globalDocument = document;
                    waiting = false;
                }, (error) => { assert.fail(error);done(); });
            } else if (step === 1) {
                waiting = true;
                vscode.window.showTextDocument(globalDocument).then(editor => {
                    step += 1;
                    globalEditor = editor;
                    waiting=false;
                });
            } else if (step === 2) {
                waiting = true;
                clearCurrentDocument().then(() => {
                    step += 1;
                    waiting = false;
                });
            } else if (step === 3) {
                clearInterval(timeout);

                globalEditor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
                }).then(wasEdited => {
                    const innerEditor = vscode.window.activeTextEditor;
                    innerEditor.selections = [
                        new vscode.Selection(0, 0, 0, 0),
                        new vscode.Selection(4, 0, 4, 0),
                    ];
                    assert.equal(globalDocument.getText(), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
                    replaceCursorIndex().then(wasReplaced => {
                        assert.equal(globalDocument.getText(), '0first\nsecond\nthird\nfourth\n1fifth\nsixth');

                        done();
                    }, (error) => { assert.fail(error);done(); });
                }, (error) => { assert.fail(error);done(); });
            }
        }, 10);
	});

    test("Replaces Selection With Evaluated JS", (done) => {
        let step = 0;
        let globalDocument = null;
        let globalEditor = null;
        let timeout = null;
        let waiting = false;


        timeout = setInterval(() => {
            if (waiting) return null;

            if (step === 0) {
                waiting = true;
                vscode.workspace.openTextDocument().then((document) => {
                    step += 1;
                    globalDocument = document;
                    waiting = false;
                }, (error) => { assert.fail(error);done(); });
            } else if (step === 1) {
                waiting = true;
                vscode.window.showTextDocument(globalDocument).then(editor => {
                    step += 1;
                    globalEditor = editor;
                    waiting=false;
                });
            } else if (step === 2) {
                waiting = true;
                clearCurrentDocument().then(() => {
                    step += 1;
                    waiting = false;
                });
            } else if (step === 3) {
                clearInterval(timeout);

                globalEditor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), '1+2+3\n2*2\n"a".repeat(3)');
                }).then(wasEdited => {
                    const innerEditor = vscode.window.activeTextEditor;
                    innerEditor.selections = [
                        new vscode.Selection(0, 0, 0, 5),
                        new vscode.Selection(1, 0, 1, 3),
                        new vscode.Selection(2, 0, 2, 13),
                    ];
                    assert.equal(globalDocument.getText(), '1+2+3\n2*2\n"a".repeat(3)');
                    replaceEval().then(wasReplaced => {
                        assert.equal(globalDocument.getText(), '6\n4\naaa');

                        done();
                    }, (error) => { assert.fail(error);done(); });
                }, (error) => { assert.fail(error);done(); });
            }
        }, 10);
	});
});
