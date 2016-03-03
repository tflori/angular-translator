System.registerDynamic("angular2-translator/TranslateLoaderJson", ["angular2/core", "angular2/http", "./TranslateLoader"], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
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
  var TranslateLoader_1 = $__require('./TranslateLoader');
  var TranslateLoaderJsonConfig = (function() {
    function TranslateLoaderJsonConfig(path, extension) {
      this.path = 'i18n/';
      this.extension = '.json';
      if (path) {
        this.path = path.replace(/\/+$/, '') + '/';
      }
      if (extension) {
        this.extension = extension;
      }
    }
    return TranslateLoaderJsonConfig;
  })();
  exports.TranslateLoaderJsonConfig = TranslateLoaderJsonConfig;
  var TranslateLoaderJson = (function(_super) {
    __extends(TranslateLoaderJson, _super);
    function TranslateLoaderJson(http, config) {
      _super.call(this);
      this._http = http;
      this._config = config;
    }
    TranslateLoaderJson.prototype.load = function(lang) {
      var _this = this;
      return new Promise(function(resolve, reject) {
        var file = _this._config.path + lang + _this._config.extension;
        _this._http.get(file).subscribe(function(response) {
          if (response.status === 200) {
            resolve(response.json());
          } else {
            reject('Language file could not be loaded (StatusCode: ' + response.status + ')');
          }
        });
      });
    };
    TranslateLoaderJson = __decorate([core_1.Injectable(), __param(0, core_1.Inject(http_1.Http)), __param(1, core_1.Inject(TranslateLoaderJsonConfig)), __metadata('design:paramtypes', [http_1.Http, TranslateLoaderJsonConfig])], TranslateLoaderJson);
    return TranslateLoaderJson;
  })(TranslateLoader_1.TranslateLoader);
  exports.TranslateLoaderJson = TranslateLoaderJson;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateConfig", [], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  var TranslateConfig = (function() {
    function TranslateConfig(_a) {
      var _b = _a.defaultLang,
          defaultLang = _b === void 0 ? 'en' : _b,
          _c = _a.providedLangs,
          providedLangs = _c === void 0 ? ['en'] : _c,
          _d = _a.detectLanguageOnStart,
          detectLanguageOnStart = _d === void 0 ? true : _d;
      this.defaultLang = providedLangs.indexOf(defaultLang) > -1 ? defaultLang : providedLangs[0];
      this.providedLangs = providedLangs;
      this.detectLanguageOnStart = detectLanguageOnStart;
      this.navigatorLanguages = (function() {
        var navigator = TranslateConfig.navigator;
        if (navigator.languages instanceof Array) {
          return Array.prototype.slice.call(navigator.languages);
        } else if (typeof navigator.languages === 'string') {
          return [String(navigator.languages)];
        } else if (typeof navigator.language === 'string') {
          return [navigator.language];
        } else {
          return [];
        }
      })();
    }
    TranslateConfig.prototype.langProvided = function(lang, strict) {
      if (strict === void 0) {
        strict = false;
      }
      var provided = false,
          p;
      var normalizeLang = function(lang) {
        return lang.replace(/^([A-Za-z]{2})([\.\-_\/]?([A-Za-z]{2}))?/, function(substring, lang, v, country) {
          if (v === void 0) {
            v = '';
          }
          if (country === void 0) {
            country = '';
          }
          lang = lang.toLowerCase();
          country = country.toUpperCase();
          return country ? lang + '-' + country : lang;
        });
      };
      var providedLangsNormalized = this.providedLangs.map(normalizeLang);
      lang = normalizeLang(lang);
      p = providedLangsNormalized.indexOf(lang);
      if (p > -1) {
        provided = this.providedLangs[p];
      } else if (!strict) {
        lang = lang.substr(0, 2);
        p = providedLangsNormalized.indexOf(lang);
        if (p > -1) {
          provided = this.providedLangs[p];
        } else {
          p = providedLangsNormalized.map(function(lang) {
            return lang.substr(0, 2);
          }).indexOf(lang);
          if (p > -1) {
            provided = this.providedLangs[p];
          }
        }
      }
      return provided;
    };
    TranslateConfig.navigator = window && window.navigator ? window.navigator : {};
    return TranslateConfig;
  })();
  exports.TranslateConfig = TranslateConfig;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateLoader", [], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  var TranslateLoader = (function() {
    function TranslateLoader() {}
    return TranslateLoader;
  })();
  exports.TranslateLoader = TranslateLoader;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateService", ["angular2/core", "rxjs/Observable", "rxjs/add/operator/share", "./TranslateConfig", "./TranslateLoader"], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
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
  var Observable_1 = $__require('rxjs/Observable');
  $__require('rxjs/add/operator/share');
  var TranslateConfig_1 = $__require('./TranslateConfig');
  var TranslateLoader_1 = $__require('./TranslateLoader');
  exports.TranslateLogHandler = {
    error: function(message) {
      return console && console.error && console.error(message);
    },
    info: function() {},
    debug: function() {}
  };
  var TranslateService = (function() {
    function TranslateService(config, loader, logHandler) {
      var _this = this;
      this._loadedLangs = {};
      this._translations = {};
      this._config = config;
      this._loader = loader;
      this.logHandler = logHandler;
      this._lang = config.defaultLang;
      if (config.detectLanguageOnStart) {
        var lang = this.detectLang(config.navigatorLanguages);
        if (lang) {
          this._lang = String(lang);
          logHandler.info('Language de got detected');
        }
      }
      this.languageChanged = new Observable_1.Observable(function(observer) {
        return _this._languageChangedObserver = observer;
      }).share();
    }
    TranslateService.prototype.currentLang = function() {
      return this._lang;
    };
    TranslateService.prototype.detectLang = function(navLangs) {
      var detected = false,
          i;
      for (i = 0; i < navLangs.length; i++) {
        detected = this._config.langProvided(navLangs[i], true);
        if (detected) {
          break;
        }
      }
      if (!detected) {
        for (i = 0; i < navLangs.length; i++) {
          detected = this._config.langProvided(navLangs[i]);
          if (detected) {
            break;
          }
        }
      }
      return detected;
    };
    TranslateService.prototype.useLang = function(lang) {
      var providedLang = this._config.langProvided(lang, true);
      if (typeof providedLang === 'string') {
        this._lang = providedLang;
        this.logHandler.info('Language changed to ' + providedLang);
        if (this._languageChangedObserver) {
          this._languageChangedObserver.next(this._lang);
        }
        return true;
      }
      return false;
    };
    TranslateService.prototype.waitForTranslation = function(lang) {
      if (lang === void 0) {
        lang = this._lang;
      }
      var l = this._config.langProvided(lang, true);
      if (!l) {
        return Promise.reject('Language not provided');
      } else {
        lang = String(l);
      }
      return this._loadLang(lang);
    };
    TranslateService.prototype._loadLang = function(lang) {
      var _this = this;
      if (!this._loadedLangs[lang]) {
        this._loadedLangs[lang] = new Promise(function(resolve, reject) {
          _this._loader.load(lang).then(function(translations) {
            _this._translations[lang] = translations;
            _this.logHandler.info('Language ' + lang + ' got loaded');
            resolve();
          }, function(reason) {
            _this.logHandler.error('Language ' + lang + ' could not be loaded (' + reason + ')');
            reject(reason);
          });
        });
      }
      return this._loadedLangs[lang];
    };
    TranslateService.prototype.translate = function(keys, params, lang) {
      var _this = this;
      if (params === void 0) {
        params = {};
      }
      if (lang === void 0) {
        lang = this._lang;
      }
      return new Promise(function(resolve, reject) {
        if (lang != _this._lang) {
          var l = _this._config.langProvided(lang, true);
          if (!l) {
            resolve(keys);
            return;
          } else {
            lang = String(l);
          }
        }
        _this._loadLang(lang).then(function() {
          resolve(_this.instant(keys, params, lang));
        }, function() {
          resolve(keys);
        });
      });
    };
    TranslateService.prototype.instant = function(keys, params, lang) {
      var _this = this;
      if (params === void 0) {
        params = {};
      }
      if (lang === void 0) {
        lang = this._lang;
      }
      if (!Array.isArray(keys)) {
        return this.instant([keys], params, lang)[0];
      }
      if (lang != this._lang) {
        var l = this._config.langProvided(lang, true);
        if (l) {
          lang = String(l);
        }
      }
      var result = [],
          i = keys.length,
          t;
      while (i--) {
        if (!this._translations[lang] || !this._translations[lang][keys[i]]) {
          this.logHandler.info('Translation for \'' + keys[i] + '\' in language ' + lang + ' not found');
          result.unshift(keys[i]);
          continue;
        }
        t = this._translations[lang][keys[i]];
        t = t.replace(/\[\[\s*([A-Za-z0-9_\.-]+):?([A-Za-z0-9,_]+)?\s*\]\]/g, function(sub, key, vars) {
          if (vars === void 0) {
            vars = '';
          }
          var translationParams = {};
          vars.split(',').map(function(key) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
              translationParams[key] = params[key];
            }
          });
          return String(_this.instant(key, translationParams, lang));
        });
        t = t.replace(/{{\s*(.*?)\s*}}/g, function(sub, expression) {
          try {
            return __parse(expression, params);
          } catch (e) {
            _this.logHandler.error('Parsing error for expression \'' + expression + '\'');
            return '';
          }
        });
        result.unshift(t);
      }
      return result;
    };
    TranslateService = __decorate([core_1.Injectable(), __param(0, core_1.Inject(TranslateConfig_1.TranslateConfig)), __param(1, core_1.Inject(TranslateLoader_1.TranslateLoader)), __param(2, core_1.Inject(exports.TranslateLogHandler)), __metadata('design:paramtypes', [TranslateConfig_1.TranslateConfig, TranslateLoader_1.TranslateLoader, Object])], TranslateService);
    return TranslateService;
  })();
  exports.TranslateService = TranslateService;
  function __parse(expression, params) {
    return eval('with(params) { (' + expression + ') }');
  }
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslatePipe", ["angular2/core", "./TranslateService"], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
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
  var TranslateService_1 = $__require('./TranslateService');
  var TranslatePipe = (function() {
    function TranslatePipe(translate) {
      var _this = this;
      this._translation = '';
      this._translate = translate;
      translate.languageChanged.subscribe(function() {
        _this._startTranslation();
      });
    }
    TranslatePipe.prototype.transform = function(key, args) {
      if (args === void 0) {
        args = [];
      }
      var params = {};
      if (args[0]) {
        if (typeof args[0] === 'string') {
          params = __parseParams(args[0]);
          if (!Object.keys(params).length) {
            this._translate.logHandler.error('\'' + args[0] + '\' could not be parsed to object');
          }
        } else if (typeof args[0] === 'object') {
          params = args[0];
        }
      }
      if (this._translated && this._promise && (this._translated.key !== key || JSON.stringify(this._translated.params) !== JSON.stringify(params))) {
        this._promise = null;
      }
      if (!this._promise) {
        this._translated = {
          key: key,
          params: params
        };
        this._startTranslation();
      }
      return this._translation;
    };
    TranslatePipe.prototype._startTranslation = function() {
      var _this = this;
      if (!this._translated || !this._translated.key) {
        return;
      }
      this._promise = this._translate.translate(this._translated.key, this._translated.params);
      this._promise.then(function(translation) {
        return _this._translation = String(translation);
      });
    };
    TranslatePipe = __decorate([core_1.Pipe({
      name: 'translate',
      pure: false
    }), __param(0, core_1.Inject(TranslateService_1.TranslateService)), __metadata('design:paramtypes', [TranslateService_1.TranslateService])], TranslatePipe);
    return TranslatePipe;
  })();
  exports.TranslatePipe = TranslatePipe;
  function __parseParams(arg) {
    try {
      var o = eval('(' + arg + ')');
      if (typeof o === 'object') {
        return o;
      }
    } catch (e) {}
    return {};
  }
  return module.exports;
});

