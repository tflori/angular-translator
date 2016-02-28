import {Pipe, PipeTransform, Inject} from "angular2/core";
import {TranslateService} from "./TranslateService";

@Pipe({
    name: 'translate',
    pure: false
})
export class TranslatePipe implements PipeTransform {
    private _translate:TranslateService;
    private _promise:Promise<string|string[]>;
    private _translation:string = '';
    private _translated:{key:string,params:string};

    constructor(@Inject(TranslateService) translate: TranslateService) {
        this._translate = translate;
    }

    /**
     * Translates key with given args.
     *
     * @see TranslateService.translate
     * @param {string} key
     * @param {array?} args
     * @returns {string}
     */
    public transform(key:string, args:any[] = []):string {
        var params:Object = <ObjectConstructor>{};

        if (args[0]) {
            if (typeof args[0] === 'string') {
                params = __parseParams(args[0]);
            } else if (typeof args[0] === 'object') {
                params = args[0];
            }
        }

        if (this._translated && this._promise &&
            (this._translated.key !== key || this._translated.params !== JSON.stringify(params))
        ) {
            this._promise = null;
        }

        if (!this._promise) {
            this._translated = {
                key: key,
                params: JSON.stringify(params)
            };
            this._promise = this._translate.translate(key, params);
            this._promise.then(
                (translation) => this._translation = String(translation)
            );
        }

        return this._translation;
    }
}

function __parseParams(arg:string):Object {
    try {
        var o = eval('(' + arg + ')');
        if (typeof o === 'object') {
            return o;
        }
    } catch(e) {}
    return {};
}