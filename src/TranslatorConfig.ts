export class TranslatorConfig {
    /**
     * Normalize a language
     *
     * @param {string} languageString
     * @returns {string}
     */
    private static normalizeLanguage(languageString: string): string {
        let regExp = /^([A-Za-z]{2})(?:[.\-_\/]?([A-Za-z]{2}))?$/;
        if (!languageString.match(regExp)) {
            return "";
        }
        return languageString.replace(
            regExp,
            function (substring: string, language: string, country: string = "") {
                language = language.toLowerCase();
                country = country.toUpperCase();
                return country ? language + "-" + country : language;
            }
        );
    }

    private options: any = {
        defaultLanguage: "en",
        providedLanguages: ["en"],
    };

    private moduleName: string;

    constructor(options?: any, module?: string) {
        this.setOptions(options);
        this.moduleName = module;
    }

    get defaultLanguage(): string {
        return this.options.defaultLanguage;
    }

    get providedLanguages(): string[] {
        return this.options.providedLanguages;
    }

    /**
     * Overwrite the options.
     *
     * @param {any} options
     */
    public setOptions(options: any): void {
        for (let key in options) {
            if (!{}.hasOwnProperty.call(options, key)) {
                continue;
            }
            this.options[key] = options[key];
        }

        if (this.options.providedLanguages.indexOf(this.options.defaultLanguage) === -1) {
            this.options.defaultLanguage = this.options.providedLanguages[0];
        }
    }

    /**
     * Checks if given language "language" is provided and returns the internal name.
     *
     * The checks running on normalized strings matching this pattern: /[a-z]{2}(-[A-Z]{2})?/
     * Transformation is done with this pattern: /^([A-Za-z]{2})([\.\-_\/]?([A-Za-z]{2}))?/
     *
     * If strict is false it checks country independent.
     *
     * @param {string} language
     * @param {boolean?} strict
     * @returns {string|boolean}
     */
    public providedLanguage(language: string, strict: boolean = false): string|boolean {
        let provided: string|boolean = false;
        let p: number;

        let providedLanguagesNormalized = this.providedLanguages.map(TranslatorConfig.normalizeLanguage);
        language = TranslatorConfig.normalizeLanguage(language);

        if (language.length === 0) {
            return provided;
        }

        p = providedLanguagesNormalized.indexOf(language);
        if (p > -1) {
            provided = this.providedLanguages[p];
        } else if (!strict) {
            language = language.substr(0, 2);
            p = providedLanguagesNormalized.indexOf(language);
            if (p > -1) {
                provided = this.providedLanguages[p];
            } else {
                p = providedLanguagesNormalized.map(function (l) {
                    return l.substr(0, 2);
                }).indexOf(language);
                if (p > -1) {
                    provided = this.providedLanguages[p];
                }
            }
        }

        return provided;
    }

    /**
     * Get the configuration for module.
     *
     * @param {string} module
     * @returns {TranslatorConfig}
     */
    public module(module: string) {
        if (this.moduleName) {
            throw new Error("Module configs can not be stacked");
        }

        let moduleConfig = new TranslatorConfig(this.options, module);

        if (this.options.modules && this.options.modules[module]) {
            moduleConfig.setOptions(this.options.modules[module]);
        }

        return moduleConfig;
    }
}
