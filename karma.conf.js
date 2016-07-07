var path = require('path');

var webpackConfig = require('./webpack.config');

module.exports = function (config) {
  config.set({

    basePath: '',
    frameworks: ['jasmine'],
    files: [
      { pattern: './karma-shim.js', watched: false }
    ],
    exclude: [],
    preprocessors: {
      './karma-shim.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: 'errors-only'
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [{
        type: 'json',
        dir: 'coverage',
        subdir: 'json',
        file: 'coverage-final.json'
      }]
    },
    remapIstanbulReporter: {
      src: 'coverage/json/coverage-final.json',
      reports: {
        lcovonly: 'coverage/json/lcov.info',
        html: 'coverage/html',
        'text': null
      },
      timeoutNotCreated: 1000,
      timeoutNoMoreFiles: 1000
    },
    webpackServer: {
      noInfo: true
    },
    reporters: ["mocha", "coverage", "karma-remap-istanbul"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
