import {TranslateLogHandler} from "./TranslateLogHandler";
import {TranslationLoader} from "./TranslationLoader";
import {TranslatorConfig} from "./TranslatorConfig";
import {TranslatorContainer} from "./TranslatorContainer";

import {Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";

@Injectable()
export class Translator {
    private _language: string = "en";
    private config: TranslatorConfig;
    private logHandler: TranslateLogHandler;
    private loader: TranslationLoader;
    private languageChangedObservable: Observable<string>;
    private languageChangedObserver: Observer<string>;
    private loadedLanguages: object = {};
    private translations: object = {};

    constructor(
        private _module: string,
        private injector: Injector,
    ) {
        let translatorConfig = injector.get(TranslatorConfig);
        this.logHandler = injector.get(TranslateLogHandler);
        let translatorContainer = injector.get(TranslatorContainer);

        this.config = _module === "default" ? translatorConfig : translatorConfig.module(_module);

        let providedLanguage = this.config.providedLanguage(translatorContainer.language);
        if (typeof providedLanguage === "string") {
            this._language = providedLanguage;
        } else {
            this._language = this.config.defaultLanguage;
        }

        this.languageChangedObservable = new Observable<string>((observer: any) => {
            this.languageChangedObserver = observer;
        });

        translatorContainer.languageChanged.subscribe((language) => {
            this._language = language;
        });
    }

    get languageChanged(): Observable<string> {
        return this.languageChangedObservable;
    }

    get module(): string {
        return this._module;
    }

    get language() {
        return this._language;
    }

    set language(language: string) {
        let providedLanguage = this.config.providedLanguage(language, true);

        if (typeof providedLanguage === "string") {
            this._language = providedLanguage;
            this.logHandler.info(this.generateMessage("language changed", { language: providedLanguage }));

            // only when someone subscribes the observer get created
            if (this.languageChangedObserver) {
                this.languageChangedObserver.next(providedLanguage);
            }
        }
    }

    /**
     * Waits for the current language to be loaded.
     *
     * @param {string?} language
     * @returns {Promise<void>|Promise}
     */
    public waitForTranslation(language?: string): Promise<void> {
        language = this.getSelectedLanguage(language);
        if (!language) {
            return Promise.reject("Language " + arguments[0] + " not provided");
        }

        return this.loadLanguage(language);
    }

    /**
     * Translate keys for current language or given language (lang) asynchronously.
     *
     * Optionally you can pass params for translation to be interpolated.
     *
     * @param {string|string[]} keys
     * @param {any?} params
     * @param {string?} language
     * @returns {Promise<string|string[]>|Promise}
     */
    public translate(keys: string|string[], params: any = {}, language?: string): Promise<string|string[]> {
        return new Promise<string|string[]>((resolve) => {
            language = this.getSelectedLanguage(language);
            if (!language) {
                resolve(keys);
                return;
            }

            this.loadLanguage(language).then(() => {
                resolve(this.instant(keys, params, language));
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
     * @param {string?} language
     * @returns {string|string[]}
     */
    public instant(keys: string|string[], params: any = {}, language?: string): string|string[] {
        if (typeof keys === "string") {
            return this.instant([keys], params, language)[0];
        }

        language = this.getSelectedLanguage(language);
        if (!language) {
            return keys;
        }

        let result: string[] = [];
        let i = keys.length;
        let t: string;
        while (i--) {
            if (!this.translations[language] || !this.translations[language][keys[i]]) {
                this.logHandler.info(this.generateMessage("missing", { key: keys[i], language }));
                result.unshift(keys[i]);
                continue;
            }
            t = this.translations[language][keys[i]];

            t = t.replace(/\[\[([\sA-Za-z0-9_.,=:-]*)]]/g, (sub: string, expression: string) => {
                return this.translateReferenced(sub, expression, params, language);
            });

            // simple interpolation
            t = t.replace(/{{\s*(.*?)\s*}}/g, (sub: string, expression: string) => {
                try {
                    return this.parse(expression, params) || "";
                } catch (e) {
                    if (e && e.message && e.message.indexOf("is not defined") === -1) {
                        this.logHandler.error("Parsing error for expression '" + sub + "'");
                    }
                    return "";
                }
            });

            result.unshift(t);
        }

        return result;
    }

    /**
     * Get the current language or the provided language.
     *
     * @param {string} language
     * @returns {string}
     */
    private getSelectedLanguage(language?: string): string {
        if (language) {
            let providedLanguage = this.config.providedLanguage(language, true);
            if (providedLanguage) {
                return String(providedLanguage);
            } else {
                this.logHandler.error(this.generateMessage("language not provided", { language }));
                return null;
            }
        } else {
            return this._language;
        }
    }

    /**
     * Load a language.
     *
     * @param {string} language
     * @returns {Promise<void>|Promise}
     * @private
     */
    private loadLanguage(language: string): Promise<void> {
        if (!this.loader) {
            this.loader = this.injector.get(this.config.loader);
        }

        if (!this.loadedLanguages[language]) {
            this.loadedLanguages[language] = new Promise<void>((resolve, reject) => {
                let loaderOptions = this.config.loaderOptions;
                loaderOptions.module = this.module;
                loaderOptions.language = language;

                this.loader.load(loaderOptions).then((translations) => {
                    this.translations[language] = translations;
                    this.logHandler.info(this.generateMessage("language loaded", { language }));
                    resolve();
                }, (reason) => {
                    this.logHandler.error(this.generateMessage("language not loaded", { language, reason }));
                    reject(reason);
                });
            });
        }
        return this.loadedLanguages[language];
    }

    /* tslint:disable:variable-name */
    /**
     * Parses the expression in the given __context.
     *
     * @param   {string} expression
     * @param   {object} __context
     * @returns {string}
     * @private
     */
    private parse(expression: string, __context: any): string {
        let func: string[] = [];
        let varName: string;
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
    /* tslint:enable:variable-name */

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
    private referencedError(sub: string, unexpected: string, expected: string, pos?: number): string {
        let msg = "Parse error unexpected " + unexpected;

        if (pos !== undefined) {
            msg += " at pos " + (pos + 3);
        }

        msg += " expected " + expected;

        this.logHandler.error(msg + " in '" + sub + "'");
        return "";
    }

    /**
     * Gets a parameter from params defined by getter recursive.
     *
     * @param   {object} params
     * @param   {string} getter
     * @returns {any}
     * @private
     */
    private getParam(params: object, getter: string): any {
        let pos = getter.indexOf(".");

        if (pos === -1) {
            return params.hasOwnProperty(getter) ? params[getter] : undefined;
        } else {
            let key = getter.substr(0, pos);
            return params.hasOwnProperty(key) && typeof params[key] === "object" ?
                   this.getParam(params[key], getter.substr(pos + 1)) : undefined;
        }
    }

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
    private translateReferenced(sub: string, expression: string, params: object, lang: string): string {
        let j: number;
        let status = "wait_key";
        let key: string;
        let translateParams = {};
        let paramKey: string;
        let getter: string;

        let transferParam = (useGetter = true) => {
            if (useGetter && !paramKey) {
                if (typeof this.getParam(params, getter) !== "object") {
                    this.logHandler.error("Only objects can be passed as params in '" + sub + "'");
                } else {
                    translateParams = this.getParam(params, getter);
                }
            } else {
                if (!useGetter) {
                    translateParams[paramKey] = this.getParam(params, paramKey);
                } else {
                    translateParams[paramKey] = this.getParam(params, getter);
                }
            }
        };

        for (j = 0; j < expression.length; j++) {
            switch (status) {
                case "wait_key":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j].match(/[A-Za-z0-9_.-]/)) {
                        status = "read_key";
                        key = expression[j];
                    } else {
                        return this.referencedError(sub, "character", "key", j);
                    }
                    break;

                case "read_key":
                    if (expression[j].match(/[A-Za-z0-9_.-]/)) {
                        key += expression[j];
                    } else if (expression[j] === ":") {
                        status = "wait_param";
                    } else if (expression[j].match(/\s/)) {
                        status = "key_readed";
                    } else {
                        return this.referencedError(sub, "character", "colon or end", j);
                    }
                    break;

                case "key_readed":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j] === ":") {
                        status = "wait_param";
                    } else {
                        return this.referencedError(sub, "character", "colon or end", j);
                    }
                    break;

                case "wait_param":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j].match(/[A-Za-z0-9_]/)) {
                        status    = "read_param_key";
                        paramKey = expression[j];
                    } else if (expression[j] === "=") {
                        if (Object.keys(translateParams).length > 0) {
                            this.logHandler.error(
                                "Parse error only first parameter can be passed as params in " + "'" + sub + "'",
                            );
                            return "";
                        }
                        status = "wait_getter";
                    } else {
                        return this.referencedError(sub, "character", "parameter", j);
                    }
                    break;

                case "read_param_key":
                    if (expression[j].match(/[A-Za-z0-9_]/)) {
                        paramKey += expression[j];
                    } else if (expression[j] === "=") {
                        status = "wait_getter";
                    } else if (expression[j] === ",") {
                        transferParam(false);
                        status = "wait_param";
                    } else if (expression[j].match(/\s/)) {
                        status = "param_key_readed";
                    } else {
                        return this.referencedError(sub, "character", "comma, equal sign or end", j);
                    }
                    break;

                case "param_key_readed":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j] === "=") {
                        status = "wait_getter";
                    } else if (expression[j] === ",") {
                        transferParam(false);
                        status = "wait_param";
                    } else {
                        return this.referencedError(sub, "character", "comma, equal sign or end", j);
                    }
                    break;

                case "wait_getter":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j].match(/[A-Za-z0-9_]/)) {
                        status = "read_getter";
                        getter = expression[j];
                    } else {
                        return this.referencedError(sub, "character", "getter", j);
                    }
                    break;

                case "read_getter":
                    if (expression[j].match(/[A-Za-z0-9_.]/)) {
                        getter += expression[j];
                    } else if (expression[j].match(/\s/)) {
                        status = "getter_readed";
                    } else if (expression[j] === ",") {
                        transferParam();
                        status = "wait_param";
                    } else {
                        return this.referencedError(sub, "character", "comma or end", j);
                    }
                    break;

                case "getter_readed":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j] === ",") {
                        transferParam();
                        status = "wait_param";
                    } else {
                        return this.referencedError(sub, "character", "comma or end", j);
                    }
                    break;
            }
        }

        switch (status) {
            case "param_key_readed":
            case "read_param_key":
                transferParam(false);
                break;

            case "getter_readed":
            case "read_getter":
                transferParam();
                break;

            case "wait_key":
                return this.referencedError(sub, "end", "key");
            case "wait_param":
                return this.referencedError(sub, "end", "parameter");
            case "wait_getter":
                return this.referencedError(sub, "end", "getter");
        }

        return String(this.instant(key, translateParams, lang));
    }

    private generateMessage(key: string, params: any = {}): string {
        let msg: string;
        params.module = this.module;
        switch (key) {
            case "missing":
                msg = "Translation for '{{key}}'" +
                    " in{{ module !== 'default' ? \" module '\" + module + \"' and\" : '' }}" +
                    " language {{language}} not found";
                break;

            case "language changed":
                msg = "Language changed to {{language}}" +
                    "{{ module !== 'default' ? \" in module '\" + module + \"'\" : '' }}";
                break;

            case "language not provided":
                msg = "Language {{language}} not provided" +
                    "{{ module !== 'default' ? \" in module '\" + module + \"'\" : '' }}";
                break;

            case "language loaded":
                msg = "Language {{language}}" +
                    "{{ module !== 'default' ? \" for module '\" + module + \"'\" : '' }}" +
                    " got loaded";
                break;

            case "language not loaded":
                msg = "Language {{language}}" +
                    "{{ module !== 'default' ? \" for module '\" + module + \"'\" : '' }}" +
                    " could not be loaded ({{reason}})";
        }

        return msg.replace(/{{\s*(.*?)\s*}}/g, (sub: string, expression: string) => {
            return this.parse(expression, params) || "";
        });
    }
}
