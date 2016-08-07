/*global jasmine, __karma__, System, window */
(function () {
  "use strict";

  // Turn on full stack traces in errors to help debugging
  Error.stackTraceLimit = Infinity;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

  // Cancel Karma's synchronous start,
  // we will call `__karma__.start()` later, once all the specs are loaded.
  __karma__.loaded = function () {
    return undefined;
  };

  function isJsFile(path) {
    return path.slice(-3) === '.js';
  }

  function isSpecFile(path) {
    return path.indexOf('.spec') > -1;
  }

  var builtFiles = Object.keys(window.__karma__.files)
      .filter(isJsFile)
      .filter(function (path) {
        var modulePath = '/base/node_modules/';
        return path.substr(0, modulePath.length) !== modulePath;
      })
      .filter(function (path) {
        return path !== '/base/karma-test-shim.js';
      });


  // Load our SystemJS configuration.
  System.config({
    baseURL: '/base',
    defaultExtension: 'js',
    map: {
      'rxjs': 'node_modules/rxjs',
      '@angular': 'node_modules/@angular'
    },
    packages: {
      '': {
        defaultExtension: 'js'
      },
      '@angular/core': {
        main: 'index.js',
        defaultExtension: 'js'
      },
      '@angular/compiler': {
        main: 'index.js',
        defaultExtension: 'js'
      },
      '@angular/common': {
        main: 'index.js',
        defaultExtension: 'js'
      },
      '@angular/http': {
        main: 'index.js',
        defaultExtension: 'js'
      },
      '@angular/platform-browser': {
        main: 'index.js',
        defaultExtension: 'js'
      },
      '@angular/router': {
        main: 'index.js',
        defaultExtension: 'js'
      },
      'rxjs': {
        defaultExtension: 'js'
      }
    }
  });

  Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser/testing')
  ]).then(function (modules) {
    var testing = modules[0], testingBrowser = modules[1];

    testing.setBaseTestProviders(
      testingBrowser.TEST_BROWSER_PLATFORM_PROVIDERS,
      testingBrowser.TEST_BROWSER_APPLICATION_PROVIDERS
    );

    Promise.all(builtFiles.filter(function (path) {
      return !isSpecFile(path);
    }).map(function (spec) {
      return System.import(spec);
    })).then(function () {
      Promise.all(builtFiles.filter(isSpecFile).map(function (spec) {
        return System.import(spec);
      })).then(function () {
        __karma__.start();
      });
    });
  });

}());
