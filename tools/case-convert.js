'use strict';

const dashToCamel = (value, replaceChar = '') =>
    value.replace(/(-.)/g, (match) =>
        match.replace('-', replaceChar).toUpperCase()
    );

const dashToPascal = (value, replaceChar = '') =>
    value[0].toUpperCase() +
    dashToCamel(value.slice(1), replaceChar);

const dashToWords = (value) => dashToPascal(value, ' ');

module.exports = {
    dashToCamel,
    dashToPascal,
    dashToWords
};
