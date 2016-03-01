export class TranslateConfig {
    public static navigator:any = window && window.navigator ? window.navigator : {};

    public defaultLang:string;
    public providedLangs:string[];
    public detectLanguageOnStart:boolean;
    public navigatorLanguages:string[];

    constructor({
        defaultLang = 'en',
        providedLangs = ['en'],
        detectLanguageOnStart = true
        }:{
        defaultLang?:string,
        providedLangs?:string[]
        detectLanguageOnStart?:boolean
    }) {
        this.defaultLang   = providedLangs.indexOf(defaultLang) > -1 ? defaultLang : providedLangs[0];
        this.providedLangs = providedLangs;
        this.detectLanguageOnStart = detectLanguageOnStart;
        this.navigatorLanguages = (():string[] => {
            var navigator:any = TranslateConfig.navigator;

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
    public langProvided(lang:string, strict:boolean = false):string|boolean {
        var provided:string|boolean = false, p;

        var normalizeLang = function (lang) {
            return lang.replace(
                /^([A-Za-z]{2})([\.\-_\/]?([A-Za-z]{2}))?/,
                function (substring, lang, v = '', country = '') {
                    lang    = lang.toLowerCase();
                    country = country.toUpperCase();
                    return country ? lang + '-' + country : lang;
                }
            );
        };

        var providedLangsNormalized = this.providedLangs.map(normalizeLang);
        lang = normalizeLang(lang);

        p = providedLangsNormalized.indexOf(lang);
        if (p > -1) {
            provided = this.providedLangs[p];
        } else if (!strict) {
            lang = lang.substr(0, 2);
            p    = providedLangsNormalized.indexOf(lang);
            if (p > -1) {
                provided = this.providedLangs[p];
            } else {
                p = providedLangsNormalized.map(function (lang) {
                    return lang.substr(0, 2);
                }).indexOf(lang);
                if (p > -1) {
                    provided = this.providedLangs[p];
                }
            }
        }

        return provided;
    }
}
