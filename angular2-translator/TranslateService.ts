import {Injectable, Inject} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import 'rxjs/add/operator/share';
import {TranslateConfig} from './TranslateConfig';
import {TranslateLoader} from "./TranslateLoader";
import {isArray} from "util";

export interface TranslateLogHandler {
    error(message:string):void;
    info(message:string):void;
    debug(message:string):void;
}

export const TranslateLogHandler = <TranslateLogHandler>{
    error: (message) => console && console.error && console.error(message),
    info: () => {},
    debug: () => {}
};

@Injectable()
export class TranslateService {
    private _config:TranslateConfig;
    private _loader:TranslateLoader;

    private _lang:string;
    private _loadedLangs:Object = {};
    private _translations:Object = {};
    private _languageChangedObserver:Observer<string>;

    public languageChanged:Observable<string>;
    public logHandler:TranslateLogHandler;

    constructor(@Inject(TranslateConfig) config:TranslateConfig,
                @Inject(TranslateLoader) loader:TranslateLoader,
                @Inject(TranslateLogHandler) logHandler:TranslateLogHandler) {
        this._config = config;
        this._loader = loader;
        this.logHandler = logHandler;

        this._lang = config.defaultLang;

        if (config.detectLanguageOnStart) {
            var lang = this.detectLang(config.navigatorLanguages);
            if (lang) {
                this._lang = String(lang);
                logHandler.info('Language ' + lang + ' got detected');
            }
        }

        this.languageChanged = new Observable<string>(
            observer => this._languageChangedObserver = observer
        ).share();
    }

    get lang():string {
        return this._lang;
    }

    set lang(lang:string) {
        var providedLang = this._config.langProvided(lang, true);

        if (typeof providedLang === 'string') {
            this._lang = providedLang;
            this.logHandler.info('Language changed to ' + providedLang);
            if (this._languageChangedObserver) {
                this._languageChangedObserver.next(this._lang);
            }

            return;
        }

        throw new Error('Language not provided');
    }

    /**
     * Detects the preferred language by navLangs.
     *
     * Returns false if the user prefers a language that is not provided or
     * the provided language.
     *
     * @param {string[]} navLangs (usually navigator.languages)
     * @returns {string|boolean}
     */
    public detectLang(navLangs:string[]):string|boolean {
        var detected:string|boolean = false, i:number;

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
    }

    /**
     * Waits for the current language to be loaded.
     *
     * @param {string?} lang
     * @returns {Promise<void>|Promise}
     */
    public waitForTranslation(lang:string = this._lang):Promise<void> {
        var l = this._config.langProvided(lang, true);
        if (!l) {
            return Promise.reject('Language not provided');
        } else {
            lang = String(l);
        }
        return this._loadLang(lang);
    }

    /**
     * Load a language.
     *
     * @param {string} lang
     * @returns {Promise<void>|Promise}
     * @private
     */
    private _loadLang(lang:string):Promise<void> {
        if (!this._loadedLangs[lang]) {
            this._loadedLangs[lang] = new Promise<void>((resolve, reject) => {
                this._loader.load(lang).then((translations) => {
                    this._translations[lang] = translations;
                    this.logHandler.info('Language ' + lang + ' got loaded');
                    resolve();
                }, (reason) => {
                    this.logHandler.error('Language ' + lang + ' could not be loaded (' + reason + ')');
                    reject(reason);
                });
            });
        }
        return this._loadedLangs[lang];
    }

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
    public translate(keys:string|string[], params:any = {}, lang:string = this._lang):Promise<string|string[]> {
        return new Promise<string|string[]>((resolve, reject) => {
            if (lang != this._lang) {
                var l = this._config.langProvided(lang, true);
                if (!l) {
                    resolve(keys);
                    return;
                } else {
                    lang = String(l);
                }
            }

            this._loadLang(lang).then(() => {
                resolve(this.instant(keys, params, lang));
            }, () => {
                resolve(keys);
            });
        });
    }

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
    public instant(keys:string|string[], params:any = {}, lang:string = this._lang):string|string[] {
        if (typeof keys === 'string') {
            return this.instant([keys], params, lang)[0];
        }

        if (lang != this._lang) {
            var l = this._config.langProvided(lang, true);
            if (l) {
                lang = String(l);
            }
        }

        var result = [], i = keys.length, t:string;
        while (i--) {
            if (!this._translations[lang] || !this._translations[lang][keys[i]]) {
                this.logHandler.info('Translation for \'' + keys[i] + '\' in language ' + lang + ' not found');
                result.unshift(keys[i]);
                continue;
            }
            t = this._translations[lang][keys[i]];

            // translate related
            t = t.replace(/\[\[\s*([A-Za-z0-9_\.-]+)\s*:?\s*([A-Za-z0-9,_]+)?\s*\]\]/g, (sub:string, key:string, vars:string = ''):string => {
                var translationParams = {};
                vars.split(',').map((key) => {
                    if (Object.prototype.hasOwnProperty.call(params, key)) {
                        translationParams[key] = params[key];
                    }
                });
                return String(this.instant(key, translationParams, lang));
            });

            // simple interpolation
            t = t.replace(/{{\s*(.*?)\s*}}/g, (sub:string, expression:string) => {
                try {
                    return this._parse(expression, params) || '';
                } catch(e) {
                    this.logHandler.error('Parsing error for expression \'' + expression + '\'');
                    return '';
                }
            });

            result.unshift(t);
        }

        return result;
    }

    private _parse(expression:string, __context:any) {
        var func:string[] = [], varName;
        func.push('(function() {');
        if (Array.isArray(__context)) {
            this.logHandler.error('Parameters can not be an array.');
        } else {
            for (varName in __context) {
                if (varName === '__context' || !varName.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
                    this.logHandler.error('Parameter \''+varName+'\' is not allowed.');
                    continue;
                }
                if (__context.hasOwnProperty(varName)) {
                    func.push('try { var ' + varName + ' = __context[\'' + varName + '\']; } catch(e) {}');
                }
            }
        }
        func.push('return (' + expression + '); })()');
        return eval(func.join("\n"));
    }
}
