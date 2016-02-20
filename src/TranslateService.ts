import {Injectable, Inject} from "angular2/core";
import {Http} from "angular2/http";

@Injectable()
export class TranslateService {
    private _http:Http;

    constructor(@Inject(Http) http: Http) {
        this._http   = http;
    }
}