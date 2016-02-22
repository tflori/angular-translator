import {Injectable, Inject} from "angular2/core";
import {Http} from "angular2/http";
import {TranslateConfig} from './TranslateConfig';
import {TranslateLoader} from "./TranslateLoader";

@Injectable()
export class TranslateService {
    private _http:Http;
    private _config:TranslateConfig;
    private _loader:TranslateLoader;

    constructor(
        @Inject(Http) http: Http,
        @Inject(TranslateConfig) config: TranslateConfig,
        @Inject(TranslateLoader) loader: TranslateLoader
    ) {
        this._http   = http;
        this._config = config;
        this._loader = loader;
    }
}