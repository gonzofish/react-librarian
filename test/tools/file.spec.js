'use strict';

const fs = require('fs-extra');
const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const file = require('../../tools/file');

const sandbox = sinon.sandbox.create();

tap.test('Tool: file', (suite) => {
    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('#findPackageJson should find the nearest package.json', (test) => {
        const cwd = sandbox.stub(process, 'cwd');
        const dirname = sandbox.stub(path, 'dirname');
        const join = sandbox.stub(path, 'join');
        const exists = sandbox.stub(fs, 'existsSync');

        cwd.returns('/peanut/butter/jelly/time');
        dirname.callsFake((location) => {
            const parts = location.split('/');

            return parts.slice(0, parts.length - 1).join('/');
        });
        join.callsFake((...parts) => parts.join('/'));
        exists.callsFake((value) => value === '/peanut/package.json');

        test.plan(1);

        test.equal(file.findPackageJson(), '/peanut/package.json');
        test.end();
    });

    suite.test('resolver', (resolverSuite) => {
        let resolver = file.resolver;
        let pathResolve;
        let cwd;

        resolverSuite.beforeEach((done) => {
            cwd = sandbox.stub(process, 'cwd');
            cwd.returns('/cwd');

            pathResolve = sandbox.stub(path, 'resolve');
            pathResolve.callsFake((...args) => args.join('/'));
            done();
        });

        resolverSuite.test('#create should return a function', (test) => {
            test.plan(2);

            const create = resolver.create('peanut', 'butter');

            test.equal(typeof create, 'function');
            test.equal(create('jelly', 'time'), '/cwd/peanut/butter/jelly/time');

            test.end();
        });

        resolverSuite.test('#manual should return a joined path', (test) => {
            test.plan(1);

            test.equal(
                resolver.manual('peanut', 'butter', 'jelly', 'time'),
                'peanut/butter/jelly/time'
            );
            test.end();
        });

        resolverSuite.test('#root should return a path relative to the current directory', (test) => {
            test.plan(1);

            test.equal(
                resolver.root('peanut', 'butter', 'jelly', 'time'),
                '/cwd/peanut/butter/jelly/time'
            );
            test.end();
        });

        resolverSuite.end();
    });

    suite.end();
});
