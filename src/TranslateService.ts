import {Injectable, Inject} from "angular2/core";
import {Http} from "angular2/http";
import {TranslateConfig} from './TranslateConfig';
import {TranslateLoader} from "./TranslateLoader";

@Injectable()
export class TranslateService {
    private _http:Http;
    private _config:TranslateConfig;
    private _loader:TranslateLoader;

    private _lang:string;

    constructor(@Inject(Http) http:Http,
                @Inject(TranslateConfig) config:TranslateConfig,
                @Inject(TranslateLoader) loader:TranslateLoader) {
        this._http   = http;
        this._config = config;
        this._loader = loader;

        this._lang = this._config.defaultLang;
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
     * Detects the preferred language by navigator.
     *
     * Returns false if the user prefers a language that is not provided or
     * the provided language.
     *
     * @param navigator
     * @returns {string|boolean}
     */
    public detectLang(navigator:any):string|boolean {
        var detected:string|boolean = false, navLangs:string[], i:number;

        if (navigator) {
            if (navigator.languages) {
                navLangs = Array.isArray(navigator.languages) ?
                    navigator.languages : [navigator.languages];
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
            }
            if (!detected && navigator.language) {
                detected = this._config.langProvided(navigator.language);
            }
        }

        return detected;
    }

    /**
     * Set translator to use language "lang".
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
            return true;
        }

        return false;
    }

    /**
     * Waits for the current language to be loaded.
     *
     * @returns {Promise<void>|Promise}
     */
    public waitForTranslation():Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._loader.load(this._lang).then((translations) => {
                resolve();
            }, (reason) => reject(reason));
        });
    }
}