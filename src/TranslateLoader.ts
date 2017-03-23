export abstract class TranslateLoader {
    public module = "default";

    public abstract load(lang: string): Promise<Object>;
    public configure(config: any): void {}
}
