import {Component} from "angular2/core";
import {TranslateService} from "./TranslateService";
import {Inject} from "angular2/core";
import {Input} from "angular2/core";

@Component({
    selector: '[translate]',
    properties: ['translate', 'translateParams'],
    template: '{{translation}}'
})
export class TranslateComponent {
    private _translate:TranslateService;

    private _key:string;
    private _params:any = {};

    public translation:string = '';

    constructor(@Inject(TranslateService) translate:TranslateService) {
        this._translate = translate;

        translate.languageChanged.subscribe(() => {
            this._startTranslation();
        })
    }

    @Input('translate') set key(key:string) {
        this._key = key;
        this._startTranslation();
    }

    @Input('translateParams') set params(params:any) {
        if (typeof params !== 'object') {
            return;
        }

        this._params = params;
        this._startTranslation();
    }

    private _startTranslation() {
        if (!this._key) {
            return;
        }
        this._translate.translate(this._key, this._params).then(
            (translation) => this.translation = String(translation)
        );
    }
}
