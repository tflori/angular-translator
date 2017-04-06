import {TranslateLogHandler} from "./TranslateLogHandler";
import {Translator} from "./Translator";

import {Component, Input} from "@angular/core";

@Component({
    selector: "[translate]",
    template: "{{translation}}",
})
export class TranslateComponent {
    public translation: string = "";

    private KEY: string;
    private PARAMS: any = {};

    constructor(private translator: Translator, private logHandler: TranslateLogHandler) {
        translator.languageChanged.subscribe(() => {
            this._startTranslation();
        });
    }

    @Input("translate") set key(key: string) {
        this.KEY = key;
        this._startTranslation();
    }

    @Input("translateParams") set params(params: any) {
        if (typeof params !== "object") {
            this.logHandler.error("Params have to be an object");
            return;
        }

        this.PARAMS = params;
        this._startTranslation();
    }

    private _startTranslation() {
        if (!this.KEY) {
            return;
        }
        this.translator.translate(this.KEY, this.PARAMS).then(
            (translation) => this.translation = String(translation),
        );
    }
}
