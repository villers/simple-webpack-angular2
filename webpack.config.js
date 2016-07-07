const path = require('path');
const webpack = require('webpack');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch';
const isProd = ENV === 'build';

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}

module.exports = function() {
  let _config = {};

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   */
  if (isProd) {
    _config.devtool = 'source-map';
  } else {
    _config.devtool = 'eval-source-map';
  }

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#debug
   */
  _config.debug = !isProd || !isTest;

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   */
  _config.entry = isTest ? {} : {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts' // our angular app
  };

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#output
   */
  _config.output = isTest ? {} : {
    path: root('dist'),
    publicPath: isProd ? '/' : 'http://localhost:8080/',
    filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
    chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
  };

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#resolve
   */
  _config.resolve = {
    cache: !isTest,
    root: root(),
    extensions: ['', '.ts', '.js', '.json', '.css', '.scss', '.html'],
    alias: {
      'app': 'src/app',
      'common': 'src/common'
    }
  };

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   */
  _config.module = {
    preLoaders: isTest ? [] : [{test: /\.ts$/, loader: 'tslint'}],
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['ts', 'angular2-template-loader'],
        exclude: [isTest ? /\.(e2e)\.ts$/ : /\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/]
      },

      // copy those assets to output
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file?name=fonts/[name].[hash].[ext]?'
      },

      {
        test: /\.json$/,
        loader: 'json'
      },

      // all css in src/style will be bundled in an external css file
      {
        test: /\.css$/,
        exclude: root('src', 'app'),
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?sourceMap!postcss')
      },

      {
        test: /\.css$/,
        include: root('src', 'app'),
        loader: 'raw!postcss'
      },

      // all css in src/style will be bundled in an external css file
      {
        test: /\.scss$/,
        exclude: root('src', 'app'),
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass')
      },

      {
        test: /\.scss$/,
        exclude: root('src', 'style'),
        loader: 'raw!postcss!sass'
      },

      {
        test: /\.html$/,
        loader: 'raw'
      }
    ],
    postLoaders: [],
    noParse: [
      /.+zone\.js\/dist\/.+/,
      /.+angular2\/bundles\/.+/,
      /angular2-polyfills\.js/
    ]
  };

  if (isTest) {
    // covers ts files with Istanbul
    _config.module.postLoaders.push({
      test: /\.ts$/,
      include: path.resolve('src'),
      loader: 'istanbul-instrumenter-loader',
      exclude: [
        /\.spec\.ts$/,
        /\.e2e\.ts$/,
        /node_modules/
      ]
    });

    // needed for remap-instanbul
    _config.ts = {
      compilerOptions: {
        sourceMap: false,
        sourceRoot: './src',
        inlineSourceMap: true
      }
    };
  }

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   */
  _config.plugins = [
    // Reference: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV)
      }
    })
  ];

  if (!isTest) {
    _config.plugins.push(
      // Reference: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
      new CommonsChunkPlugin({
        name: ['vendor', 'polyfills']
      }),

      // Reference: https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        template: './src/public/index.html',
        chunksSortMode: 'dependency'
      }),

      // Reference: https://github.com/webpack/extract-text-webpack-plugin
      new ExtractTextPlugin('css/[name].[hash].css', {
        disable: !isProd
      })
    );
  }

  if (isProd) {
    _config.plugins.push(
      // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      new webpack.NoErrorsPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      new webpack.optimize.DedupePlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      new webpack.optimize.UglifyJsPlugin(),

      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([{
        from: root('src/public')
      }])
    );
  }

  /**
   * Reference: https://github.com/postcss/autoprefixer-core
   */
  _config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  /**
   * Reference: https://github.com/wbuchwalter/tslint-loader
   */
  _config.tslint = {
    emitErrors: false,
    failOnHint: false
  };

  /**
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   */
  _config.devServer = {
    contentBase: './src/public',
    historyApiFallback: true,
    stats: 'minimal'
  };

  return _config;
}();
