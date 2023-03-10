'use strict';
Object.defineProperty(exports, "__esModule", {
	value: true
});

const vscode = require('vscode');
const fs = require('fs');
const PathModule = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	var explode_folder = (folderPath) => {


		let parentFolderPath = PathModule.dirname(folderPath)

		let filesInFolder = fs.readdirSync(folderPath).map(
			file => {
				return {
					oldPath: PathModule.join(folderPath, PathModule.basename(file)),
					newPath: PathModule.join(parentFolderPath, PathModule.basename(file))
				};
			});

			let alreadyExistingFiles= filesInFolder.filter( file => fs.existsSync(file.newPath))

			if(alreadyExistingFiles.length>0) {
				let firstfile=PathModule.basename(alreadyExistingFiles[0].newPath);
				vscode.window.showErrorMessage(` ${alreadyExistingFiles.length} file(s) already exists in the destination dir (e.g. '${firstfile}'), exploding folder '${folderPath}' aborted`);
			}

			filesInFolder.forEach(file => {
				fs.renameSync(file.oldPath, file.newPath)
			});

			fs.rmdirSync(folderPath)


	}

	var new_folder_from_files = (clicked_file, selected_files, mode) => {

		if (!selected_files) {
			return;
		}

		let newFolderName = PathModule.parse(clicked_file.fsPath).name;
		let newFolderPath = PathModule.join(PathModule.dirname(clicked_file.fsPath), newFolderName);

		if (fs.existsSync(newFolderPath)) {
			vscode.window.showErrorMessage(`a Folder with Name '${newFolderName}' already exists in this location.`);
			return;
		}

		fs.mkdirSync(newFolderPath);
		if (!fs.existsSync(newFolderPath)) {
			vscode.window.showErrorMessage(`a Folder with Name '${newFolderName}' could not be created.`);
			return;
		}

		selected_files.forEach(file => {
			let newPath = PathModule.join(newFolderPath, PathModule.basename(file.fsPath));
			if (mode == "copy") {
				fs.copyFileSync(file.fsPath, newPath)
			} else {
				fs.renameSync(file.fsPath, newPath)
			}
		});
	};

	let disposable1 = vscode.commands.registerCommand('new-folder-with-selection.newFolderWithSelection', (clicked_file, selected_files) => {
		return new_folder_from_files(clicked_file, selected_files, "move");
	});

	context.subscriptions.push(disposable1);

	let disposable2 = vscode.commands.registerCommand('new-folder-with-selection.newFolderWithSelectionCopy', (clicked_file, selected_files) => {
		return new_folder_from_files(clicked_file, selected_files, "copy");
	});

	context.subscriptions.push(disposable2);

	let disposable3 = vscode.commands.registerCommand('new-folder-with-selection.explodeFolder', (clicked_file, selected_files) => {

		selected_files.forEach(fileOrFolder => {
			if (fs.existsSync(fileOrFolder.fsPath) && fs.lstatSync(fileOrFolder.fsPath).isDirectory()) {
				explode_folder(fileOrFolder.fsPath);
			}
		});

	});

	context.subscriptions.push(disposable3);


}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
