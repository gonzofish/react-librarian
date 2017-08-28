'use strict';

const fs = require('fs-extra');
const erector = require('erector-set');
const path = require('path');

const {
    caseConvert,
    colorize,
    file,
    input,
    logging,
    project
} = require('../../tools');

let logger;

module.exports = () => {
    return erector.inquire(getQuestions(), true, getPreviousTransforms());
};

const getQuestions = () => {
    const pkgLocation = file.findPackageJson();
    const pkg = file.include(pkgLocation);
    const gitLocation = file.resolver.manual(
        path.dirname(pkgLocation),
        '.git'
    );
    const gitExists = fs.existsSync(gitLocation);
    const git = {
        answer: gitExists ? 'N' : 'Y',
        question: gitExists ? 'Re-initialize Git?' : 'Initialize Git?'
    };
    // const src = file.resolver.create(pkgLocation, 'src');

    logger = logging.create('Initialize');

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

const checkNameFormat = (name) => {
    if (!name) {
        name = '';
    } else if (!checkPackageName(name)) {
        const message =
        '    Package name must have no capitals or special\n' +
        '    characters and be one of the below formats:\n' +
        '        @scope/package-name\n' +
        '        package-name';

        logger.error(colorize.colorize(message, ['red']));
        name = null;
    }

    return name;
};

const checkPackageName = (name) =>
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= 214 &&
    name.trim() === name &&
    name.toLowerCase() === name &&
    /^[^._-]/.test(name) &&
    /[^._-]$/.test(name) &&
    /^(?:@[^/]+[/])?[^/]+$/.test(name) &&
    /^[a-z0-9]*$/.test(name.replace(/(^@|[-/])/g, ''));

const extractPackageName = (name) => {
    if (project.checkIsScopedName(name)) {
        name = name.split('/')[1];
    }

    return name;
};

const getPreviousTransforms = () => ({
    git: input.convertYesNoValue
});
