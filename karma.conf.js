/*jslint node: true */
"use strict";

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
      { pattern: 'index.js', included: false, watched: false},
      { pattern: 'src/**/*.js', included: false, watched: true},

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
      'src/**/*.js': 'coverage'
    },

    reporters: [
      'spec',
      'coverage',
    ],

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'json', subdir: 'unmapped-json' }
      ]
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
    }
  });
};
