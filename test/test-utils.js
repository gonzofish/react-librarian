'use strict';

const fs = require('fs-extra');
const erector = require('erector-set');
const path = require('path');

const tools = require('../tools');

const make = (command) => function () {
    return command.apply(command, Array.from(arguments));
}

const mock = (sandbox) => {
    erector.construct.setTestMode(true);

    const fsExists = fs.existsSync;
    const mocks = {
        case: {
            dashToPascal: sandbox.stub(tools.caseConvert, 'dashToPascal'),
            dashToWords: sandbox.stub(tools.caseConvert, 'dashToWords'),
        },
        erector: {
            construct: sandbox.stub(erector, 'construct'),
            inquire: sandbox.stub(erector, 'inquire')
        },
        getTemplates: sandbox.stub(tools.file, 'getTemplates'),
        findPackageJson: sandbox.stub(tools.file, 'findPackageJson'),
        fs: {
            exists: sandbox.stub(fs, 'existsSync'),
            realExists: fsExists
        },
        include: sandbox.stub(tools.file, 'include'),
        log: sandbox.spy(),
        logger: sandbox.stub(tools.logging, 'create'),
        path: {
            join: sandbox.stub(path, 'join')
        },
        resolver: {
            create: sandbox.stub(tools.file.resolver, 'create'),
            manual: sandbox.stub(tools.file.resolver, 'manual'),
            root: sandbox.stub(tools.file.resolver, 'root')
        }
    };

    mocks.erector.inquire.rejects();

    mocks.logger.returns({
        error: mocks.log,
        info: mocks.log,
        log: mocks.log,
        warning: mocks.log
    });

    mocks.path.join.callsFake((...args) => args.join('/'));

    mocks.resolver.create.callsFake((...createArgs) =>
        (...args) => argsPath(['/create'].concat(createArgs, args))
    );
    mocks.resolver.manual.callsFake((...args) =>
        argsPath(['/manual'].concat(args))
    );
    mocks.resolver.root.callsFake((...args) =>
        argsPath(['/root'].concat(args))
    );

    return mocks;
};

const argsPath = (args) => args.join('/');

module.exports = {
    make,
    mock
};
