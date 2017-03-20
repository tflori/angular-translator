export abstract class TranslateLoader {
    public abstract load(lang: string): Promise<Object>;

    public configure(config: Object): void {}
}
