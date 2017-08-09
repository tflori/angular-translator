
import { TranslationLoader } from "../TranslationLoader";

import { Injectable } from "@angular/core";

@Injectable()
export class TranslationLoaderFake extends TranslationLoader {
    protected translations: any = {};

    constructor(translations: any = {}) {
        super();
        this.flattenTranslations(this.translations, translations);
    }

    public load(): Promise<object> {
        return Promise.resolve(this.translations);
    }
}
