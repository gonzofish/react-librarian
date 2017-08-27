'use strict';

const erectorUtils = require('erector-set/src/utils');

const convertYesNoValue = (value) => {
    if (erectorUtils.checkIsType(value, 'boolean')) {
        value = value ? 'Y' : 'N';
    } else if (!value) {
        value = 'N';
    }

    return value;
};

const createYesNoValue = (defaultAnswer, known, followup) => (value, answers) => {
    const lookup = { n: false, y: true };
    let result;

    if (typeof value === 'string' && value.match(/^(y(es)?|no?)$/i)) {
        value = value.slice(0, 1).toLowerCase();
    } else if ((value === null || value === undefined) && checkHasDefault(defaultAnswer)) {
        value = defaultAnswer.toLowerCase();
    }

    result = lookup[value];
    if (result !== undefined && typeof followup === 'function') {
        result = followup(result, answers.concat(known || []));
    }

    return result;
};

const checkHasDefault = (value) =>
     typeof value === 'string' && !!value;

module.exports = {
    convertYesNoValue,
    createYesNoValue
};
