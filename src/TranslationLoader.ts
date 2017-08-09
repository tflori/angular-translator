export abstract class TranslationLoader {
    public abstract load(options: any): Promise<object>;

    protected flattenTranslations(translations: any, data: any, prefix: string = "") {
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
