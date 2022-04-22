// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// eslint-disable-next-line import/no-unresolved
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const acceptedLanguages = ["html", "php"];
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "abem-sorter.sortAbemClasses",
    () => {
      // get all text of current document
      const editor = vscode.window.activeTextEditor;
      if (editor && acceptedLanguages.includes(editor.document.languageId)) {
        const doc = editor.document;
        const re = /(\s*<.*class=")(.*?)(".*>)/;
        const { sortOrder } = vscode.workspace.getConfiguration("abem-sorter");

        editor.edit((editBuilder) => {
          for (let i = 0; i < doc.lineCount; i += 1) {
            const line = doc.lineAt(i);
            const { range } = line;
            const text = doc.getText(range);
            const match = text.match(re);
            // get all lines with matching structure <_class=""_>
            if (match) {
              // get the content inside quotes behind class
              const classes = match[2].split(/\s+/).sort((a, b) => {
                // sort them by given structure. let's use alphabetical for now
                let aIdx = sortOrder.indexOf(a.split("-")[0]);
                let bIdx = sortOrder.indexOf(b.split("-")[0]);

                // indexOf returns -1 if not found, so we make sure unrecognized elements go to the end
                if (aIdx === -1) {
                  aIdx = sortOrder.length;
                }

                if (bIdx === -1) {
                  bIdx = sortOrder.length;
                }

                if (aIdx === bIdx) {
                  // sort items with same prefix alphabetically
                  return a.localeCompare(b);
                }
                return aIdx - bIdx;
              });

              // put everything back together
              const sortedClasses = classes.join(" ");
              const replaceString = `${match[1]}${sortedClasses}${match[3]}`;
              editBuilder.replace(range, replaceString);
            }
          }
        });
        vscode.window.showInformationMessage("Classes Sorted!");
      } else {
        vscode.window.showErrorMessage("No active Editor or not an HTML-file");
      }
    }
  );
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
