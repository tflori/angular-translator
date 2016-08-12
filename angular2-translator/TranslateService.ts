import {TranslateConfig} from "./TranslateConfig";
import {TranslateLoader} from "./TranslateLoader";

import {Inject, Injectable} from "@angular/core";
import {Observable}         from "rxjs/Observable";
import {Observer}           from "rxjs/Observer";
import "rxjs/add/operator/share";

export interface ITranslateLogHandler {
    error(message: string): void;
    info(message: string): void;
    debug(message: string): void;
}

export const TranslateLogHandler = <ITranslateLogHandler> {
    debug: () => {},
    error: (message) => console && console.error && console.error(message),
    info: () => {},
};

@Injectable()
export class TranslateService {
    public languageChanged: Observable<string>;
    public logHandler: ITranslateLogHandler;

    private _config: TranslateConfig;
    private _loader: TranslateLoader;

    private _lang: string;
    private _loadedLangs: Object = {};
    private _translations: Object = {};
    private _languageChangedObserver: Observer<string>;

    constructor(@Inject(TranslateConfig) config: TranslateConfig,
                @Inject(TranslateLoader) loader: TranslateLoader,
                @Inject(TranslateLogHandler) logHandler: ITranslateLogHandler) {
        this._config = config;
        this._loader = loader;
        this.logHandler = logHandler;

        this._lang = config.defaultLang;

        if (config.detectLanguageOnStart) {
            let lang = this.detectLang(config.navigatorLanguages);
            if (lang) {
                this._lang = String(lang);
                logHandler.info("Language " + lang + " got detected");
            }
        }

        this.languageChanged = new Observable<string>(
            observer => this._languageChangedObserver = observer
        ).share();
    }

    get lang(): string {
        return this._lang;
    }

    set lang(lang: string) {
        let providedLang = this._config.langProvided(lang, true);

        if (typeof providedLang === "string") {
            this._lang = providedLang;
            this.logHandler.info("Language changed to " + providedLang);
            if (this._languageChangedObserver) {
                this._languageChangedObserver.next(this._lang);
            }

            return;
        }

        throw new Error("Language not provided");
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
    public detectLang(navLangs: string[]): string|boolean {
        let detected: string|boolean = false;
        let i: number;

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
    public waitForTranslation(lang: string = this._lang): Promise<void> {
        let l = this._config.langProvided(lang, true);
        if (!l) {
            return Promise.reject("Language not provided");
        } else {
            lang = String(l);
        }
        return this._loadLang(lang);
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
    public translate(keys: string|string[], params: any = {}, lang: string = this._lang): Promise<string|string[]> {
        return new Promise<string|string[]>((resolve) => {
            if (lang !== this._lang) {
                let l = this._config.langProvided(lang, true);
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
    public instant(keys: string|string[], params: any = {}, lang: string = this._lang): string|string[] {
        if (typeof keys === "string") {
            return this.instant([keys], params, lang)[0];
        }

        if (lang !== this._lang) {
            let l = this._config.langProvided(lang, true);
            if (l) {
                lang = String(l);
            }
        }

        let result = [];
        let i = keys.length;
        let t: string;
        while (i--) {
            if (!this._translations[lang] || !this._translations[lang][keys[i]]) {
                this.logHandler.info("Translation for '" + keys[i] + "' in language " + lang + " not found");
                result.unshift(keys[i]);
                continue;
            }
            t = this._translations[lang][keys[i]];

            t = t.replace(/\[\[([\sA-Za-z0-9_.,=:-]*)]]/g, (s: string, sub: string) => {
                return this._translateReferenced(s, sub, params, lang);
            });

            // simple interpolation
            t = t.replace(/{{\s*(.*?)\s*}}/g, (sub: string, expression: string) => {
                try {
                    return this._parse(expression, params) || "";
                } catch (e) {
                    this.logHandler.error("Parsing error for expression '" + sub + "'");
                    return "";
                }
            });

            result.unshift(t);
        }

        return result;
    }

    /**
     * Load a language.
     *
     * @param {string} lang
     * @returns {Promise<void>|Promise}
     * @private
     */
    private _loadLang(lang: string): Promise<void> {
        if (!this._loadedLangs[lang]) {
            this._loadedLangs[lang] = new Promise<void>((resolve, reject) => {
                this._loader.load(lang).then((translations) => {
                    this._translations[lang] = translations;
                    this.logHandler.info("Language " + lang + " got loaded");
                    resolve();
                }, (reason) => {
                    this.logHandler.error("Language " + lang + " could not be loaded (" + reason + ")");
                    reject(reason);
                });
            });
        }
        return this._loadedLangs[lang];
    }

    // TODO add description
    private _parse(expression: string, __context: any) {
        let func: string[] = [];
        let varName;
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
    }

    // TODO add description
    private _referencedError(s: string, unexpected: string, expected?: string, pos?: string): string {
        let msg = "Parse error unexpected " + unexpected;

        if (pos !== undefined) {
            msg += " at pos " + (pos + 3);
        }

        if (expected) {
            msg += " expected " + expected;
        }

        this.logHandler.error(msg + " in '" + s + "'");
        return "";
    }

    // TODO add description
    private _transportParam(from: Object, to: Object, paramKey: string, getter?: string) {
        if (!getter) {
            getter = paramKey;
        }

        let gPos = getter.indexOf(".");

        if (gPos === -1) {
            if (from.hasOwnProperty(getter)) {
                to[paramKey] = from[getter];
            }
        } else {
            let gObj = getter.substr(0, gPos);
            let gGetter = getter.substr(gPos + 1);
            if (from.hasOwnProperty(gObj) && typeof from[gObj] === "object") {
                this._transportParam(from[gObj], to, paramKey, gGetter);
            }
        }
    }

    // TODO add description
    private _translateReferenced(s: string, sub: string, params: Object, lang: string) {
        let j;
        let state = "wait_key";
        let key;
        let translateParams = {};
        let paramKey;
        let getter;

        for (j = 0; j < sub.length; j++) {
            switch (state) {
                case "wait_key":
                    if (sub[j].match(/\s/)) {
                        // nothing to do here
                    } else if (sub[j].match(/[A-Za-z0-9_.-]/)) {
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
                    if (sub[j].match(/\s/)) {
                        // nothing to do here
                    } else if (sub[j] === ":") {
                        state = "wait_param";
                    } else {
                        return this._referencedError(s, "character", "colon or end", j);
                    }
                    break;

                case "wait_param":
                    if (sub[j].match(/\s/)) {
                        // nothing to do here
                    } else if (sub[j].match(/[A-Za-z0-9_]/)) {
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
                    if (sub[j].match(/\s/)) {
                        // nothing to do here
                    } else if (sub[j] === "=") {
                        state = "wait_getter";
                    } else if (sub[j] === ",") {
                        this._transportParam(params, translateParams, paramKey);
                        state = "wait_param";
                    } else {
                        return this._referencedError(s, "character", "comma, equal sign or end", j);
                    }
                    break;

                case "wait_getter":
                    if (sub[j].match(/\s/)) {
                        // nothing to do here
                    } else if (sub[j].match(/[A-Za-z0-9_]/)) {
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
                    if (sub[j].match(/\s/)) {
                        // nothing to do here
                    } else if (sub[j] === ",") {
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
    }
}
