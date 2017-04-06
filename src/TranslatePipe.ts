import {TranslateLogHandler} from "./TranslateLogHandler";
import {Translator} from "./Translator";

import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "translate",
    pure: false,
})
export class TranslatePipe implements PipeTransform {
    private static _parseParams(arg: string): object {
        try {
            let o = eval("(" + arg + ")");
            if (typeof o === "object") {
                return o;
            }
        } catch (e) {}
        return {};
    }

    private promise: Promise<string|string[]>;
    private translation: string = "";
    private translated: { key: string, params: any };

    constructor(private translator: Translator, private logHandler: TranslateLogHandler) {
        translator.languageChanged.subscribe(() => {
            this.startTranslation();
        });
    }

    /**
     * Translates key with given args.
     *
     * @see TranslateService.translator
     * @param {string} key
     * @param {array?} args
     * @returns {string}
     */
    public transform(key: string, args: any[] = []): string {
        let params: object = {};

        if (args[0]) {
            if (typeof args[0] === "string") {
                params = TranslatePipe._parseParams(args[0]);
                if (!Object.keys(params).length) {
                    this.logHandler.error("'" + args[0] + "' could not be parsed to object");
                }
            } else if (typeof args[0] === "object") {
                params = args[0];
            }
        }

        if (this.translated && this.promise &&
            ( this.translated.key !== key ||
              JSON.stringify(this.translated.params) !== JSON.stringify(params)
            )
        ) {
            this.promise = null;
        }

        if (!this.promise) {
            this.translated = {
                key,
                params,
            };
            this.startTranslation();
        }

        return this.translation;
    }

    private startTranslation() {
        if (!this.translated || !this.translated.key) {
            return;
        }
        this.promise = this.translator.translate(this.translated.key, this.translated.params);
        this.promise.then((translation) => this.translation = String(translation));
    }
}
