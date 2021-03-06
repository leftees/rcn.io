const path = require('path');
const webpack = require('webpack');
const consts = require('./constants');

function resolveNodeModulesPath(pathName) {
  return path.resolve(path.join(consts.NODE_MODULES, pathName));
}

//NOTE: use min versions for prod and to speed-up build times a little
const pathToReact = resolveNodeModulesPath('react/dist/react.js');
const pathToReactDOM = resolveNodeModulesPath('react-dom/dist/react-dom.js');
// const pathToReact = resolveNodeModulesPath('react/dist/react.min.js');
// const pathToReactDOM = resolveNodeModulesPath('react-dom/dist/react-dom.min.js');


module.exports = {
  // cheap-module-eval-source-map, because we want original source, but we don't
  // care about columns, which makes this devtool faster than eval-source-map.
  // http://webpack.github.io/docs/configuration.html#devtool
  //devtool: 'cheap-module-eval-source-map',
  devtool: 'eval',

  cache: true,
  debug: true,

  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
    path.join(consts.SRC_DIR, 'client/index.js')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  resolve: {
    //tells webpack to use static file when import React from 'react' is used
    alias: {
      'react': pathToReact,
      'react-dom': pathToReactDOM
    }
  },
  module: {
    //tells webpack to skip parsing following libraries
    noParse: [pathToReact],
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      query: {
        'stage': 0,
        'plugins': ['react-transform'],
        'cacheDirectory': true, //not needed in for build
        'extra': {
          'react-transform': {
            'transforms': [{
              'transform': 'react-transform-hmr',
              'imports': ['react'],
              'locals': ['module']
            }, {
              'transform': 'react-transform-catch-errors',
              'imports': ['react', 'redbox-react']
            }]
          }
        }
      },
      exclude: /(node_modules|bower_components)/,
      include: path.join(consts.SRC_DIR, 'client')
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass'],
      exclude: /(node_modules|bower_components)/,
      include: path.join(consts.SRC_DIR, 'client')
    }, {
      test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /(node_modules|bower_components)/,
      loaders: ['url?limit=10000&mimetype=application/font-woff'],
      include: path.join(consts.SRC_DIR, 'client')
    }]
  }
};
