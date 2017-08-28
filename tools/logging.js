'use strict';

module.exports.create = (prefix = '') => Object.freeze({
    error() { notify('error', prefix, arguments); },
    info() { notify('info', prefix, arguments); },
    log() { notify('log', prefix, arguments); },
    warn() { notify('warn', prefix, arguments); }
});

const notify = (type, prefix, args) => {
    args = Array.prototype.slice.call(args);
    // eslint-disable-next-line no-console
    console[type].apply(console, [`[${ prefix }]:`].concat(args));
};
