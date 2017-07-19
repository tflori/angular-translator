import { TranslateLogHandler } from "./TranslateLogHandler";
import { Translator } from "./Translator";
import { TranslatorContainer } from "./TranslatorContainer";

import { Component, Input } from "@angular/core";
import { Subscription } from "rxjs/Subscription";

@Component({
    selector: "translate",
    template: "{{ translation }}"
})
export class TranslateComponent {
    public translation: string = "";

    private _key: string;
    private _params: any = {};
    private subscription: Subscription;

    constructor(
        private translator: Translator,
        private translatorContainer: TranslatorContainer,
        private logHandler: TranslateLogHandler,
    ) {
        this.subscription = this.translator.languageChanged.subscribe(() => {
            this.startTranslation();
        });
    }

    @Input("translate") set key(key: string) {
        this._key = key;
        this.startTranslation();
    }

    @Input("translateParams") set params(params: any) {
        if (typeof params !== "object") {
            this.logHandler.error("Params have to be an object");
            return;
        }

        this._params = params;
        this.startTranslation();
    }

    @Input("translatorModule") set module(module: string) {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.translator = this.translatorContainer.getTranslator(module);
        this.subscription = this.translator.languageChanged.subscribe(() => {
            this.startTranslation();
        });
        this.startTranslation();
    }

    private startTranslation() {
        if (!this._key) {
            return;
        }
        this.translator.translate(this._key, this._params).then(
            (translation) => this.translation = String(translation),
        );
    }
}
