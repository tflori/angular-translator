import {TranslateLoader}    from "./TranslateLoader";
import {Inject, Injectable} from "@angular/core";
import {Http}               from "@angular/http";

export class TranslateLoaderJsonConfig {
    public path: string      = "i18n/";
    public extension: string = ".json";

    // @todo maybe we will change it to a destructed parameter like we did for TranslateConfig
    constructor(path?: string, extension?: string) {
        if (path) {
            this.path = path.replace(/\/+$/, "") + "/";
        }

        if (extension) {
            this.extension = extension;
        }
    }
}

@Injectable()
export class TranslateLoaderJson extends TranslateLoader {
    private _http: Http;
    private _config: TranslateLoaderJsonConfig;

    constructor(@Inject(Http) http: Http, @Inject(TranslateLoaderJsonConfig) config: TranslateLoaderJsonConfig) {
        super();
        this._http = http;
        this._config = config;
    }

    public load(lang: string): Promise<Object> {
        return new Promise((resolve, reject) => {
            let file = this._config.path + lang + this._config.extension;
            this._http.get(file)
                .subscribe(
                    (response) => {
                        if (response.status === 200) {
                            let translations = {};
                            this.flattenTranslations(translations, response.json());
                            resolve(translations);
                        } else {
                            reject("StatusCode: " + response.status + "");
                        }
                    },
                    (reason: Error) => {
                        reject(reason.message);
                    }
                );
        });
    }

    private flattenTranslations(translations: any, data: any, prefix: string = "") {
        let key;
        for (key in data) {
            if (Array.isArray(data[key])) {
                translations[prefix + key] = data[key].filter(v => typeof v === "string").join("");
            } else if (typeof data[key] === "object") {
                this.flattenTranslations(translations, data[key], prefix + key + ".");
            } else if (typeof data[key] === "string") {
                translations[prefix + key] = data[key];
            }
        }
    }
}
