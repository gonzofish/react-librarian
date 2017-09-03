'use strict';

const childProcess = require('child_process');
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
    const pkgLocation = file.findPackageJson();
    const pkgDir = path.dirname(pkgLocation);
    const pkg = file.include(pkgLocation);
    logger = logging.create('Initialize');

    return erector.inquire(getQuestions(pkg, pkgDir), true, getPreviousTransforms()).then((answers) => {
        const cwd = process.cwd();
        const root = file.resolver.create(pkgDir);
        const src = file.resolver.create(root(), 'src');
        const git = answers.find((answer) => answer.name === 'git');
        const librarianVersion = file.versions.get();
        const templates = file.getTemplates(pkgDir, __dirname, [
            { name: 'configs/tsconfig.build.json', overwrite: true },
            { name: 'configs/tsconfig.es2015.json', overwrite: true },
            { name: 'configs/tsconfig.es5.json', overwrite: true },
            { name: 'configs/webpack.config.js', overwrite: true },
            { name: 'example/App.tsx' },
            { name: 'example/index.html' },
            { name: 'example/vendor.ts' },
            { name: 'src/index.ts' },
            { name: 'tasks/build.js', overwrite: true },
            { name: 'tasks/glob-copy.js', overwrite: true },
            { name: 'tasks/rollup.js', overwrite: true },
            { name: 'tasks/tsc.js', overwrite: true },
            { destination: root('.gitignore'), name: '__gitignore' },
            { name: 'package.json', overwrite: true },
            { name: 'README.md' },
            { name: 'tsconfig.json', overwrite: true },
            { name: 'tslint.json', overwrite: true }
        ]);
        const componentTemplates = file.getTemplates(src(), file.resolver.manual(__dirname, '..', 'component'), [
            { destination: src('components', '{{ tag }}.tsx'), name: 'functional.tsx' },
            { destination: src('components', '__tests__', '{{ tag }}.spec.tsx'), name: 'spec.tsx' }
        ]);
        const result = erector.construct(
            answers.concat({ answer: librarianVersion, name: 'librarianVersion' }),
            templates.concat(componentTemplates)
        );

        process.chdir(root());

        if (git.answer) {
            initGit(root);
        }

        exec('npm i');
        process.chdir(cwd);

        return result;
    });
};

const getQuestions = (pkg, pkgDir) => {
    const gitLocation = file.resolver.manual(
        pkgDir,
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
            name: 'tag',
            useAnswer: 'packageName',
            transform: (value) => caseConvert.dashToPascal(value)
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

const initGit = (root) => {
    file.deleteFolder(root('.git'));
    exec('git init');
};

const exec = (cmd, args = []) => {
    const isWindows = /^win/.test(process.platform);

    /* istanbul ignore next */
    if (isWindows) {
        cmd = cmd + '.cmd';
    }

    childProcess.execSync(cmd, args, { stdio: [0, 1, 2] })
};
