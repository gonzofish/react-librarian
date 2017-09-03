'use strict';

const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const component = require('../commands/component');
const utils = require('./test-utils');

let sandbox = sinon.sandbox.create();

tap.test('Command: component', (suite) => {
    let make;
    let mocks;

    suite.beforeEach((done) => {
        make = utils.make(component);
        mocks = utils.mock(sandbox);

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should call erector.inquire', (test) => {
        test.plan(2);

        make().catch(() => {
            test.ok(mocks.erector.inquire.calledOnce);
            test.ok(mocks.erector.inquire.calledWith(
                [
                    {
                        name: 'tag',
                        question: 'Tag name (in dash-case):',
                        transform: sinon.match.instanceOf(Function)
                    },
                    {
                        name: 'componentName',
                        useAnswer: 'tag',
                        transform: sinon.match.instanceOf(Function)
                    },
                    {
                        name: 'type',
                        question: 'Component type:',
                        transform: sinon.match.instanceOf(Function)
                    }
                ]
            ));
            test.end();
        });
    });

    suite.test('should have tag transform that checks for dash-case', (test) => {
        test.plan(3);

        make().catch(() => {
            const { transform } = mocks.erector.inquire.lastCall.args[0][0];

            mocks.case.checkIsDashCase.returns(true);
            test.equal(transform('bobble'), 'bobble');

            mocks.case.checkIsDashCase.resetBehavior();
            mocks.case.checkIsDashCase.returns(false);
            test.equal(transform('bobble'), null);

            test.ok(mocks.case.checkIsDashCase.calledTwice);

            test.end();
        });
    });

    suite.test('should have a componentName transform that calls dashToPascal', (test) => {
        test.plan(1);

        make().catch(() => {
            const { transform } = mocks.erector.inquire.lastCall.args[0][1];

            mocks.case.dashToPascal.returns('burger');
            test.equal(transform('pizza'), 'burger');

            test.end();
        });
    });

    suite.test('should have a type transform that returns null for unknown types', (test) => {
        test.plan(8);

        make().catch(() => {
            const { transform } = mocks.erector.inquire.lastCall.args[0][2];

            test.equal(transform('c'), 'class');
            test.equal(transform('cl'), 'class');
            test.equal(transform('class'), 'class');
            test.equal(transform('f'), 'functional');
            test.equal(transform('func'), 'functional');
            test.equal(transform('function'), 'functional');
            test.equal(transform('functional'), 'functional');
            test.equal(transform('type'), null);

            test.end();
        });
    });

    suite.test('should only ask for a tag if a valid type is provided', (test) => {
        test.plan(1);

        make('c').catch(() => {
            test.ok(mocks.erector.inquire.calledWith(
                [
                    {
                        name: 'tag',
                        question: 'Tag name (in dash-case):',
                        transform: sinon.match.instanceOf(Function)
                    },
                    {
                        name: 'componentName',
                        useAnswer: 'tag',
                        transform: sinon.match.instanceOf(Function)
                    }
                ]
            ));

            test.end();
        });
    });

    suite.test('should only as for a type if only a tag is provided', (test) => {
        test.plan(1);

        make('my-tag').catch(() => {
            test.ok(mocks.erector.inquire.calledWith(
                [
                    {
                        name: 'type',
                        question: 'Component type:',
                        transform: sinon.match.instanceOf(Function)
                    }
                ]
            ));

            test.end();
        });
    });

    suite.test('should ask no questions if a type & tag are provided', (test) => {
        test.plan(1);

        make('f', 'my-tag').catch(() => {
            test.ok(mocks.erector.inquire.calledWith([]));
            test.end();
        });
    });

    suite.test('should construct the files for a functional component', (test) => {
        const answers = [
            { answer: 'pizza', name: 'type' },
            { answer: 'DeliciousFood', name: 'componentName' }
        ];
        const templates = [
            { name: 'pizza.tsx' },
            { name: 'spec.tsx' }
        ];

        mocks.erector.inquire.resetBehavior();
        mocks.erector.inquire.resolves(answers);

        mocks.findPackageJson.returns('/my/directory/package.json');
        mocks.getTemplates.returns(templates);

        test.plan(5);

        make().then(() => {
            test.ok(mocks.resolver.create.calledWith(
                '/my/directory', 'src', 'components'
            ));
            test.ok(mocks.erector.construct.calledWith(answers, templates));
            test.ok(mocks.log.firstCall.calledWith(`Don't forget to add the following to src/index.ts:`));
            test.ok(mocks.log.secondCall.calledWith(`    import { DeliciousFood } from './components/DeliciousFood';`));
            test.ok(mocks.log.thirdCall.calledWith(`In order for it to be available to consumers.`));
            test.end();
        });
    });

    suite.end();
});
