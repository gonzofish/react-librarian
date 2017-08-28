'use strict';

const chalk = require('chalk');

const colorize = (message, styles = ['reset']) => {
    const colors = styles.reduce((current, style) =>
        current[style],
        chalk
    );

    return colors(message);
};

module.exports = { colorize };
