'use strict';

const tap = require('tap');

const colorize = require('../../tools/colorize');

tap.test('Tools: colorize', (suite) => {
    suite.test('#colorize should chain chalk commands', (test) => {
        test.plan(1);

        const message = colorize.colorize('this is my message', ['green', 'bgRed', 'bold']);

        test.equal(message, 'this is my message');

        test.end();
    });

    suite.test('#colorize should default to reset styles', (test) => {
        test.plan(1);

        const message = colorize.colorize('this is my message');

        test.equal(message, 'this is my message');

        test.end();
    });

    suite.end();
});
