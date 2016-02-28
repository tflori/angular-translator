import {TranslateLoader} from "../../angular2-translator/TranslateLoader";

export class TranslateLoaderMock extends TranslateLoader {
    private _provided:Object = {};

    public provide(lang:string, translations:Object) {
        this._provided[lang] = translations;
    }

    public load(lang:string):Promise<Object> {
        return Promise.resolve(this._provided[lang] || {});
    }
}