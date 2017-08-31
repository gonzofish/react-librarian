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

    tap.test('#deleteFolder', (subSuite) => {
        const del = file.deleteFolder;
        let exists;
        let lstat;
        let mockResolve;
        let readdir;
        let rmdir;
        let unlink;

        subSuite.beforeEach((done) => {
            exists = sandbox.stub(fs, 'existsSync');
            lstat = sandbox.stub(fs, 'lstatSync');
            mockResolve = sandbox.stub(path, 'resolve');
            readdir = sandbox.stub(fs, 'readdirSync');
            rmdir = sandbox.stub(fs, 'rmdirSync');
            unlink = sandbox.stub(fs, 'unlinkSync');

            done();
        });

        subSuite.afterEach((done) => {
            exists.restore();
            lstat.restore();
            mockResolve.restore();
            readdir.restore();
            rmdir.restore();
            unlink.restore();

            done();
        });

        subSuite.test('should check if the folder exists', (test) => {
            test.plan(1);

            exists.returns(false);
            del('pizza/party');

            test.ok(exists.calledWith('pizza/party'));

            test.end();
        });

        subSuite.test('should read the directory\'s contents', (test) => {
            test.plan(1);

            exists.returns(true);
            readdir.returns([]);
            del('pizza/party');

            test.ok(readdir.calledWith('pizza/party'));

            test.end();
        });

        subSuite.test('should remove the directory', (test) => {
            test.plan(1);

            exists.returns(true);
            readdir.returns([]);
            del('pizza/party');

            test.ok(rmdir.calledWith('pizza/party'));

            test.end();
        });

        subSuite.test('should check if each file is a directory', (test) => {
            test.plan(3);

            exists.returns(true);
            readdir.returns([
                '12345',
                '67890'
            ]);
            lstat.returns({
                isDirectory() { return false; }
            });
            mockResolve.callsFake((prefix, suffix) => prefix + '/' + suffix);
            del('pizza/party');

            test.ok(lstat.calledTwice);
            test.ok(lstat.calledWith('pizza/party/12345'));
            test.ok(unlink.calledWith('pizza/party/12345'));

            test.end();
        });

        subSuite.test('should delete any child files & folders', (test) => {
            test.plan(2);

            exists.callsFake((dir) => dir === 'pizza/party');
            readdir.returns([
                '12345',
                '67890'
            ]);
            lstat.callsFake((dir) => ({
                isDirectory() { return dir === 'pizza/party/67890'; }
            }));
            mockResolve.callsFake((prefix, suffix) => prefix + '/' + suffix);

            del('pizza/party');

            test.ok(unlink.calledWith('pizza/party/12345'));
            test.ok(exists.calledWith('pizza/party/67890'));

            test.end();
        });

        subSuite.end();
    });

    tap.test('#getTemplates', (suite) => {
        const create = (templates) =>
            file.getTemplates('/root', '/root/current', templates);
        let mockResolve;

        suite.beforeEach((done) => {
            mockResolve = sandbox.stub(path, 'resolve');
            mockResolve.callsFake(function() {
                return Array.prototype.slice.call(arguments)
                    .join('/');
            });

            done();
        });

        suite.afterEach((done) => {
            mockResolve.restore();

            done();
        });

        suite.test('should return a list of erector template objects', (test) => {
            test.plan(1);

            const templates = create([
                { name: 'pizza', overwrite: false },
                { name: 'broccoli', update: true },
                { name: 'burger' }
            ]);

            test.deepEqual(templates, [
                {
                    check: undefined,
                    destination: '/root/pizza',
                    overwrite: false,
                    template: '/root/current/templates/pizza',
                    update: undefined
                },
                {
                    check: undefined,
                    destination: '/root/broccoli',
                    overwrite: undefined,
                    template: '/root/current/templates/broccoli',
                    update: true
                },
                {
                    check: undefined,
                    destination: '/root/burger',
                    overwrite: undefined,
                    template: '/root/current/templates/burger',
                    update: undefined
                }
            ]);

            test.end();
        });

        suite.test('should utilize the destination field if provided', (test) => {
            test.plan(1);

            const templates = create([
                { name: 'pizza', destination: '/the/pizzeria/palace' },
                { name: 'burger' }
            ]);

            test.deepEqual(templates, [
                {
                    check: undefined,
                    destination: '/the/pizzeria/palace',
                    overwrite: undefined,
                    template: '/root/current/templates/pizza',
                    update: undefined
                },
                {
                    check: undefined,
                    destination: '/root/burger',
                    overwrite: undefined,
                    template: '/root/current/templates/burger',
                    update: undefined
                }
            ]);

            test.end();
        });

        suite.test('should provide a blank template if .blank is truthy', (test) => {
            test.plan(1);

            const templates = create([
                { name: 'pizza' },
                { blank: true, name: 'broccoli' }
            ]);

            test.deepEqual(templates, [
                {
                    check: undefined,
                    destination: '/root/pizza',
                    overwrite: undefined,
                    template: '/root/current/templates/pizza',
                    update: undefined
                },
                {
                    check: undefined,
                    destination: '/root/broccoli',
                    overwrite: undefined,
                    template: undefined,
                    update: undefined
                }
            ]);

            test.end();
        });

        suite.end();
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

    suite.test('.versions', (subSuite) => {
        const versions = file.versions;
        let findPackage;
        let include;
        let manual;

        subSuite.beforeEach((done) => {
            findPackage = sandbox.stub(file, 'findPackageJson');
            include = sandbox.stub(file, 'include');
            manual = sandbox.stub(file.resolver, 'manual');

            findPackage.returns('pizza');
            manual.returns('banana');

            done();
        });

        subSuite.afterEach((done) => {
            sandbox.restore();
            done();
        });

        subSuite.test('#checkIsBranch should return true for URLs', (test) => {
            const check = versions.checkIsBranch;

            test.plan(5);

            test.ok(check('https://github.com/gonzofish/react-librarian'));
            test.ok(check('http://github.com/gonzofish/react-librarian'));
            test.ok(check('git+https://github.com/gonzofish/react-librarian'));
            test.ok(check('git+http://github.com/gonzofish/react-librarian'));
            test.notOk(check('pizza'));

            test.end();
        });

        subSuite.test('#get should return the installed react-librarian version for non-branch', (test) => {
            include.callsFake((version) => {
                if (version === 'banana') {
                    return { version };
                } else {
                    return {
                        devDependencies: {
                            'react-librarian': version
                        }
                    };
                }
            });

            test.plan(2);
            test.equal(versions.get(), 'banana');
            test.ok(include.calledWith('banana'));
            test.end();
        });

        subSuite.test('#get should use the react-librarian in dependencies if its not in devDependencies', (test) => {
            include.callsFake((version) => {
                if (version === 'banana') {
                    return { version };
                } else {
                    return {
                        dependencies: {
                            'react-librarian': version
                        }
                    };
                }
            });

            test.plan(2);
            test.equal(versions.get(), 'banana');
            test.ok(include.calledWith('pizza'));
            test.end();
        });

        subSuite.test('#get should use the react-librarian installed if none exists in the project package.json', (test) => {
            include.callsFake((version) => {
                if (version === 'banana') {
                    return { version };
                }
            });

            test.plan(1);
            test.equal(versions.get(), 'banana');
            test.end();
        });

        subSuite.test('#get should return the URL for an installed branch version', (test) => {
            include.callsFake((version) => {
                return {
                    devDependencies: {
                        'react-librarian': 'https://' + version
                    }
                };
            });

            test.plan(2);
            test.equal(versions.get(), 'https://pizza');
            test.notOk(manual.called);
            test.end();
        });

        subSuite.end();
    });


    suite.end();
});
