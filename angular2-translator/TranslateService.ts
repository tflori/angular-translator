import {Injectable, Inject} from "angular2/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import 'rxjs/add/operator/share';
import {TranslateConfig} from './TranslateConfig';
import {TranslateLoader} from "./TranslateLoader";

@Injectable()
export class TranslateService {
    private _config:TranslateConfig;
    private _loader:TranslateLoader;

    private _lang:string;
    private _loadedLangs:Object = {};
    private _translations:Object = {};
    private _languageChangedObserver:Observer<string>;

    public languageChanged:Observable<string>;

    constructor(@Inject(TranslateConfig) config:TranslateConfig,
                @Inject(TranslateLoader) loader:TranslateLoader) {
        this._config = config;
        this._loader = loader;

        this._lang = this._config.defaultLang;

        if (config.detectLanguageOnStart) {
            var lang = this.detectLang(config.navigatorLanguages);
            if (lang) {
                this._lang = String(lang);
            }
        }

        this.languageChanged = new Observable<string>(
            observer => this._languageChangedObserver = observer
        ).share();
    }

    /**
     * Getter for current language.
     *
     * @returns {string}
     */
    public currentLang():string {
        return this._lang;
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
     * Set translator to use language (lang).
     *
     * Returns true on success, false on failure
     *
     * @param lang
     * @return {boolean}
     */
    public useLang(lang:string):boolean {
        var providedLang = this._config.langProvided(lang, true);

        if (typeof providedLang === 'string') {
            this._lang = providedLang;
            if (this._languageChangedObserver) {
                this._languageChangedObserver.next(this._lang);
            }
            return true;
        }

        return false;
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
                    resolve();
                }, reject);
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
        if (!Array.isArray(keys)) {
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
                // missing translation
                result.unshift(keys[i]);
                continue;
            }
            t = this._translations[lang][keys[i]];

            // translate related
            t = t.replace(/\[\[\s*([A-Za-z0-9_\.-]+):?([A-Za-z0-9,_]+)?\s*\]\]/g, (sub:string, key:string, vars:string = ''):string => {
                var translationParams = {};
                vars.split(',').map((key) => {
                    if (Object.prototype.hasOwnProperty.call(params, key)) {
                        translationParams[key] = params[key];
                    }
                });
                return String(this.instant(key, translationParams, lang));
            });

            // simple interpolation
            t = t.replace(/{{\s*(.*?)\s*}}/g, function(sub:string, expression:string) {
                try {
                    return __parse(expression, params);
                } catch(e) {
                    // parse error
                    return '';
                }
            });

            result.unshift(t);
        }

        return result;
    }
}

function __parse(expression:string, params:any) {
    return eval('with(params) { (' + expression + ') }');
}
