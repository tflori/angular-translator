import {TranslateLoader}    from "./TranslateLoader";

import {Injectable} from "@angular/core";
import {Http}       from "@angular/http";

@Injectable()
export class TranslateLoaderJson extends TranslateLoader {
    private options: {
        path: string
    } = {
        path: "assets/i18n/{{ module }}/{{ lang }}.json",
    };

    constructor(private  http: Http) {
        super();
    }

    public configure(config: any): void {
        if (typeof config.path === "string") {
            this.options.path = config.path;
        }
    }

    public load(lang: string): Promise<Object> {
        return new Promise((resolve, reject) => {
            let file = this.options.path.replace(/\{\{\s*([a-z]+)\s*\}\}/g, (substring: string, ...args: any[]) => {
                switch (args[0]) {
                    case "lang":
                        return lang;
                    case "module":
                        return this.module !== "default" ? this.module : ".";
                }
            });
            this.http.get(file)
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
        for (let key in data) {
            if (Array.isArray(data[key])) {
                translations[prefix + key] = data[key].filter((v: any) => typeof v === "string").join("");
            } else if (typeof data[key] === "object") {
                this.flattenTranslations(translations, data[key], prefix + key + ".");
            } else if (typeof data[key] === "string") {
                translations[prefix + key] = data[key];
            }
        }
    }
}
