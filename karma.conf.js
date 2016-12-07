/*jslint node: true */
"use strict";

var coverageReporter = [
  { type: 'text-summary' },
];
var reporters = [
  'spec',
  'coverage',
];

if (process.env.TRAVIS) {
  console.log('On Travis sending coveralls');
  coverageReporter.push({ type : 'lcov', dir : 'coverage' });
  reporters.push('coveralls');
} else {
  console.log('Not on Travis so not sending coveralls');
  coverageReporter.push({ type : 'html', dir : 'coverage', 'subdir' : '.' });
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      // System.js for module loading
      'node_modules/systemjs/dist/system.src.js',

      // Polyfills
      'node_modules/core-js/client/shim.js',
      'node_modules/reflect-metadata/Reflect.js',

      // Zone.js dependencies
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/proxy.js',
      'node_modules/zone.js/dist/sync-test.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',

      // RxJs.
      { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },

      // Angular itself
      {pattern: 'node_modules/@angular/**/*.js', included: false, watched: false},

      // sources
      { pattern: 'angular2-translator.js', included: false, watched: true},
      { pattern: 'angular2-translator/**/*.js', included: false, watched: true},

      // helper
      { pattern: 'tests/helper/**/*.js', included: false, watched: true},

      // test files
      // { pattern: 'tests/TranslateService.spec.js', included: false, watched: true },
      { pattern: 'tests/**/*.spec.js', included: false, watched: true },

      'karma-test-shim.js'
    ],

    exclude: [
      'node_modules/**/*spec.js'
    ],

    preprocessors: {
      'angular2-translator.js': 'coverage',
      'angular2-translator/**/*.js': 'coverage'
    },

    reporters: reporters,

    coverageReporter: {
      reporters: coverageReporter
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    customLaunchers: {
      smallerChrome: {
        base: "Chrome",
        flags: [
          "--window-size=1024,768"
        ]
      }
    },
    browsers: [ 'smallerChrome', 'Firefox' ]
  });
};
