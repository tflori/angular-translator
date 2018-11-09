import { TranslationLoader } from "../TranslationLoader";

import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class TranslationLoaderJson extends TranslationLoader {
    constructor(private  http: HttpClient) {
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
                    (data) => {
                        let translations = {};
                        this.flattenTranslations(translations, data);
                        resolve(translations);
                    },
                    (response: HttpErrorResponse) => {
                        reject(response.statusText);
                    },
                );
        });
    }
}
