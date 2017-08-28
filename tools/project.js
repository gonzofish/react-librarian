'use strict';

const checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);

module.exports = {
    checkIsScopedName
};
