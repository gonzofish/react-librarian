'use strict';

const sinon = require('sinon');
const tap = require('tap');

const convert = require('../../tools/case-convert');

const sandbox = sinon.sandbox.create();

tap.test('Tool: caseConvert', (suite) => {
    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('#checkIsDashCase should return tru for a dash-case', (test) => {
        const check = convert.checkIsDashCase;

        test.plan(2);
        test.ok(check('my-name'), true);
        test.notOk(check('-nope'), false);

        test.end();
    });

    suite.test('#checkIsPascalCase should return true for PascalCase', (test) => {
        const check = convert.checkIsPascalCase;

        test.plan(3);
        test.ok(check('PascalCase'), true);
        test.notOk(check('PascalCase2'), false);
        test.notOk(check('dash-case'), false);

        test.end();
    });

    suite.test('#dashToCamel should convert dash-case to camelCase', (test) => {
        test.plan(1);
        test.equal(
            convert.dashToCamel('pizza-party-place'),
            'pizzaPartyPlace'
        );
        test.end();
    });

    suite.test('#dashToPascal should convert dash-case to PascalCase', (test) => {
        test.plan(1);
        test.equal(
            convert.dashToPascal('big-burger-barn'),
            'BigBurgerBarn'
        );
        test.end();
    });

    suite.test('#dashToWords should convert dash-case into words', (test) => {
        test.plan(1);
        test.equal(
            convert.dashToWords('tasty-taco-time'),
            'Tasty Taco Time'
        );
        test.end();
    });

    suite.end();
});
