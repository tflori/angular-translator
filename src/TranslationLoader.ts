export abstract class TranslationLoader {
    public abstract load(options: any): Promise<object>;
}
