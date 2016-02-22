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
        return new Promise((resolve, reject) => {
            var file = this._config.path + lang + this._config.extension;
            //console.log('loading language ' + lang + ' with TranslateLoaderJson from file ' + file);
            this._http.get(file)
                .subscribe(
                    (response) => {
                        if (response.status === 200) {
                            resolve(response.json())
                        } else {
                            reject('Language file could not be loaded (StatusCode: ' + response.status + ')');
                        }
                    }
                );
        });
    }
}
