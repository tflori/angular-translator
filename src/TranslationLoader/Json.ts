import { TranslationLoader } from "../TranslationLoader";

import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class TranslationLoaderJson extends TranslationLoader {
    constructor(private  http: Http) {
        super();
    }

    public load({
                    language,
                    module = "default",
                    path = "assets/i18n/{{ module }}/{{ language }}.json",
                }: {
        language?: string,
        module?: string,
        path?: string,
    }): Promise<object> {
        return new Promise((resolve, reject) => {
            let file = path.replace(/\{\{\s*([a-z]+)\s*\}\}/g, (substring: string, ...args: any[]) => {
                switch (args[0]) {
                    case "language":
                        return language;
                    case "module":
                        return module !== "default" ? module : ".";
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
                    },
                );
        });
    }
}
