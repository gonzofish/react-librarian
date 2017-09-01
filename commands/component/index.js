'use strict';

const erector = require('erector-set');
const path = require('path');

const { caseConvert, file, logging } = require('../../tools');
let logger;

module.exports = (type, tag) => {
    logger = logging.create('Component');
    const remains = getRemainingQuestions(type, tag);

    return erector.inquire(remains.questions).then((answers) =>
        construct(answers.concat(remains.answers))
    );
};

const getRemainingQuestions = (type, tag) => {
    const verifiedType = getType(type);

    if (type && !verifiedType) {
        tag = type;
    }

    const questions = [
        getRemainingTag(tag),
        getRemainingType(verifiedType)
    ];

    return questions.reduce((remains, remainder) => {
        remains.answers = remains.answers.concat(remainder.answers || []);
        remains.questions = remains.questions.concat(remainder.questions || []);

        return remains;
    }, { answers: [], questions: [] });
};

const getRemainingTag = (tag) => {
    const remains = {};

    if (tag) {
        remains.answers = [
            { answer: tag, name: 'name' },
            { answer: caseConvert.dashToPascal(tag), name: 'componentName' }
        ];
    } else {
        remains.questions = [
            {
                name: 'tag',
                question: 'Tag name (in dash-case):',
                transform: (value) => caseConvert.checkIsDashCase(value) ? value : null
            },
            {
                name: 'componentName',
                useAnswer: 'tag',
                transform: (value) => caseConvert.dashToPascal(value)
            }
        ];
    }

    return remains;
};

const getRemainingType = (type) => {
    const remains = {};

    if (type) {
        remains.answers = [
            { answer: type, name: 'type' }
        ];
    } else {
        remains.questions = [
            {
                name: 'type',
                question: 'Component type:',
                transform: (value) => getType(value) || null
            }
        ];
    }

    return remains;
};

const getType = (type) => {
    switch (type) {
        case 'c':
        case 'cl':
        case 'class':
            return 'class';
        case 'f':
        case 'func':
        case 'function':
        case 'functional':
            return 'functional';
        default:
            return '';
    }
};

const construct = (answers) => {
    const templates = getTemplates(answers);
    const results = erector.construct(answers, templates);

    notify(answers);

    return results;
};

const getTemplates = (answers) => {
    const pkgLocation = file.findPackageJson();
    const pkgDir = path.dirname(pkgLocation);
    const components = file.resolver.create(pkgDir, 'src', 'components');
    const type = answers.find((answer) => answer.name === 'type').answer;

    return file.getTemplates(pkgDir, __dirname, [
        { destination: components('{{ componentName }}.tsx'), name: `${ type }.tsx` },
        { destination: components('__tests__', '{{ componentName }}.spec.tsx'), name: 'spec.tsx' }
    ]);
};

const notify = (answers) => {
    const componentName = answers.find((answer) => answer.name === 'componentName').answer;

    logger.info(`Don't forget to add the following to src/index.ts:`);
    logger.info(`    import { ${ componentName } } from './components/${ componentName }';`)
    logger.info(`In order for it to be available to consumers.`);
};