System.registerDynamic("angular2-translator", ["./angular2-translator/TranslateService", "./angular2-translator/TranslateConfig", "./angular2-translator/TranslateLoader", "./angular2-translator/TranslateLoaderJson", "angular2/core", "./angular2-translator/TranslatePipe"], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  var TranslateService_1 = $__require('./angular2-translator/TranslateService');
  var TranslateConfig_1 = $__require('./angular2-translator/TranslateConfig');
  var TranslateLoader_1 = $__require('./angular2-translator/TranslateLoader');
  var TranslateLoaderJson_1 = $__require('./angular2-translator/TranslateLoaderJson');
  var core_1 = $__require('angular2/core');
  __export($__require('./angular2-translator/TranslateService'));
  __export($__require('./angular2-translator/TranslatePipe'));
  __export($__require('./angular2-translator/TranslateConfig'));
  __export($__require('./angular2-translator/TranslateLoader'));
  __export($__require('./angular2-translator/TranslateLoaderJson'));
  exports.TRANSLATE_PROVIDERS = [new core_1.Provider(TranslateConfig_1.TranslateConfig, {useValue: new TranslateConfig_1.TranslateConfig({})}), new core_1.Provider(TranslateLoaderJson_1.TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJson_1.TranslateLoaderJsonConfig()}), new core_1.Provider(TranslateLoader_1.TranslateLoader, {useClass: TranslateLoaderJson_1.TranslateLoaderJson}), new core_1.Provider(TranslateService_1.TranslateLogHandler, {useValue: TranslateService_1.TranslateLogHandler}), TranslateService_1.TranslateService];
  return module.exports;
});
