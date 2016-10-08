!function(e){function r(e,r,o){return 4===arguments.length?t.apply(this,arguments):void n(e,{declarative:!0,deps:r,declare:o})}function t(e,r,t,o){n(e,{declarative:!1,deps:r,executingRequire:t,execute:o})}function n(e,r){r.name=e,e in v||(v[e]=r),r.normalizedDeps=r.deps}function o(e,r){if(r[e.groupIndex]=r[e.groupIndex]||[],-1==g.call(r[e.groupIndex],e)){r[e.groupIndex].push(e);for(var t=0,n=e.normalizedDeps.length;n>t;t++){var a=e.normalizedDeps[t],u=v[a];if(u&&!u.evaluated){var d=e.groupIndex+(u.declarative!=e.declarative);if(void 0===u.groupIndex||u.groupIndex<d){if(void 0!==u.groupIndex&&(r[u.groupIndex].splice(g.call(r[u.groupIndex],u),1),0==r[u.groupIndex].length))throw new TypeError("Mixed dependency cycle detected");u.groupIndex=d}o(u,r)}}}}function a(e){var r=v[e];r.groupIndex=0;var t=[];o(r,t);for(var n=!!r.declarative==t.length%2,a=t.length-1;a>=0;a--){for(var u=t[a],i=0;i<u.length;i++){var s=u[i];n?d(s):l(s)}n=!n}}function u(e){return y[e]||(y[e]={name:e,dependencies:[],exports:{},importers:[]})}function d(r){if(!r.module){var t=r.module=u(r.name),n=r.module.exports,o=r.declare.call(e,function(e,r){if(t.locked=!0,"object"==typeof e)for(var o in e)n[o]=e[o];else n[e]=r;for(var a=0,u=t.importers.length;u>a;a++){var d=t.importers[a];if(!d.locked)for(var i=0;i<d.dependencies.length;++i)d.dependencies[i]===t&&d.setters[i](n)}return t.locked=!1,r},{id:r.name});t.setters=o.setters,t.execute=o.execute;for(var a=0,i=r.normalizedDeps.length;i>a;a++){var l,s=r.normalizedDeps[a],c=v[s],f=y[s];f?l=f.exports:c&&!c.declarative?l=c.esModule:c?(d(c),f=c.module,l=f.exports):l=p(s),f&&f.importers?(f.importers.push(t),t.dependencies.push(f)):t.dependencies.push(null),t.setters[a]&&t.setters[a](l)}}}function i(e){var r,t=v[e];if(t)t.declarative?f(e,[]):t.evaluated||l(t),r=t.module.exports;else if(r=p(e),!r)throw new Error("Unable to load dependency "+e+".");return(!t||t.declarative)&&r&&r.__useDefault?r["default"]:r}function l(r){if(!r.module){var t={},n=r.module={exports:t,id:r.name};if(!r.executingRequire)for(var o=0,a=r.normalizedDeps.length;a>o;o++){var u=r.normalizedDeps[o],d=v[u];d&&l(d)}r.evaluated=!0;var c=r.execute.call(e,function(e){for(var t=0,n=r.deps.length;n>t;t++)if(r.deps[t]==e)return i(r.normalizedDeps[t]);throw new TypeError("Module "+e+" not declared as a dependency.")},t,n);void 0!==typeof c&&(n.exports=c),t=n.exports,t&&t.__esModule?r.esModule=t:r.esModule=s(t)}}function s(r){var t={};if(("object"==typeof r||"function"==typeof r)&&r!==e)if(m)for(var n in r)"default"!==n&&c(t,r,n);else{var o=r&&r.hasOwnProperty;for(var n in r)"default"===n||o&&!r.hasOwnProperty(n)||(t[n]=r[n])}return t["default"]=r,x(t,"__useDefault",{value:!0}),t}function c(e,r,t){try{var n;(n=Object.getOwnPropertyDescriptor(r,t))&&x(e,t,n)}catch(o){return e[t]=r[t],!1}}function f(r,t){var n=v[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,a=n.normalizedDeps.length;a>o;o++){var u=n.normalizedDeps[o];-1==g.call(t,u)&&(v[u]?f(u,t):p(u))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function p(e){if(I[e])return I[e];if("@node/"==e.substr(0,6))return I[e]=s(D(e.substr(6)));var r=v[e];if(!r)throw"Module "+e+" not present.";return a(e),f(e,[]),v[e]=void 0,r.declarative&&x(r.module.exports,"__esModule",{value:!0}),I[e]=r.declarative?r.module.exports:r.esModule}var v={},g=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},m=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(h){m=!1}var x;!function(){try{Object.defineProperty({},"a",{})&&(x=Object.defineProperty)}catch(e){x=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var y={},D="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,I={"@empty":{}};return function(e,n,o,a){return function(u){u(function(u){for(var d={_nodeRequire:D,register:r,registerDynamic:t,get:p,set:function(e,r){I[e]=r},newModule:function(e){return e}},i=0;i<n.length;i++)(function(e,r){r&&r.__esModule?I[e]=r:I[e]=s(r)})(n[i],arguments[i]);a(d);var l=p(e[0]);if(e.length>1)for(var i=1;i<e.length;i++)p(e[i]);return o?l["default"]:l})}}}("undefined"!=typeof self?self:global)

(["1"], ["4","5","9","a"], true, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.registerDynamic("2", ["3", "4", "5"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = this && this.__param || function (paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    };
    var TranslateLoader_1 = $__require("3");
    var core_1 = $__require("4");
    var http_1 = $__require("5");
    var TranslateLoaderJsonConfig = function () {
        // @todo maybe we will change it to a destructed parameter like we did for TranslateConfig
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
    }();
    exports.TranslateLoaderJsonConfig = TranslateLoaderJsonConfig;
    var TranslateLoaderJson = function (_super) {
        __extends(TranslateLoaderJson, _super);
        function TranslateLoaderJson(http, config) {
            _super.call(this);
            this._http = http;
            this._config = config;
        }
        TranslateLoaderJson.prototype.load = function (lang) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var file = _this._config.path + lang + _this._config.extension;
                _this._http.get(file).subscribe(function (response) {
                    if (response.status === 200) {
                        var translations = response.json();
                        var key = void 0;
                        for (key in translations) {
                            if (Array.isArray(translations[key])) {
                                translations[key] = translations[key].filter(function (v) {
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
    }(TranslateLoader_1.TranslateLoader);
    exports.TranslateLoaderJson = TranslateLoaderJson;
    

    return module.exports;
});
$__System.registerDynamic("6", ["7", "4"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = this && this.__param || function (paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    };
    var TranslateService_1 = $__require("7");
    var core_1 = $__require("4");
    var TranslatePipe = function () {
        function TranslatePipe(translate) {
            var _this = this;
            this._translation = "";
            this._translate = translate;
            translate.languageChanged.subscribe(function () {
                _this._startTranslation();
            });
        }
        TranslatePipe._parseParams = function (arg) {
            try {
                var o = eval("(" + arg + ")");
                if (typeof o === "object") {
                    return o;
                }
            } catch (e) {}
            return {};
        };
        /**
         * Translates key with given args.
         *
         * @see TranslateService.translate
         * @param {string} key
         * @param {array?} args
         * @returns {string}
         */
        TranslatePipe.prototype.transform = function (key, args) {
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
        TranslatePipe.prototype._startTranslation = function () {
            var _this = this;
            if (!this._translated || !this._translated.key) {
                return;
            }
            this._promise = this._translate.translate(this._translated.key, this._translated.params);
            this._promise.then(function (translation) {
                return _this._translation = String(translation);
            });
        };
        TranslatePipe = __decorate([core_1.Pipe({
            name: "translate",
            pure: false
        }), __param(0, core_1.Inject(TranslateService_1.TranslateService)), __metadata('design:paramtypes', [TranslateService_1.TranslateService])], TranslatePipe);
        return TranslatePipe;
    }();
    exports.TranslatePipe = TranslatePipe;
    

    return module.exports;
});
$__System.registerDynamic("8", [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var TranslateConfig = function () {
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
            this.navigatorLanguages = function () {
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
            }();
        }
        /**
         * Checks if given language "lang" is provided and returns the language.
         *
         * The checks running on normalized strings matching this pattern: /[a-z]{2}(-[A-Z]{2})?/
         * Transformation is done with this pattern: /^([A-Za-z]{2})([\.\-_\/]?([A-Za-z]{2}))?/
         *
         * If strict is false it checks country independent.
         *
         * @param {string} lang
         * @param {boolean?} strict
         * @returns {string|boolean}
         */
        TranslateConfig.prototype.langProvided = function (lang, strict) {
            if (strict === void 0) {
                strict = false;
            }
            var provided = false;
            var p;
            var normalizeLang = function (languageString) {
                var regExp = /^([A-Za-z]{2})(?:[\.\-_\/]?([A-Za-z]{2}))?$/;
                if (!languageString.match(regExp)) {
                    return "";
                }
                return languageString.replace(regExp, function (substring, language, country) {
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
                    p = providedLangsNormalized.map(function (language) {
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
    }();
    exports.TranslateConfig = TranslateConfig;
    

    return module.exports;
});
$__System.registerDynamic("3", [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var TranslateLoader = function () {
        function TranslateLoader() {}
        return TranslateLoader;
    }();
    exports.TranslateLoader = TranslateLoader;
    

    return module.exports;
});
$__System.registerDynamic("7", ["8", "3", "4", "9", "a"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = this && this.__param || function (paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    };
    var TranslateConfig_1 = $__require("8");
    var TranslateLoader_1 = $__require("3");
    var core_1 = $__require("4");
    var Observable_1 = $__require("9");
    $__require("a");
    exports.TranslateLogHandler = {
        debug: function () {},
        error: function (message) {
            return console && console.error && console.error(message);
        },
        info: function () {}
    };
    var TranslateService = function () {
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
            this.languageChanged = new Observable_1.Observable(function (observer) {
                return _this._languageChangedObserver = observer;
            }).share();
        }
        Object.defineProperty(TranslateService.prototype, "lang", {
            get: function () {
                return this._lang;
            },
            set: function (lang) {
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
        /**
         * Detects the preferred language by navLangs.
         *
         * Returns false if the user prefers a language that is not provided or
         * the provided language.
         *
         * @param {string[]} navLangs (usually navigator.languages)
         * @returns {string|boolean}
         */
        TranslateService.prototype.detectLang = function (navLangs) {
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
        /**
         * Waits for the current language to be loaded.
         *
         * @param {string?} lang
         * @returns {Promise<void>|Promise}
         */
        TranslateService.prototype.waitForTranslation = function (lang) {
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
        /**
         * Translate keys for current language or given language (lang) asynchronously.
         *
         * Optionally you can pass params for translation to be interpolated.
         *
         * @param {string|string[]} keys
         * @param {any?} params
         * @param {string?} lang
         * @returns {Promise<string|string[]>|Promise}
         */
        TranslateService.prototype.translate = function (keys, params, lang) {
            var _this = this;
            if (params === void 0) {
                params = {};
            }
            if (lang === void 0) {
                lang = this._lang;
            }
            return new Promise(function (resolve) {
                if (lang !== _this._lang) {
                    var l = _this._config.langProvided(lang, true);
                    if (!l) {
                        resolve(keys);
                        return;
                    } else {
                        lang = String(l);
                    }
                }
                _this._loadLang(lang).then(function () {
                    resolve(_this.instant(keys, params, lang));
                }, function () {
                    resolve(keys);
                });
            });
        };
        /**
         * Translate keys for current language or given language (lang) synchronously.
         *
         * Optionally you can pass params for translation to be interpolated.
         *
         * @param {string|string[]} keys
         * @param {any?} params
         * @param {string?} lang
         * @returns {string|string[]}
         */
        TranslateService.prototype.instant = function (keys, params, lang) {
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
                t = t.replace(/\[\[([\sA-Za-z0-9_.,=:-]*)]]/g, function (sub, expression) {
                    return _this._translateReferenced(sub, expression, params, lang);
                });
                // simple interpolation
                t = t.replace(/{{\s*(.*?)\s*}}/g, function (sub, expression) {
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
        /**
         * Load a language.
         *
         * @param {string} lang
         * @returns {Promise<void>|Promise}
         * @private
         */
        TranslateService.prototype._loadLang = function (lang) {
            var _this = this;
            if (!this._loadedLangs[lang]) {
                this._loadedLangs[lang] = new Promise(function (resolve, reject) {
                    _this._loader.load(lang).then(function (translations) {
                        _this._translations[lang] = translations;
                        _this.logHandler.info("Language " + lang + " got loaded");
                        resolve();
                    }, function (reason) {
                        _this.logHandler.error("Language " + lang + " could not be loaded (" + reason + ")");
                        reject(reason);
                    });
                });
            }
            return this._loadedLangs[lang];
        };
        /**
         * Parses the expression in the given __context.
         *
         * @param   {string} expression
         * @param   {object} __context
         * @returns {string}
         * @private
         */
        TranslateService.prototype._parse = function (expression, __context) {
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
        /**
         * Outputs a parse error for an error in translation references.
         *
         * @param   {string} sub
         * @param   {string} unexpected
         * @param   {string} expected
         * @param   {number} pos
         * @returns {string}
         * @private
         */
        TranslateService.prototype._referencedError = function (sub, unexpected, expected, pos) {
            var msg = "Parse error unexpected " + unexpected;
            if (pos !== undefined) {
                msg += " at pos " + (pos + 3);
            }
            if (expected) {
                msg += " expected " + expected;
            }
            this.logHandler.error(msg + " in '" + sub + "'");
            return "";
        };
        /**
         * Gets a parameter from params defined by getter recursive.
         *
         * @param   {object} params
         * @param   {string} getter
         * @returns {any}
         * @private
         */
        TranslateService.prototype._getParam = function (params, getter) {
            var pos = getter.indexOf(".");
            if (pos === -1) {
                return params.hasOwnProperty(getter) ? params[getter] : undefined;
            } else {
                var key = getter.substr(0, pos);
                return params.hasOwnProperty(key) && typeof params[key] === "object" ? this._getParam(params[key], getter.substr(pos + 1)) : undefined;
            }
        };
        /**
         * Translates a reference expression like '<key> [: <param> [= <getter> [, <param..n> [= <getter..n>]]]]'
         *
         * @param   {string} sub
         * @param   {string} expression
         * @param   {Object} params
         * @param   {string} lang
         * @returns {string}
         * @private
         */
        TranslateService.prototype._translateReferenced = function (sub, expression, params, lang) {
            var _this = this;
            var j;
            var state = "wait_key";
            var key;
            var translateParams = {};
            var paramKey;
            var getter;
            var transferParam = function (useGetter) {
                if (useGetter === void 0) {
                    useGetter = true;
                }
                if (useGetter && !paramKey) {
                    if (typeof _this._getParam(params, getter) !== "object") {
                        _this.logHandler.error("Only objects can be passed as params in '" + sub + "'");
                    } else {
                        translateParams = _this._getParam(params, getter);
                    }
                } else {
                    if (!useGetter) {
                        translateParams[paramKey] = _this._getParam(params, paramKey);
                    } else {
                        translateParams[paramKey] = _this._getParam(params, getter);
                    }
                }
            };
            for (j = 0; j < expression.length; j++) {
                switch (state) {
                    case "wait_key":
                        if (expression[j].match(/\s/)) {} else if (expression[j].match(/[A-Za-z0-9_.-]/)) {
                            state = "read_key";
                            key = expression[j];
                        } else {
                            return this._referencedError(sub, "character", "key", j);
                        }
                        break;
                    case "read_key":
                        if (expression[j].match(/[A-Za-z0-9_.-]/)) {
                            key += expression[j];
                        } else if (expression[j] === ":") {
                            state = "wait_param";
                        } else if (expression[j].match(/\s/)) {
                            state = "key_readed";
                        } else {
                            return this._referencedError(sub, "character", "colon or end", j);
                        }
                        break;
                    case "key_readed":
                        if (expression[j].match(/\s/)) {} else if (expression[j] === ":") {
                            state = "wait_param";
                        } else {
                            return this._referencedError(sub, "character", "colon or end", j);
                        }
                        break;
                    case "wait_param":
                        if (expression[j].match(/\s/)) {} else if (expression[j].match(/[A-Za-z0-9_]/)) {
                            state = "read_param_key";
                            paramKey = expression[j];
                        } else if (expression[j] === "=") {
                            if (Object.keys(translateParams).length > 0) {
                                this.logHandler.error("Parse error only first parameter can be passed as params in " + "'" + sub + "'");
                                return "";
                            }
                            state = "wait_getter";
                        } else {
                            return this._referencedError(sub, "character", "parameter", j);
                        }
                        break;
                    case "read_param_key":
                        if (expression[j].match(/[A-Za-z0-9_]/)) {
                            paramKey += expression[j];
                        } else if (expression[j] === "=") {
                            state = "wait_getter";
                        } else if (expression[j] === ",") {
                            transferParam(false);
                            state = "wait_param";
                        } else if (expression[j].match(/\s/)) {
                            state = "param_key_readed";
                        } else {
                            return this._referencedError(sub, "character", "comma, equal sign or end", j);
                        }
                        break;
                    case "param_key_readed":
                        if (expression[j].match(/\s/)) {} else if (expression[j] === "=") {
                            state = "wait_getter";
                        } else if (expression[j] === ",") {
                            transferParam(false);
                            state = "wait_param";
                        } else {
                            return this._referencedError(sub, "character", "comma, equal sign or end", j);
                        }
                        break;
                    case "wait_getter":
                        if (expression[j].match(/\s/)) {} else if (expression[j].match(/[A-Za-z0-9_]/)) {
                            state = "read_getter";
                            getter = expression[j];
                        } else {
                            return this._referencedError(sub, "character", "getter", j);
                        }
                        break;
                    case "read_getter":
                        if (expression[j].match(/[A-Za-z0-9_.]/)) {
                            getter += expression[j];
                        } else if (expression[j].match(/\s/)) {
                            state = "getter_readed";
                        } else if (expression[j] === ",") {
                            transferParam();
                            state = "wait_param";
                        } else {
                            return this._referencedError(sub, "character", "comma or end", j);
                        }
                        break;
                    case "getter_readed":
                        if (expression[j].match(/\s/)) {} else if (expression[j] === ",") {
                            transferParam();
                            state = "wait_param";
                        } else {
                            return this._referencedError(sub, "character", "comma or end", j);
                        }
                        break;
                }
            }
            switch (state) {
                case "param_key_readed":
                case "read_param_key":
                    transferParam(false);
                    break;
                case "getter_readed":
                case "read_getter":
                    transferParam();
                    break;
                case "wait_key":
                    return this._referencedError(sub, "end", "key");
                case "wait_param":
                    return this._referencedError(sub, "end", "parameter");
                case "wait_getter":
                    return this._referencedError(sub, "end", "getter");
            }
            return String(this.instant(key, translateParams, lang));
        };
        TranslateService = __decorate([core_1.Injectable(), __param(0, core_1.Inject(TranslateConfig_1.TranslateConfig)), __param(1, core_1.Inject(TranslateLoader_1.TranslateLoader)), __param(2, core_1.Inject(exports.TranslateLogHandler)), __metadata('design:paramtypes', [TranslateConfig_1.TranslateConfig, TranslateLoader_1.TranslateLoader, Object])], TranslateService);
        return TranslateService;
    }();
    exports.TranslateService = TranslateService;
    

    return module.exports;
});
$__System.registerDynamic("b", ["7", "4"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = this && this.__param || function (paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    };
    var TranslateService_1 = $__require("7");
    var core_1 = $__require("4");
    var TranslateComponent = function () {
        function TranslateComponent(translate) {
            var _this = this;
            this.translation = "";
            this._params = {};
            this._translate = translate;
            translate.languageChanged.subscribe(function () {
                _this._startTranslation();
            });
        }
        Object.defineProperty(TranslateComponent.prototype, "key", {
            set: function (key) {
                this._key = key;
                this._startTranslation();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TranslateComponent.prototype, "params", {
            set: function (params) {
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
        TranslateComponent.prototype._startTranslation = function () {
            var _this = this;
            if (!this._key) {
                return;
            }
            this._translate.translate(this._key, this._params).then(function (translation) {
                return _this.translation = String(translation);
            });
        };
        __decorate([core_1.Input("translate"), __metadata('design:type', String), __metadata('design:paramtypes', [String])], TranslateComponent.prototype, "key", null);
        __decorate([core_1.Input("translateParams"), __metadata('design:type', Object), __metadata('design:paramtypes', [Object])], TranslateComponent.prototype, "params", null);
        TranslateComponent = __decorate([core_1.Component({
            selector: "[translate]",
            template: "{{translation}}"
        }), __param(0, core_1.Inject(TranslateService_1.TranslateService)), __metadata('design:paramtypes', [TranslateService_1.TranslateService])], TranslateComponent);
        return TranslateComponent;
    }();
    exports.TranslateComponent = TranslateComponent;
    

    return module.exports;
});
$__System.registerDynamic("1", ["8", "3", "2", "7", "4", "5", "6", "b"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    var TranslateConfig_1 = $__require("8");
    var TranslateLoader_1 = $__require("3");
    var TranslateLoaderJson_1 = $__require("2");
    var TranslateService_1 = $__require("7");
    var core_1 = $__require("4");
    var http_1 = $__require("5");
    __export($__require("7"));
    __export($__require("6"));
    __export($__require("b"));
    __export($__require("8"));
    __export($__require("3"));
    __export($__require("2"));
    var TranslatorModule = function () {
        function TranslatorModule() {}
        TranslatorModule = __decorate([core_1.NgModule({
            imports: [http_1.HttpModule],
            providers: [{ provide: TranslateConfig_1.TranslateConfig, useValue: new TranslateConfig_1.TranslateConfig({}) }, { provide: TranslateLoaderJson_1.TranslateLoaderJsonConfig, useValue: new TranslateLoaderJson_1.TranslateLoaderJsonConfig() }, { provide: TranslateLoader_1.TranslateLoader, useClass: TranslateLoaderJson_1.TranslateLoaderJson }, { provide: TranslateService_1.TranslateLogHandler, useValue: TranslateService_1.TranslateLogHandler }, TranslateService_1.TranslateService]
        }), __metadata('design:paramtypes', [])], TranslatorModule);
        return TranslatorModule;
    }();
    exports.TranslatorModule = TranslatorModule;
    exports.TRANSLATE_PROVIDERS = [{ provide: TranslateConfig_1.TranslateConfig, useValue: new TranslateConfig_1.TranslateConfig({}) }, { provide: TranslateLoaderJson_1.TranslateLoaderJsonConfig, useValue: new TranslateLoaderJson_1.TranslateLoaderJsonConfig() }, { provide: TranslateLoader_1.TranslateLoader, useClass: TranslateLoaderJson_1.TranslateLoaderJson }, { provide: TranslateService_1.TranslateLogHandler, useValue: TranslateService_1.TranslateLogHandler }, TranslateService_1.TranslateService];
    

    return module.exports;
});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define(["@angular/core","@angular/http","rxjs/Observable","rxjs/add/operator/share"], factory);
  else if (typeof module == 'object' && module.exports && typeof require == 'function')
    module.exports = factory(require("@angular/core"), require("@angular/http"), require("rxjs/Observable"), require("rxjs/add/operator/share"));
  else
    throw new Error("Module must be loaded as AMD or CommonJS");
});