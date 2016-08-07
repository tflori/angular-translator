import {TranslateService}         from "./TranslateService";

import {Component, Inject, Input} from "@angular/core";

@Component({
    properties: [ "translate", "translateParams" ],
    selector: "[translate]",
    template: "{{translation}}",
})
export class TranslateComponent {
    public translation: string = "";

    private _translate: TranslateService;
    private _key: string;
    private _params: any = {};

    constructor(@Inject(TranslateService) translate: TranslateService) {
        this._translate = translate;

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
            this._translate.logHandler.error("Params have to be an object");
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
