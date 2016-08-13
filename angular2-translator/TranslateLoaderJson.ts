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
                            let translations = response.json();
                            let key;
                            for (key in translations) {
                                if (Array.isArray(translations[key])) {

                                    translations[key] = translations[key]
                                        .filter((v) => typeof v === "string")
                                        .join("");

                                } else if (typeof translations[key] !== "string") {
                                    delete translations[key];
                                }
                            }
                            resolve(translations);
                        } else {
                            reject("Language file could not be loaded (StatusCode: " + response.status + ")");
                        }
                    }
                );
        });
    }
}
