'use strict';

const fs = require('fs-extra');
const path = require('path');
const ts = require('typescript');

module.exports = (file) => new Promise((resolve, reject) => {
    try {
        const config = readConfig(file);
        const program = ts.createProgram(config.fileNames, config.options);
        const emitResult = program.emit();
        const errors = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics || []);

        if (errors.length > 0) {
            throw parseErrors(errors);
        }

        if (emitResult.emitSkipped) {
            reject(`Emit skipped on ${ file.replace(path.dirname(file), '') }`);
        } else {
            resolve();
        }
    } catch (e) {
        reject(e);
    }
});

const readConfig = (file) => {
    const fileText = fs.readFileSync(file, 'utf8');
    const contents = ts.parseConfigFileTextToJson(file, fileText);

    if (contents.config) {
        const parsedContents = ts.parseJsonConfigFileContent(
            contents.config,
            ts.sys,
            path.dirname(file)
        );

        if (parsedContents.errors.length > 0) {
            // throw error?
            throw parseErrors(parsedContents.errors);
        }

        return parsedContents;
    } else {
        // throw error?
        throw parseErrors([contents.error]);
    }
};

const parseErrors = (diagnostics) => diagnostics.map(({ file, messageText, start}) => {
    let message = 'Error';

    if (file) {
        const { line, char } = file.getLineAndCharacterOfPosition(start);

        message += ` ${ file.fileName } (${ line + 1 }, ${ character + 1 })`;
    }

    return message + ': ' + ts.flattenDiagnosticMessageText(messageText, '\n');
}).join('\n');
