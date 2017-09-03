'use strict';

const fs = require('fs-extra');
const path = require('path');

const deleteFolder = (folder)  => {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach((file) => removePath(folder, file));
        fs.rmdirSync(folder);
    }
};

const removePath = (folder, file) => {
    const filepath = path.resolve(folder, file);

    if (fs.lstatSync(filepath).isDirectory()) {
        deleteFolder(filepath);
    } else {
        fs.unlinkSync(filepath);
    }
};

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

const checkIsBranch = (version) => /^(git\+)?https?:/.test(version);
const getVersion = () => {
    let version = getPackageLibrarianVersion();

    if (!module.exports.versions.checkIsBranch(version || '')) {
        version = module.exports.include(
            module.exports.resolver.manual(__dirname, '..', 'package.json')
        ).version;
    }

    return version;
};

const getPackageLibrarianVersion = () => {
    const json = module.exports.findPackageJson();
    const pkg = module.exports.include(json);
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
    'react-librarian' in pkg[attribute] &&
    pkg[attribute]['react-librarian'];

const versions = {
    checkIsBranch,
    get: getVersion
};

module.exports = {
    deleteFolder,
    findPackageJson,
    getTemplates,
    include,
    resolver,
    versions
};
