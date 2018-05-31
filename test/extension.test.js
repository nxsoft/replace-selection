const assert = require('assert');
const vscode = require('vscode');

const extension = require('../extension');

const replaceCursorIndex = extension.replaceCursorIndex;
const replaceLine = extension.replaceLine;

suite("Selection Replacement Tests", () => {
	test("Replaces Selection With Line Numbers", (done) => {

        vscode.workspace.openTextDocument().then((document) => {
            vscode.window.showTextDocument(document).then(editor => {
                editor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
                }).then(wasEdited => {
                    setTimeout(() => {
                        const innerEditor = vscode.window.activeTextEditor;
                        innerEditor.selections = [
                            new vscode.Selection(0, 0, 0, 0),
                            new vscode.Selection(4, 0, 0, 0),
                        ];
                        done();
                    }, 100);
                    // innerEditor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0));
                    // assert.equal(document.getText(), 'first\nsecond\nthird\nfourth\nfifth\nsixth');
                    // replaceCursorIndex().then(wasReplaced => {
                    //     assert.equal(document.getText(), '1first\nsecond\nthird\nfourth\n5fifth\nsixth');
                    //     done();
                    // }, (error) => { assert.fail(error);done(); });
                }, (error) => { assert.fail(error);done(); });
            });
        }, (error) => { assert.fail(error);done(); });
	});
});
