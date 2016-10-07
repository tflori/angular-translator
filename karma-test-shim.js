/*global jasmine, __karma__, System, window, Promise */
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
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    map: {
      'rxjs': 'node_modules/rxjs',
      '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
      '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
      '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
      '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
      '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
      '@angular/http/testing': 'npm:@angular/http/bundles/http-testing.umd.js',
      '@angular/router/testing': 'npm:@angular/router/bundles/router-testing.umd.js',
      '@angular/forms/testing': 'npm:@angular/forms/bundles/forms-testing.umd.js',
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
    },
    packages: {
      '': {
        defaultExtension: 'js'
      },
      'rxjs': {
        defaultExtension: 'js'
      }
    }
  });

  Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ]).then(function (modules) {
    var testing = modules[0];
    var testingBrowser = modules[1];

    testing.TestBed.initTestEnvironment(
      testingBrowser.BrowserDynamicTestingModule,
      testingBrowser.platformBrowserDynamicTesting()
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
