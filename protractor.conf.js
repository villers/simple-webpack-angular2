exports.config = {
  baseUrl: 'http://localhost:8080/',
  specs: [
    'src/**/*.e2e-spec.js'
  ],
  exclude: [],
  framework: 'jasmine2',
  allScriptsTimeout: 110000,
  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: false,
    includeStackTrace: false,
    defaultTimeoutInterval: 400000
  },
  directConnect: true,
  capabilities: {
    'browserName': 'chrome'
  },
  onPrepare: function () {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));

    browser.ignoreSynchronization = true;
  },

  /**
   * for angular2
   */
  useAllAngular2AppRoots: true
};
