export class TranslateConfig {
    public defaultLang: string = 'en';

    constructor(defaultLang?: string) {
        if (defaultLang) {
            this.defaultLang = defaultLang;
        }
    }
}