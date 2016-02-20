import {Injectable, Inject} from "angular2/core";
import {Http} from "angular2/http";
import {TranslateConfig} from './TranslateConfig';

@Injectable()
export class TranslateService {
    private _http:Http;
    private _config:TranslateConfig;

    constructor(@Inject(Http) http: Http, @Inject(TranslateConfig) config: TranslateConfig) {
        this._http   = http;
        this._config = config;
    }
}