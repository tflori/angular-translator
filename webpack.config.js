/**
 * Adapted from angular2-webpack-starter
 */

const webpack = require('webpack');
const path = require('path');

/**
 * Webpack Plugins
 */
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

module.exports = {
    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.js']
    },

    entry: path.resolve('./index'),

    output: {
        path: path.resolve('./bundles'),
        publicPath: 'angular-translator',
        filename: 'angular-translator.js',
        libraryTarget: 'umd',
        library: 'angular-translator'
    },

    // require those dependencies but don't bundle them
    externals: [/^\@angular\//, /^rxjs\//],

    module: {
        rules: [ {
            test: /\.ts$/,
            loader: 'awesome-typescript-loader?declaration=false'
        }]
    },

    plugins: [
        // fix the warning in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.resolve('./src')
        ),

        new webpack.LoaderOptionsPlugin({
            options: {
                tslintLoader: {
                    emitErrors: false,
                    failOnHint: false
                }
            }
        })
    ]
};
