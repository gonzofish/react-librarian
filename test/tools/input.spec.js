'use strict';

const sinon = require('sinon');
const tap = require('tap');

const input = require('../../tools/input');

const sandbox = sinon.sandbox.create();

tap.test('Tools: input', (suite) => {
    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('#convertYesNoValue', (subSuite) => {
        const convert = input.convertYesNoValue;

        subSuite.test('should return "Y" if `true` is the value', (test) => {
            test.plan(1);
            test.equal(convert(true), 'Y');
            test.end();
        });

        subSuite.test('should return "N" if the value is falsey', (test) => {
            test.plan(4);

            test.equal(convert(), 'N');
            test.equal(convert(null), 'N');
            test.equal(convert(false), 'N');
            test.equal(convert(0), 'N');

            test.end();
        });

        subSuite.test('should return a value if it is not boolean', (test) => {
            test.plan(2);

            test.equal(convert(12), 12);
            test.equal(convert('pizza'), 'pizza');

            test.end();
        });

        subSuite.end();
    });

    suite.test('#createYesNoValue', (subSuite) => {
        const create = input.createYesNoValue;

        subSuite.test('should return a function', (test) => {
            test.plan(1);
            test.equal(
                typeof create(),
                'function'
            );
            test.end();
        });

        subSuite.test('should return true for a "yes" answer & false for a "no" answer', (test) => {
            const yesNo = create();

            test.plan(6);

            test.ok(yesNo('y'));
            test.ok(yesNo('yes'));
            test.ok(yesNo('YeS'));
            test.notOk(yesNo('n'));
            test.notOk(yesNo('no'));
            test.notOk(yesNo('nO'));

            test.end();
        });

        subSuite.test('should use a default value, if provided', (test) => {
            const yesNo = create('y');

            test.plan(2);

            test.notOk(yesNo('n'));
            test.ok(yesNo());

            test.end();
        });

        subSuite.test('should call a follow-up if provided', (test) => {
            const answer = { answer: 'yo', name: 'eating' };
            const followup = sinon.spy();
            const known = { answer: 'hey', name: 'greeting' };
            const yesNo = create('', [known], followup);
            const yesNoKnown = create('', undefined, followup);

            test.plan(3);

            yesNo('unknown');
            test.notOk(followup.called);

            yesNo('n', [answer]);
            test.ok(followup.calledWith(false, [answer, known]));

            yesNoKnown('y', []);
            test.ok(followup.calledWith(true, []));

            yesNo()
        });

        subSuite.end();
    });

    suite.end();
});
