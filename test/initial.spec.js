'use strict';

const sinon = require('sinon');
const tap = require('tap');

const initial = require('../commands/initial');
const utils = require('./test-utils');

const sandbox = sinon.sandbox.create();

tap.test('Command: initial', (suite) => {
    let make;
    let mocks;

    suite.beforeEach((done) => {
        make = utils.make(initial);
        mocks = utils.mock(sandbox);
        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should call erector.inquire', (test) => {
        test.plan(2);

        mocks.fs.exists.callsFake((value) =>
            value === '/root/.git' || mocks.fs.realExists(value)
        );
        mocks.findPackageJson.returns('/root/package.json');
        mocks.include.callsFake((filePath) => {
            if (filePath === '/root/package.json') {
                return {
                    name: 'fake-library',
                    repository: { url: 'https://fake.repo' },
                    version: '100.200.300'
                };
            }
        });

        make().catch(() => {
            test.ok(mocks.erector.inquire.calledOnce);
            test.ok(mocks.erector.inquire.calledWith(
                [
                    {
                        defaultAnswer: 'fake-library',
                        name: 'name',
                        question: 'Library name:',
                        transform: sinon.match.instanceOf(Function)
                    },
                    {
                        name: 'packageName',
                        useAnswer: 'name',
                        transform: sinon.match.instanceOf(Function)
                    },
                    {
                        defaultAnswer: 'https://fake.repo',
                        name: 'repoUrl',
                        question: 'Repository URL:'
                    },
                    {
                        defaultAnswer: '100.200.300',
                        name: 'version',
                        question: 'Version:'
                    },
                    {
                        defaultAnswer: sinon.match.instanceOf(Function),
                        name: 'readmeTitle',
                        question: 'README Title:'
                    },
                    {
                        defaultAnswer: 'N',
                        name: 'git',
                        question: 'Re-initialize Git?'
                    }
                ],
                true,
                []
            ));
            test.done();
        });
    });

    suite.end();
});
