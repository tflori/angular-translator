import {TranslateLogHandler} from "../../index";
import {TranslationLoader} from "../../src/TranslationLoader";

export class TranslationLoaderMock extends TranslationLoader {
    private _provided: Object = {};

    public provide(lang: string, translations: Object) {
        this._provided[lang] = translations;
    }

    public load(lang: string): Promise<Object> {
        return Promise.resolve(this._provided[lang] || {});
    }
}

export class TranslateLogHandlerMock extends TranslateLogHandler {
    public error(message: string): void {}
}
