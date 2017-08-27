'use strict';

const fs = require('fs-extra');
const path = require('path');

const findPackageJson = (dir) => {
    dir = dir || process.cwd();

    const pkg = path.join(dir, 'package.json');

    if (fs.existsSync(pkg)) {
        return pkg;
    } else {
        return findPackageJson(path.dirname(dir));
    }
};

/* istanbul ignore next */
const include = (file) =>
    fs.existsSync(file) && require(file);

const resolver = {
    create(...createArgs) {
        const base = resolvePath(this.root(), createArgs);

        return (...args) => resolvePath(base, args);
    },
    manual(...args) {
        return resolvePath(args[0], args.slice(1));
    },
    root(...args) {
        return resolvePath(process.cwd(), args);
    }
};

const resolvePath = (prefix, args) => {
    return path.resolve.apply(
        path.resolve,
        [prefix].concat(args)
    );
};

module.exports = {
    findPackageJson,
    include,
    resolver
};
