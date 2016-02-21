import {Injectable, Inject} from "angular2/core";
import {Http} from "angular2/http";
import {TranslateLoader} from "./TranslateLoader";

export class TranslateLoaderJsonConfig {
    public path:string      = 'i18n/';
    public extension:string = '.json';

    constructor(path?:string, extension?:string) {
        if (path) {
            this.path = path.replace(/\/+$/, '') + '/';
        }

        if (extension) {
            this.extension = extension;
        }
    }
}

@Injectable()
export class TranslateLoaderJson extends TranslateLoader {
    private _http:Http;
    private _config:TranslateLoaderJsonConfig;

    constructor(@Inject(Http) http: Http, @Inject(TranslateLoaderJsonConfig) config: TranslateLoaderJsonConfig) {
        super();
        this._http = http;
        this._config = config;
    }

    public load(lang:string):Promise<Object> {
        return new Promise(function() {});
    }
}
