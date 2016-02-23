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

    public currentLang():string {
        return this._lang;
    }

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
}