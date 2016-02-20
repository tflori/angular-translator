System.registerDynamic("src/TranslateService", ["angular2/core", "angular2/http", "./TranslateConfig"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var __param = (this && this.__param) || function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
  var core_1 = $__require('angular2/core');
  var http_1 = $__require('angular2/http');
  var TranslateConfig_1 = $__require('./TranslateConfig');
  var TranslateService = (function() {
    function TranslateService(http, config) {
      this._http = http;
      this._config = config;
    }
    TranslateService = __decorate([core_1.Injectable(), __param(0, core_1.Inject(http_1.Http)), __param(1, core_1.Inject(TranslateConfig_1.TranslateConfig)), __metadata('design:paramtypes', [http_1.Http, TranslateConfig_1.TranslateConfig])], TranslateService);
    return TranslateService;
  })();
  exports.TranslateService = TranslateService;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("src/TranslateConfig", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var TranslateConfig = (function() {
    function TranslateConfig(defaultLang) {
      this.defaultLang = 'en';
      if (defaultLang) {
        this.defaultLang = defaultLang;
      }
    }
    return TranslateConfig;
  })();
  exports.TranslateConfig = TranslateConfig;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator", ["./src/TranslateService", "./src/TranslateConfig", "angular2/core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  var TranslateService_1 = $__require('./src/TranslateService');
  var TranslateConfig_1 = $__require('./src/TranslateConfig');
  var core_1 = $__require('angular2/core');
  __export($__require('./src/TranslateService'));
  __export($__require('./src/TranslateConfig'));
  exports.TRANSLATE_PROVIDER = [new core_1.Provider(TranslateConfig_1.TranslateConfig, {useValue: new TranslateConfig_1.TranslateConfig()}), TranslateService_1.TranslateService];
  global.define = __define;
  return module.exports;
});
