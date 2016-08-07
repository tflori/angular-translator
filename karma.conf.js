/*jslint node: true */
"use strict";

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/es6-shim/es6-shim.js',
      'node_modules/reflect-metadata/Reflect.js',

      // System.js for module loading
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.js',

      // Zone.js dependencies
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
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
      { pattern: 'tests/**/*.spec.js', included: false, watched: true },

      'karma-test-shim.js'
    ],

    exclude: [
      'node_modules/**/*spec.js'
    ],

    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  });
};
