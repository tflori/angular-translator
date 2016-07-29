import {Pipe, PipeTransform, Inject} from "@angular/core";
import {TranslateService} from "./TranslateService";

@Pipe({
    name: 'translate',
    pure: false
})
export class TranslatePipe implements PipeTransform {
    private _translate:TranslateService;
    private _promise:Promise<string|string[]>;
    private _translation:string = '';
    private _translated:{key:string,params:any};

    constructor(@Inject(TranslateService) translate: TranslateService) {
        this._translate = translate;

        translate.languageChanged.subscribe(() => {
            this._startTranslation();
        });
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
                params = TranslatePipe._parseParams(args[0]);;
                if (!Object.keys(params).length) {
                    this._translate.logHandler.error('\'' + args[0] + '\' could not be parsed to object');
                }
            } else if (typeof args[0] === 'object') {
                params = args[0];
            }
        }

        if (this._translated && this._promise &&
            ( this._translated.key !== key ||
              JSON.stringify(this._translated.params) !== JSON.stringify(params)
            )
        ) {
            this._promise = null;
        }

        if (!this._promise) {
            this._translated = {
                key: key,
                params: params
            };
            this._startTranslation();
        }

        return this._translation;
    }

    private _startTranslation() {
        if (!this._translated || !this._translated.key) {
            return;
        }
        this._promise = this._translate.translate(this._translated.key, this._translated.params);
        this._promise.then((translation) => this._translation = String(translation));
    }

    private static _parseParams(arg:string):Object {
        try {
            var o = eval('(' + arg + ')');
            if (typeof o === 'object') {
                return o;
            }
        } catch(e) {}
        return {};
    }
}
