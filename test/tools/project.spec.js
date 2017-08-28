'use strict';

const tap = require('tap');

const project = require('../../tools/project');

tap.test('#checkIsScopedName', (test) => {
    const check = project.checkIsScopedName;

    test.plan(2);

    test.ok(check('@my-scoped/package'));
    test.notOk(check('my-package'));

    test.end();
});
