/**
 * A TranslateLoader has to load every file even if they are divided to partials. If a TranslateLoader resolves
 * the language is marked as loaded. It will not get loaded again.
 */
export interface ITranslateLoader {
    load(lang: string): Promise<Object>;
}

export abstract class TranslateLoader implements ITranslateLoader {
    public abstract load(lang: string): Promise<Object>;
}
