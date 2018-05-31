const assert = require('assert');
const vscode = require('vscode');

const extension = require('../extension');

const replaceCursorIndex = extension.replaceCursorIndex;
const replaceLine = extension.replaceLine;


/**
 * This is ugly AF, but unfortunately nesting these statements in a .then() chain fails. This
 * nasty work around is indeed nasty, I'm sorry you have to see it.
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
});
