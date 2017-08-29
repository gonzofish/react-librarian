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

const getTemplates = (rootDir, directory, filenames) => filenames.map((filename) => ({
    check: filename.check,
    destination: filename.destination || path.resolve(rootDir, filename.name),
    template: filename.blank ? undefined : path.resolve(directory, 'templates', filename.name),
    update: filename.update,
    overwrite: filename.overwrite
}));

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

const checkIsBranch = (version) => /^(git\+)?https?\:/.test(version);
const getVersion = () => {
    const pkg = include(findPackageJson());
    let version;

    if (pkg) {
        version = getVersionFromPackage(pkg);
    }

    return version;
};

const getVersionFromPackage = (pkg) =>
    getPackageVersion(pkg, 'devDependencies') ||
        getPackageVersion(pkg, 'dependencies');

const getPackageVersion = (pkg, attribute) =>
    pkg[attribute] &&
    'angular-librarian' in pkg[attribute] &&
    pkg[attribute]['angular-librarian'];

const versions = {
    checkIsBranch,
    get: getVersion
};

module.exports = {
    findPackageJson,
    getTemplates,
    include,
    resolver,
    versions
};
