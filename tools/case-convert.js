'use strict';

const checkIsDashCase = (value) =>
    /^[a-z](-?[a-z0-9])+$/i.test(value);

const checkIsPascalCase = (value) =>
    /^[A-Z][a-z]+([A-Z][a-z]+)+$/.test(value);

const dashToCamel = (value, replaceChar = '') =>
    value.replace(/(-.)/g, (match) =>
        match.replace('-', replaceChar).toUpperCase()
    );

const dashToPascal = (value, replaceChar = '') =>
    value[0].toUpperCase() +
    dashToCamel(value.slice(1), replaceChar);

const dashToWords = (value) => dashToPascal(value, ' ');

module.exports = {
    checkIsDashCase,
    checkIsPascalCase,
    dashToCamel,
    dashToPascal,
    dashToWords
};
