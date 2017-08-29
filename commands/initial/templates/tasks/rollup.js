'use strict';

const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');
const rollupCommon = require('rollup-plugin-commonjs');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const rollupUglify = require('rollup-plugin-uglify');

const execRollup = (name, dirs) => {
    const destinations = generateDestinations(dirs.dist, name);
    const es5Entry = path.resolve(dirs.es5, 'index.js');
    const es2015Entry = path.resolve(dirs.es2015, 'index.js');
    const baseConfig = generateConfig({
        input: {
            external: [
                'react',
                'react-dom'
            ],
            onwarn: function rollupOnWarn(warning) {
                // keeps TypeScript this errors down
                if (warning.code !== 'THIS_IS_UNDEFINED') {
                    console.warn(warning.message);
                }
            },
            plugins: [
                rollupNodeResolve(),
                rollupSourcemaps()
            ]
        },
        output: {
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
            },
            name: dashToCamel(name),
            sourcemap: true
        }
    }, dirs.root);

    const es2015Config = mergeConfig(baseConfig, {
        input: {
            input: es2015Entry,

        },
        output: {
            file: destinations.es2015,
            format: 'es'
        }
    });
    const es5Config = mergeConfig(baseConfig, {
        input: {
            input: es5Entry
        },
        output: {
            file: destinations.es5,
            format: 'es'
        }
    });
    const umdConfig = mergeConfig(baseConfig, {
        input: {
            input: es5Entry,
            plugins: baseConfig.input.plugins.concat([rollupUglify({})])
        },
        output: {
            file: destinations.umd,
            format: 'umd'
        }
    });

    const bundles = [
        es2015Config,
        es5Config,
        umdConfig
    ].map((config) => rollup.rollup(config.input)
        .then((bundle) => bundle.write(config.output))
    );

    return Promise.all(bundles);
};

const generateDestinations = (dist, moduleName) => Object.freeze({
    es2015: path.resolve(dist, `${ moduleName }.js`),
    es5: path.resolve(dist, `${ moduleName }.es5.js`),
    umd: path.resolve(dist, `${ moduleName }.min.js`)
});

// placeholder?
const generateConfig = (base, root) => base;

const mergeConfig = (base, custom) => ({
   input: Object.assign({}, base.input, custom.input || {}),
   output: Object.assign({}, base.output, custom.output || {})
});

const dashToCamel = (value) =>
    value.replace(/(-.)/g, (match) =>
        match.replace('-', '').toUpperCase()
    );

module.exports = execRollup;
