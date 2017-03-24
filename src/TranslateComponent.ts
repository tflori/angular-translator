import {TranslateService} from "./TranslateService";
import {Translator}       from "./Translator";

import {Component, Input} from "@angular/core";

@Component({
    selector: "[translate]",
    template: "{{translation}}",
})
export class TranslateComponent {
    public translation: string = "";

    private _key: string;
    private _params: any = {};

    constructor(private _: Translator, private translate: TranslateService) {

        translate.languageChanged.subscribe(() => {
            this._startTranslation();
        });
    }

    @Input("translate") set key(key: string) {
        this._key = key;
        this._startTranslation();
    }

    @Input("translateParams") set params(params: any) {
        if (typeof params !== "object") {
            this.translate.logHandler.error("Params have to be an object");
            return;
        }

        this._params = params;
        this._startTranslation();
    }

    private _startTranslation() {
        if (!this._key) {
            return;
        }
        this._.translate(this._key, this._params).then(
            (translation) => this.translation = String(translation)
        );
    }
}
