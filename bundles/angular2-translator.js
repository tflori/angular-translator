System.registerDynamic("angular2-translator/TranslateLoaderJson", ["./TranslateLoader", "@angular/core", "@angular/http"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
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
  var TranslateLoader_1 = $__require('./TranslateLoader');
  var core_1 = $__require('@angular/core');
  var http_1 = $__require('@angular/http');
  var TranslateLoaderJsonConfig = (function() {
    function TranslateLoaderJsonConfig(path, extension) {
      this.path = "i18n/";
      this.extension = ".json";
      if (path) {
        this.path = path.replace(/\/+$/, "") + "/";
      }
      if (extension) {
        this.extension = extension;
      }
    }
    return TranslateLoaderJsonConfig;
  }());
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
            var translations = response.json();
            var key = void 0;
            for (key in translations) {
              if (!translations.hasOwnProperty(key)) {
                continue;
              }
              if (Array.isArray(translations[key])) {
                translations[key] = translations[key].filter(function(v) {
                  return typeof v === "string";
                }).join("");
              } else if (typeof translations[key] !== "string") {
                delete translations[key];
              }
            }
            resolve(translations);
          } else {
            reject("Language file could not be loaded (StatusCode: " + response.status + ")");
          }
        });
      });
    };
    TranslateLoaderJson = __decorate([core_1.Injectable(), __param(0, core_1.Inject(http_1.Http)), __param(1, core_1.Inject(TranslateLoaderJsonConfig)), __metadata('design:paramtypes', [http_1.Http, TranslateLoaderJsonConfig])], TranslateLoaderJson);
    return TranslateLoaderJson;
  }(TranslateLoader_1.TranslateLoader));
  exports.TranslateLoaderJson = TranslateLoaderJson;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslatePipe", ["./TranslateService", "@angular/core"], true, function($__require, exports, module) {
  "use strict";
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
  var TranslateService_1 = $__require('./TranslateService');
  var core_1 = $__require('@angular/core');
  var TranslatePipe = (function() {
    function TranslatePipe(translate) {
      var _this = this;
      this._translation = "";
      this._translate = translate;
      translate.languageChanged.subscribe(function() {
        _this._startTranslation();
      });
    }
    TranslatePipe._parseParams = function(arg) {
      try {
        var o = eval("(" + arg + ")");
        if (typeof o === "object") {
          return o;
        }
      } catch (e) {}
      return {};
    };
    TranslatePipe.prototype.transform = function(key, args) {
      if (args === void 0) {
        args = [];
      }
      var params = {};
      if (args[0]) {
        if (typeof args[0] === "string") {
          params = TranslatePipe._parseParams(args[0]);
          if (!Object.keys(params).length) {
            this._translate.logHandler.error("'" + args[0] + "' could not be parsed to object");
          }
        } else if (typeof args[0] === "object") {
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
      name: "translate",
      pure: false
    }), __param(0, core_1.Inject(TranslateService_1.TranslateService)), __metadata('design:paramtypes', [TranslateService_1.TranslateService])], TranslatePipe);
    return TranslatePipe;
  }());
  exports.TranslatePipe = TranslatePipe;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateConfig", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var TranslateConfig = (function() {
    function TranslateConfig(_a) {
      var _b = _a.defaultLang,
          defaultLang = _b === void 0 ? "en" : _b,
          _c = _a.providedLangs,
          providedLangs = _c === void 0 ? ["en"] : _c,
          _d = _a.detectLanguageOnStart,
          detectLanguageOnStart = _d === void 0 ? true : _d;
      this.defaultLang = providedLangs.indexOf(defaultLang) > -1 ? defaultLang : providedLangs[0];
      this.providedLangs = providedLangs;
      this.detectLanguageOnStart = detectLanguageOnStart;
      this.navigatorLanguages = (function() {
        var navigator = TranslateConfig.navigator;
        if (navigator.languages instanceof Array) {
          return Array.prototype.slice.call(navigator.languages);
        } else if (typeof navigator.languages === "string") {
          return [String(navigator.languages)];
        } else if (typeof navigator.language === "string") {
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
      var provided = false;
      var p;
      var normalizeLang = function(languageString) {
        var regExp = /^([A-Za-z]{2})(?:[\.\-_\/]?([A-Za-z]{2}))?$/;
        if (!languageString.match(regExp)) {
          return "";
        }
        return languageString.replace(regExp, function(substring, language, country) {
          if (country === void 0) {
            country = "";
          }
          language = language.toLowerCase();
          country = country.toUpperCase();
          return country ? language + "-" + country : language;
        });
      };
      var providedLangsNormalized = this.providedLangs.map(normalizeLang);
      lang = normalizeLang(lang);
      if (lang.length === 0) {
        return provided;
      }
      p = providedLangsNormalized.indexOf(lang);
      if (p > -1) {
        provided = this.providedLangs[p];
      } else if (!strict) {
        lang = lang.substr(0, 2);
        p = providedLangsNormalized.indexOf(lang);
        if (p > -1) {
          provided = this.providedLangs[p];
        } else {
          p = providedLangsNormalized.map(function(language) {
            return language.substr(0, 2);
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
  }());
  exports.TranslateConfig = TranslateConfig;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateLoader", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var TranslateLoader = (function() {
    function TranslateLoader() {}
    return TranslateLoader;
  }());
  exports.TranslateLoader = TranslateLoader;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateService", ["./TranslateConfig", "./TranslateLoader", "@angular/core", "rxjs/Observable", "rxjs/add/operator/share"], true, function($__require, exports, module) {
  "use strict";
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
  var TranslateConfig_1 = $__require('./TranslateConfig');
  var TranslateLoader_1 = $__require('./TranslateLoader');
  var core_1 = $__require('@angular/core');
  var Observable_1 = $__require('rxjs/Observable');
  $__require('rxjs/add/operator/share');
  exports.TranslateLogHandler = {
    debug: function() {},
    error: function(message) {
      return console && console.error && console.error(message);
    },
    info: function() {}
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
          logHandler.info("Language " + lang + " got detected");
        }
      }
      this.languageChanged = new Observable_1.Observable(function(observer) {
        return _this._languageChangedObserver = observer;
      }).share();
    }
    Object.defineProperty(TranslateService.prototype, "lang", {
      get: function() {
        return this._lang;
      },
      set: function(lang) {
        var providedLang = this._config.langProvided(lang, true);
        if (typeof providedLang === "string") {
          this._lang = providedLang;
          this.logHandler.info("Language changed to " + providedLang);
          if (this._languageChangedObserver) {
            this._languageChangedObserver.next(this._lang);
          }
          return;
        }
        throw new Error("Language not provided");
      },
      enumerable: true,
      configurable: true
    });
    TranslateService.prototype.detectLang = function(navLangs) {
      var detected = false;
      var i;
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
    TranslateService.prototype.waitForTranslation = function(lang) {
      if (lang === void 0) {
        lang = this._lang;
      }
      var l = this._config.langProvided(lang, true);
      if (!l) {
        return Promise.reject("Language not provided");
      } else {
        lang = String(l);
      }
      return this._loadLang(lang);
    };
    TranslateService.prototype.translate = function(keys, params, lang) {
      var _this = this;
      if (params === void 0) {
        params = {};
      }
      if (lang === void 0) {
        lang = this._lang;
      }
      return new Promise(function(resolve) {
        if (lang !== _this._lang) {
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
      if (typeof keys === "string") {
        return this.instant([keys], params, lang)[0];
      }
      if (lang !== this._lang) {
        var l = this._config.langProvided(lang, true);
        if (l) {
          lang = String(l);
        }
      }
      var result = [];
      var i = keys.length;
      var t;
      while (i--) {
        if (!this._translations[lang] || !this._translations[lang][keys[i]]) {
          this.logHandler.info("Translation for '" + keys[i] + "' in language " + lang + " not found");
          result.unshift(keys[i]);
          continue;
        }
        t = this._translations[lang][keys[i]];
        t = t.replace(/\[\[([\sA-Za-z0-9_.,=:-]*)]]/g, function(s, sub) {
          return _this._translateReferenced(s, sub, params, lang);
        });
        t = t.replace(/{{\s*(.*?)\s*}}/g, function(sub, expression) {
          try {
            return _this._parse(expression, params) || "";
          } catch (e) {
            _this.logHandler.error("Parsing error for expression '" + sub + "'");
            return "";
          }
        });
        result.unshift(t);
      }
      return result;
    };
    TranslateService.prototype._loadLang = function(lang) {
      var _this = this;
      if (!this._loadedLangs[lang]) {
        this._loadedLangs[lang] = new Promise(function(resolve, reject) {
          _this._loader.load(lang).then(function(translations) {
            _this._translations[lang] = translations;
            _this.logHandler.info("Language " + lang + " got loaded");
            resolve();
          }, function(reason) {
            _this.logHandler.error("Language " + lang + " could not be loaded (" + reason + ")");
            reject(reason);
          });
        });
      }
      return this._loadedLangs[lang];
    };
    TranslateService.prototype._parse = function(expression, __context) {
      var func = [];
      var varName;
      func.push("(function() {");
      if (Array.isArray(__context)) {
        this.logHandler.error("Parameters can not be an array.");
      } else {
        for (varName in __context) {
          if (!__context.hasOwnProperty(varName)) {
            continue;
          }
          if (varName === "__context" || !varName.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
            this.logHandler.error("Parameter '" + varName + "' is not allowed.");
            continue;
          }
          func.push("try { var " + varName + " = __context['" + varName + "']; } catch(e) {}");
        }
      }
      func.push("return (" + expression + "); })()");
      return eval(func.join("\n"));
    };
    TranslateService.prototype._referencedError = function(s, unexpected, expected, pos) {
      var msg = "Parse error unexpected " + unexpected;
      if (pos !== undefined) {
        msg += " at pos " + (pos + 3);
      }
      if (expected) {
        msg += " expected " + expected;
      }
      this.logHandler.error(msg + " in '" + s + "'");
      return "";
    };
    TranslateService.prototype._transportParam = function(from, to, paramKey, getter) {
      if (!getter) {
        getter = paramKey;
      }
      var gPos = getter.indexOf(".");
      if (gPos === -1) {
        if (from.hasOwnProperty(getter)) {
          to[paramKey] = from[getter];
        }
      } else {
        var gObj = getter.substr(0, gPos);
        var gGetter = getter.substr(gPos + 1);
        if (from.hasOwnProperty(gObj) && typeof from[gObj] === "object") {
          this._transportParam(from[gObj], to, paramKey, gGetter);
        }
      }
    };
    TranslateService.prototype._translateReferenced = function(s, sub, params, lang) {
      var j;
      var state = "wait_key";
      var key;
      var translateParams = {};
      var paramKey;
      var getter;
      for (j = 0; j < sub.length; j++) {
        switch (state) {
          case "wait_key":
            if (sub[j].match(/\s/)) {} else if (sub[j].match(/[A-Za-z0-9_.-]/)) {
              state = "read_key";
              key = sub[j];
            } else {
              return this._referencedError(s, "character", "key", j);
            }
            break;
          case "read_key":
            if (sub[j].match(/[A-Za-z0-9_.-]/)) {
              key += sub[j];
            } else if (sub[j] === ":") {
              state = "wait_param";
            } else if (sub[j].match(/\s/)) {
              state = "key_readed";
            } else {
              return this._referencedError(s, "character", "colon or end", j);
            }
            break;
          case "key_readed":
            if (sub[j].match(/\s/)) {} else if (sub[j] === ":") {
              state = "wait_param";
            } else {
              return this._referencedError(s, "character", "colon or end", j);
            }
            break;
          case "wait_param":
            if (sub[j].match(/\s/)) {} else if (sub[j].match(/[A-Za-z0-9_]/)) {
              state = "read_param_key";
              paramKey = sub[j];
            } else {
              return this._referencedError(s, "character", "parameter", j);
            }
            break;
          case "read_param_key":
            if (sub[j].match(/[A-Za-z0-9_]/)) {
              paramKey += sub[j];
            } else if (sub[j] === "=") {
              state = "wait_getter";
            } else if (sub[j] === ",") {
              this._transportParam(params, translateParams, paramKey);
              state = "wait_param";
            } else if (sub[j].match(/\s/)) {
              state = "param_key_readed";
            } else {
              return this._referencedError(s, "character", "comma, equal sign or end", j);
            }
            break;
          case "param_key_readed":
            if (sub[j].match(/\s/)) {} else if (sub[j] === "=") {
              state = "wait_getter";
            } else if (sub[j] === ",") {
              this._transportParam(params, translateParams, paramKey);
              state = "wait_param";
            } else {
              return this._referencedError(s, "character", "comma, equal sign or end", j);
            }
            break;
          case "wait_getter":
            if (sub[j].match(/\s/)) {} else if (sub[j].match(/[A-Za-z0-9_]/)) {
              state = "read_getter";
              getter = sub[j];
            } else {
              return this._referencedError(s, "character", "getter", j);
            }
            break;
          case "read_getter":
            if (sub[j].match(/[A-Za-z0-9_.]/)) {
              getter += sub[j];
            } else if (sub[j].match(/\s/)) {
              state = "getter_readed";
            } else if (sub[j] === ",") {
              this._transportParam(params, translateParams, paramKey, getter);
              state = "wait_param";
            } else {
              return this._referencedError(s, "character", "comma or end", j);
            }
            break;
          case "getter_readed":
            if (sub[j].match(/\s/)) {} else if (sub[j] === ",") {
              this._transportParam(params, translateParams, paramKey, getter);
              state = "wait_param";
            } else {
              return this._referencedError(s, "character", "comma or end", j);
            }
            break;
        }
      }
      switch (state) {
        case "param_key_readed":
        case "read_param_key":
          this._transportParam(params, translateParams, paramKey);
          break;
        case "getter_readed":
        case "read_getter":
          this._transportParam(params, translateParams, paramKey, getter);
          break;
        case "wait_key":
          return this._referencedError(s, "end", "key");
        case "wait_param":
          return this._referencedError(s, "end", "parameter");
        case "wait_getter":
          return this._referencedError(s, "end", "getter");
      }
      return String(this.instant(key, translateParams, lang));
    };
    TranslateService = __decorate([core_1.Injectable(), __param(0, core_1.Inject(TranslateConfig_1.TranslateConfig)), __param(1, core_1.Inject(TranslateLoader_1.TranslateLoader)), __param(2, core_1.Inject(exports.TranslateLogHandler)), __metadata('design:paramtypes', [TranslateConfig_1.TranslateConfig, TranslateLoader_1.TranslateLoader, Object])], TranslateService);
    return TranslateService;
  }());
  exports.TranslateService = TranslateService;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator/TranslateComponent", ["./TranslateService", "@angular/core"], true, function($__require, exports, module) {
  "use strict";
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
  var TranslateService_1 = $__require('./TranslateService');
  var core_1 = $__require('@angular/core');
  var TranslateComponent = (function() {
    function TranslateComponent(translate) {
      var _this = this;
      this.translation = "";
      this._params = {};
      this._translate = translate;
      translate.languageChanged.subscribe(function() {
        _this._startTranslation();
      });
    }
    Object.defineProperty(TranslateComponent.prototype, "key", {
      set: function(key) {
        this._key = key;
        this._startTranslation();
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(TranslateComponent.prototype, "params", {
      set: function(params) {
        if (typeof params !== "object") {
          this._translate.logHandler.error("Params have to be an object");
          return;
        }
        this._params = params;
        this._startTranslation();
      },
      enumerable: true,
      configurable: true
    });
    TranslateComponent.prototype._startTranslation = function() {
      var _this = this;
      if (!this._key) {
        return;
      }
      this._translate.translate(this._key, this._params).then(function(translation) {
        return _this.translation = String(translation);
      });
    };
    __decorate([core_1.Input("translate"), __metadata('design:type', String), __metadata('design:paramtypes', [String])], TranslateComponent.prototype, "key", null);
    __decorate([core_1.Input("translateParams"), __metadata('design:type', Object), __metadata('design:paramtypes', [Object])], TranslateComponent.prototype, "params", null);
    TranslateComponent = __decorate([core_1.Component({
      properties: ["translate", "translateParams"],
      selector: "[translate]",
      template: "{{translation}}"
    }), __param(0, core_1.Inject(TranslateService_1.TranslateService)), __metadata('design:paramtypes', [TranslateService_1.TranslateService])], TranslateComponent);
    return TranslateComponent;
  }());
  exports.TranslateComponent = TranslateComponent;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("angular2-translator", ["./angular2-translator/TranslateConfig", "./angular2-translator/TranslateLoader", "./angular2-translator/TranslateLoaderJson", "./angular2-translator/TranslateService", "./angular2-translator/TranslatePipe", "./angular2-translator/TranslateComponent"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  var TranslateConfig_1 = $__require('./angular2-translator/TranslateConfig');
  var TranslateLoader_1 = $__require('./angular2-translator/TranslateLoader');
  var TranslateLoaderJson_1 = $__require('./angular2-translator/TranslateLoaderJson');
  var TranslateService_1 = $__require('./angular2-translator/TranslateService');
  __export($__require('./angular2-translator/TranslateService'));
  __export($__require('./angular2-translator/TranslatePipe'));
  __export($__require('./angular2-translator/TranslateComponent'));
  __export($__require('./angular2-translator/TranslateConfig'));
  __export($__require('./angular2-translator/TranslateLoader'));
  __export($__require('./angular2-translator/TranslateLoaderJson'));
  exports.TRANSLATE_PROVIDERS = [{
    provide: TranslateConfig_1.TranslateConfig,
    useValue: new TranslateConfig_1.TranslateConfig({})
  }, {
    provide: TranslateLoaderJson_1.TranslateLoaderJsonConfig,
    useValue: new TranslateLoaderJson_1.TranslateLoaderJsonConfig()
  }, {
    provide: TranslateLoader_1.TranslateLoader,
    useClass: TranslateLoaderJson_1.TranslateLoaderJson
  }, {
    provide: TranslateService_1.TranslateLogHandler,
    useValue: TranslateService_1.TranslateLogHandler
  }, TranslateService_1.TranslateService];
  global.define = __define;
  return module.exports;
});
