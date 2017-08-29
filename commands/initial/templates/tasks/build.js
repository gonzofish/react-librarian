'use strict';

const fs = require('fs-extra');
const path = require('path');

const globCopy = require('./glob-copy');
const rollup = require('./rollup');
const tsc = require('./tsc');


const root = (...args) => path.resolve.apply(
    null,
    [__dirname, '..'].concat(args)
);
const distDir = root('dist');
const es2015Dir = root('out-tsc', 'es2015');
const pkgFile = root('package.json');

const runTask = (message, fn) => () => {
    console.info(message);
    return fn().catch((error) => {
        throw error;
    });
};

const compile = () => Promise.all([2015, 5].map((type) =>
    tsc(root('configs', `tsconfig.es${ type }.json`))
));

const _rollup = () => rollup(require(pkgFile).name, {
    dist: distDir,
    es2015: es2015Dir,
    es5: root('out-tsc', 'es5'),
    root: root()
});

const copyTsDefinitions = () =>
    globCopy('**/*.d.ts', es2015Dir, distDir);
const copyPackageFiles = () =>
    globCopy(['package.json', 'README.md'], root(), distDir).then(() => {
        const pkgFile = root('dist', 'package.json');
        const pkgText = fs.readFileSync(pkgFile, 'utf8');

        fs.writeFileSync(pkgFile, pkgText.replace('"dependencies":', '"peerDependencies":'));
    });

return Promise.resolve()
    .then(runTask('Compiling TS files', compile))
    .then(runTask('Applying Rollup', _rollup))
    .then(runTask('Copying TS definitions', copyTsDefinitions))
    .then(runTask('Copying package files', copyPackageFiles))
    .catch((error) => {
        console.error(error);
    });
