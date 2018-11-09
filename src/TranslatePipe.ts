import { TranslateLogHandler } from "./TranslateLogHandler";
import { Translator } from "./Translator";
import { TranslatorContainer } from "./TranslatorContainer";

import { Inject, Pipe, PipeTransform } from "@angular/core";
import { Subscription } from "rxjs";

@Pipe({
    name: "translate",
    pure: false,
})
export class TranslatePipe implements PipeTransform {
    public static pipeName: string = "translate";
    private static _parseParams(arg: string): object {
        try {
            let o = eval("(" + arg + ")");
            if (typeof o === "object") {
                return o;
            }
        } catch (e) {
        }
        return {};
    }

    private promise: Promise<string>;
    private translation: string = "";
    private translated: { key: string, params: any, module: string };
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

    /**
     * Translates key with given args.
     *
     * @see TranslateService.translator
     * @param {string} key
     * @param {object} params
     * @param {string?} module
     * @returns {string}
     */
    public transform(key: string, params: object = {}, module?: string): string {
        if (module) {
            this.module = module;
        }

        // backward compatibility: highly deprecated
        if (params instanceof Array) {
            params = params[0];
            if (typeof params === "string") {
                params = TranslatePipe._parseParams(params);
            }
        }

        if (this.translated && this.promise &&
            (
                this.translated.key !== key ||
                JSON.stringify(this.translated.params) !== JSON.stringify(params) ||
                this.translated.module !== module
            )
        ) {
            this.promise = null;
        }

        if (!this.promise) {
            this.translated = {
                key,
                params,
                module,
            };
            this.startTranslation();
        }

        return this.translation;
    }

    set module(module: string) {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.translator = this.translatorContainer.getTranslator(module);
        this.subscription = this.translator.languageChanged.subscribe(() => {
            this.startTranslation();
        });
    }

    private startTranslation() {
        if (!this.translated || !this.translated.key) {
            return;
        }
        this.promise = this.translator.translate(this.translated.key, this.translated.params) as Promise<string>;
        this.promise.then((translation) => this.translation = String(translation));
    }
}
