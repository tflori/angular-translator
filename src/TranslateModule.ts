import {TranslateConfig} from "./TranslateConfig";
import {TranslateLoader} from "./TranslateLoader";
import {TranslateService} from "./TranslateService";
import {Injector} from "@angular/core";

export class TranslateModule {
    private loadedLangs: Object = {};
    private translations: Object = {};
    private loader: TranslateLoader;

    constructor(
        public name: string,
        private translateService: TranslateService,
        private config: TranslateConfig,
        private injector: Injector
    ) {}

    /**
     * Waits for the current language to be loaded.
     *
     * @param {string?} lang
     * @returns {Promise<void>|Promise}
     */
    public waitForTranslation(lang: string = this.translateService.lang): Promise<void> {
        let l = this.config.langProvided(lang, true);
        if (!l) {
            return Promise.reject("Language " + lang + " not provided");
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
    public translate(keys: string|string[], params: any = {}, lang?: string): Promise<string|string[]> {
        return new Promise<string|string[]>((resolve) => {
            if (lang) {
                let l = this.config.langProvided(lang, true);
                if (l) {
                    lang = String(l);
                } else {
                    resolve(keys);
                    return;
                }
            } else {
                lang = this.translateService.lang;
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
    public instant(keys: string|string[], params: any = {}, lang?: string): string|string[] {
        if (typeof keys === "string") {
            return this.instant([keys], params, lang)[0];
        }

        if (lang) {
            let l = this.config.langProvided(lang, true);
            if (l) {
                lang = String(l);
            } else {
                this.translateService.logHandler.error("Language " + lang + " not provided");
                return keys;
            }
        } else {
            lang = this.translateService.lang;
        }

        let result: string[] = [];
        let i = keys.length;
        let t: string;
        while (i--) {
            if (!this.translations[lang] || !this.translations[lang][keys[i]]) {
                this.translateService.logHandler.info(
                    "Translation for '" + keys[i] + "' in language " + lang + " not found"
                );
                result.unshift(keys[i]);
                continue;
            }
            t = this.translations[lang][keys[i]];

            t = t.replace(/\[\[([\sA-Za-z0-9_.,=:-]*)]]/g, (sub: string, expression: string) => {
                return this._translateReferenced(sub, expression, params, lang);
            });

            // simple interpolation
            t = t.replace(/{{\s*(.*?)\s*}}/g, (sub: string, expression: string) => {
                try {
                    return this._parse(expression, params) || "";
                } catch (e) {
                    if (e && e.message && e.message.indexOf("is not defined") === -1) {
                        this.translateService.logHandler.error("Parsing error for expression '" + sub + "'");
                    }
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
        if (!this.loader) {
            this.loader = Object.create(this.injector.get(this.config.loader));
            this.loader.configure(this.config.loaderConfig);
            this.loader.module = this.name;
        }

        if (!this.loadedLangs[lang]) {
            this.loadedLangs[lang] = new Promise<void>((resolve, reject) => {
                this.loader.load(lang).then((translations) => {
                    this.translations[lang] = translations;
                    this.translateService.logHandler.info("Language " + lang + " got loaded");
                    resolve();
                }, (reason) => {
                    this.translateService.logHandler.error(
                        "Language " + lang + " could not be loaded (" + reason + ")"
                    );
                    reject(reason);
                });
            });
        }
        return this.loadedLangs[lang];
    }

    /**
     * Parses the expression in the given __context.
     *
     * @param   {string} expression
     * @param   {object} __context
     * @returns {string}
     * @private
     */
    private _parse(expression: string, __context: any): string {
        let func: string[] = [];
        let varName: string;
        func.push("(function() {");
        if (Array.isArray(__context)) {
            this.translateService.logHandler.error("Parameters can not be an array.");
        } else {
            for (varName in __context) {
                if (!__context.hasOwnProperty(varName)) {
                    continue;
                }
                if (varName === "__context" || !varName.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
                    this.translateService.logHandler.error("Parameter '" + varName + "' is not allowed.");
                    continue;
                }
                func.push("try { var " + varName + " = __context['" + varName + "']; } catch(e) {}");
            }
        }
        func.push("return (" + expression + "); })()");
        return eval(func.join("\n"));
    }

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
    private _referencedError(sub: string, unexpected: string, expected: string, pos?: number): string {
        let msg = "Parse error unexpected " + unexpected;

        if (pos !== undefined) {
            msg += " at pos " + (pos + 3);
        }

        msg += " expected " + expected;

        this.translateService.logHandler.error(msg + " in '" + sub + "'");
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
    private _getParam(params: Object, getter: string): any {
        let pos = getter.indexOf(".");

        if (pos === -1) {
            return params.hasOwnProperty(getter) ? params[getter] : undefined;
        } else {
            let key = getter.substr(0, pos);
            return params.hasOwnProperty(key) && typeof params[key] === "object" ?
                   this._getParam(params[key], getter.substr(pos + 1)) : undefined;
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
    private _translateReferenced(sub: string, expression: string, params: Object, lang: string): string {
        let j: number;
        let state = "wait_key";
        let key: string;
        let translateParams = {};
        let paramKey: string;
        let getter: string;

        let transferParam = (useGetter = true) => {
            if (useGetter && !paramKey) {
                if (typeof this._getParam(params, getter) !== "object") {
                    this.translateService.logHandler.error("Only objects can be passed as params in '" + sub + "'");
                } else {
                    translateParams = this._getParam(params, getter);
                }
            } else {
                if (!useGetter) {
                    translateParams[paramKey] = this._getParam(params, paramKey);
                } else {
                    translateParams[paramKey] = this._getParam(params, getter);
                }
            }
        };

        for (j = 0; j < expression.length; j++) {
            switch (state) {
                case "wait_key":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j].match(/[A-Za-z0-9_.-]/)) {
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
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j] === ":") {
                        state = "wait_param";
                    } else {
                        return this._referencedError(sub, "character", "colon or end", j);
                    }
                    break;

                case "wait_param":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j].match(/[A-Za-z0-9_]/)) {
                        state    = "read_param_key";
                        paramKey = expression[j];
                    } else if (expression[j] === "=") {
                        if (Object.keys(translateParams).length > 0) {
                            this.translateService.logHandler.error(
                                "Parse error only first parameter can be passed as params in " + "'" + sub + "'"
                            );
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
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j] === "=") {
                        state = "wait_getter";
                    } else if (expression[j] === ",") {
                        transferParam(false);
                        state = "wait_param";
                    } else {
                        return this._referencedError(sub, "character", "comma, equal sign or end", j);
                    }
                    break;

                case "wait_getter":
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j].match(/[A-Za-z0-9_]/)) {
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
                    if (expression[j].match(/\s/)) {
                        // nothing to do here
                    } else if (expression[j] === ",") {
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
    }
}
