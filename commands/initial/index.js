'use strict';

const fs = require('fs-extra');
const erector = require('erector-set');
const path = require('path');

const { caseConvert, file, input } = require('../../tools');

module.exports = () => {
    return erector.inquire(getQuestions(), true, getPreviousTransforms());
};

const getQuestions = () => {
    const pkgLocation = file.findPackageJson();
    const pkg = file.include(pkgLocation);
    const gitLocation = path.join(
        path.dirname(pkgLocation),
        '.git'
    );
    const gitExists = fs.existsSync(gitLocation);
    const git = {
        answer: gitExists ? 'N' : 'Y',
        question: gitExists ? 'Re-initialize Git?' : 'Initialize Git?'
    };

    return [
        {
            defaultAnswer: pkg.name,
            name: 'name',
            question: 'Library name:',
            transform: checkNameFormat
        },
        {
            name: 'packageName',
            useAnswer: 'name',
            transform: extractPackageName
        },
        {
            defaultAnswer: (pkg.repository && pkg.repository.url) || undefined,
            name: 'repoUrl',
            question: 'Repository URL:'
        },
        {
            defaultAnswer: pkg.version || '0.0.0',
            name: 'version',
            question: 'Version:'
        },
        {
            defaultAnswer: (answers) => caseConvert.dashToWords(answers[1].answer),
            name: 'readmeTitle',
            question: 'README Title:'
        },
        {
            defaultAnswer: git.answer,
            name: 'git',
            question: git.question
        }
    ];
};

const checkNameFormat = (value) => value;
const extractPackageName = (value) => value;

const getPreviousTransforms = () => ({
    git: input.convertYesNoValue
});
