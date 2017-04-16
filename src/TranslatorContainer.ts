import {TranslateLogHandler} from "./TranslateLogHandler";
import {TranslatorConfig} from "./TranslatorConfig";

import {Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {Translator} from "./Translator";

import "rxjs/add/operator/share";

@Injectable()
export class TranslatorContainer {
    private _language: string = "en";
    private languageChangedObservable: Observable<string>;
    private languageChangedObserver: Observer<string>;
    private translators: any = {};

    constructor(
        private config: TranslatorConfig,
        private logHandler: TranslateLogHandler,
        private injector: Injector,
    ) {
        this._language = config.defaultLanguage;
        if (config.detectLanguage) {
            this.detectLanguage();
        }
        this.languageChangedObservable = new Observable<string>((observer: Observer<string>) => {
            this.languageChangedObserver = observer;
        }).share();
    }

    get languageChanged(): Observable<string> {
        return this.languageChangedObservable;
    }

    get language(): string {
        return this._language;
    }

    set language(language: string) {
        let providedLanguage = this.config.providedLanguage(language, true);

        if (typeof providedLanguage === "string") {
            this._language = providedLanguage;

            // only when someone subscribes the observer get created
            if (this.languageChangedObserver) {
                this.languageChangedObserver.next(providedLanguage);
            }
        } else {
            throw new Error("Language " + language + " not provided");
        }
    }

    public getTranslator(module: string) {
        if (!this.translators[module]) {
            this.translators[module] = new Translator(module, this.injector);
        }
        return this.translators[module];
    }

    /**
     * Detects the preferred language.
     *
     * Returns false if the user prefers a language that is not provided or
     * true.
     *
     * @returns {boolean}
     */
    private detectLanguage(): boolean {
        let providedLanguage: string|boolean;
        let i: number;

        const detected = (language): boolean => {
            this._language = language;
            this.logHandler.info("Language " + language + " got detected");
            return true;
        };

        if (this.config.preferExactMatches) {
            this.logHandler.debug(
                "Detecting language from " + JSON.stringify(this.config.navigatorLanguages) + " in strict mode",
            );
            for (i = 0; i < this.config.navigatorLanguages.length; i++) {
                providedLanguage = this.config.providedLanguage(this.config.navigatorLanguages[i], true);
                if (typeof providedLanguage === "string") {
                    this.logHandler.debug("Detected " + providedLanguage + " by " + this.config.navigatorLanguages[i]);
                    return detected(providedLanguage);
                } else {
                    this.logHandler.debug("Language " + this.config.navigatorLanguages[i] + " is not provided");
                }
            }
        }

        this.logHandler.debug(
            "Detecting language from " + JSON.stringify(this.config.navigatorLanguages) + " in non-strict mode",
        );
        for (i = 0; i < this.config.navigatorLanguages.length; i++) {
            providedLanguage = this.config.providedLanguage(this.config.navigatorLanguages[i]);
            if (typeof providedLanguage === "string") {
                this.logHandler.debug("Detected " + providedLanguage + " by " + this.config.navigatorLanguages[i]);
                return detected(providedLanguage);
            } else {
                this.logHandler.debug("Language " + this.config.navigatorLanguages[i] + " is not provided");
            }
        }

        this.logHandler.debug("No language got detected - using default language");
        return false;
    }
}
