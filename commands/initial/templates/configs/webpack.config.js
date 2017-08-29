const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

const entryPoints = [
    'vendor',
    'app'
];
const root = (...args) => {
    const rootPath = path.join(__dirname, '..');

    return path.join.apply(null, [rootPath].concat(args));
};
const example = (...args) => root.apply(null, ['example'].concat(args));

module.exports = {
    devServer: {
        contentBase: root('dist'),
        port: 9000
    },
    devtool: 'cheap-module-eval-source-map',
    entry: {
        app: [ example('App.tsx') ],
        vendor: [ example('vendor.ts') ]
    },
    module: {
        rules: [
            { enforce: 'pre', test: /\.js$/, use: 'source-map-loader' },
            { test: /\.tsx?$/, use: 'awesome-typescript-loader' }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: root('dist')
    },
    plugins: [
        new ChunkPlugin({
            filename: 'vendor.bundle.js',
            minChunks: Infinity,
            name: 'vendor'
        }),
        new HtmlPlugin({
            chunksSortMode: (left, right) => {
                const leftIndex = entryPoints.indexOf(left.names[0]);
                const rightIndex = entryPoints.indexOf(right.names[0]);
                let direction = 0;

                if (leftIndex > rightIndex) {
                    direction = 1;
                } else if (leftIndex < rightIndex) {
                    direction = -1;
                }

                return direction;
            },
            filename: 'index.html',
            inject: 'body',
            template: example('index.html')
        }),
        new LoaderOptionsPlugin({
            debug: true,
            options: {
                emitErrors: true
            }
        })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        modules: [ root('node_modules') ]
    }
};
