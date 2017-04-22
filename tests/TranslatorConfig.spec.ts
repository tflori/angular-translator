import { COMMON_PURE_PIPES, TranslateLogHandler, TranslatePipe, TranslatorConfig } from "../index";

import {
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    JsonPipe,
    LowerCasePipe,
    PercentPipe,
    SlicePipe,
    TitleCasePipe,
    UpperCasePipe,
} from "@angular/common";
import { PipeTransform } from "@angular/core";
import { TranslateLogHandlerMock } from "./helper/TranslatorMocks";

class AnotherPipe implements PipeTransform {
    public static pipeName = "another";

    public transform(value: any, ...args: any[]) {
        throw new Error("Method not implemented.");
    }
}

describe("TranslatorConfig", () => {
    let logHandler: TranslateLogHandler;

    beforeEach(() => {
        logHandler = new TranslateLogHandlerMock();
    });

    it("is defined", () => {
        let translatorConfig = new TranslatorConfig(logHandler);

        expect(TranslatorConfig).toBeDefined();
        expect(translatorConfig).toBeDefined();
        expect(translatorConfig instanceof TranslatorConfig).toBeTruthy();
    });

    it("gets default language from parameter defaultLanguage", () => {
        let translatorConfig = new TranslatorConfig(logHandler, {
            defaultLanguage: "cn",
            providedLanguages: [ "en", "cn" ],
        });

        expect(translatorConfig.defaultLanguage).toBe("cn");
    });

    it("ignores options from prototype", () => {
        // tslint:disable-next-line
        let MyObject = function MyOption(): void {};
        MyObject.prototype.defaultLanguage = "de";
        let config = new MyObject();
        config.providedLanguages = ["en", "de"];

        let translatorConfig = new TranslatorConfig(logHandler, config);

        expect(translatorConfig.defaultLanguage).toBe("en");
        expect(translatorConfig.providedLanguages).toEqual(["en", "de"]);
    });

    it("defines a list of provided languages", () => {
        let translatorConfig = new TranslatorConfig(logHandler);

        expect(translatorConfig.providedLanguages).toEqual(["en"]);
    });

    it("gets provided languages from parameter providedLanguages", () => {
        let translatorConfig = new TranslatorConfig(logHandler, { providedLanguages: [ "cn" ] });

        expect(translatorConfig.providedLanguages).toEqual([ "cn" ]);
    });

    it("uses first provided language", () => {
        let translatorConfig = new TranslatorConfig(logHandler, {
            defaultLanguage: "en", // default - unnecessary
            providedLanguages: [ "cn" ],
        });

        expect(translatorConfig.defaultLanguage).toBe("cn");
    });

    describe("languageProvided", () => {
        let translatorConfig: TranslatorConfig;

        it("returns the language if provided", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "bm", "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("bm");

            expect(providedLanguage).toBe("bm");
        });

        it("returns false when it is not provided", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("bm");

            expect(providedLanguage).toBeFalsy();
        });

        it("returns provided language when we search with country", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("en-US");

            expect(providedLanguage).toBe("en");
        });

        it("returns the first provided country specific language", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "de-DE", "de-AT" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("de-CH");

            expect(providedLanguage).toBe("de-DE");
        });

        it("normalizes provided languages for checks", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "DE", "DE_AT" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("de-AT");

            expect(providedLanguage).toBe("DE_AT");
        });

        it("normalizes searched language", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "de-DE", "de-AT" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("DE/de");

            expect(providedLanguage).toBe("de-DE");
        });

        it("only finds direct matches", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "de-DE" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("de", true);

            expect(providedLanguage).toBeFalsy();
        });

        it("only takes valid matches", () => {
            translatorConfig = new TranslatorConfig(logHandler, {
                providedLanguages: [ "br", "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("british");

            expect(providedLanguage).toBeFalsy();
        });
    });

    describe("navigatorLanguages", () => {
        it("is always an array", () => {
            let translateConfig = new TranslatorConfig(logHandler);

            expect(translateConfig.navigatorLanguages instanceof Array).toBe(true);
        });

        it("uses navigator.languages when given", () => {
            TranslatorConfig.navigator = { languages: [ "bm", "de", "fr", "en" ] };

            let translateConfig = new TranslatorConfig(logHandler);

            expect(translateConfig.navigatorLanguages).toEqual([ "bm", "de", "fr", "en" ]);
        });

        it("transforms navigator.languages to Array if it is String", () => {
            TranslatorConfig.navigator = { languages: "bm" };

            let translateConfig = new TranslatorConfig(logHandler);

            expect(translateConfig.navigatorLanguages).toEqual([ "bm" ]);
        });

        it("falls back to navigator.language", () => {
            TranslatorConfig.navigator = {language: "fr"};

            let translateConfig = new TranslatorConfig(logHandler);

            expect(translateConfig.navigatorLanguages).toEqual(["fr"]);
        });

        it("can be overwritten by options", () => {
            TranslatorConfig.navigator = {language: "fr"};

            let translateConfig = new TranslatorConfig(logHandler, {
                navigatorLanguages: ["de", "en"],
            });

            expect(translateConfig.navigatorLanguages).toEqual(["de", "en"]);
        });
    });

    describe("module", () => {
        let main: TranslatorConfig = new TranslatorConfig(logHandler, {
            defaultLanguage: "fr",
            providedLanguages: [ "fr", "de", "en", "it" ],
        });

        it("returns a TranslatorConfig", () => {
            let moduleConfig = main.module("menu");

            expect(moduleConfig).toEqual(jasmine.any(TranslatorConfig));
        });

        it("can not be stacked", () => {
            let moduleConfig = main.module("menu");

            let action = function() {
                moduleConfig.module("deeper");
            };

            expect(action).toThrow(new Error("Module configs can not be stacked"));
        });

        it("has the same options", () => {
            let moduleConfig = main.module("menu");

            expect(moduleConfig.providedLanguages).toEqual(main.providedLanguages);
            expect(moduleConfig.defaultLanguage).toEqual(main.defaultLanguage);
        });

        it("overwrites with the module options", () => {
            main.setOptions({
                modules: {
                    menu: { providedLanguages: [ "en" ] },
                },
            });

            let moduleConfig = main.module("menu");

            expect(moduleConfig.providedLanguages).toEqual([ "en" ]);
            expect(moduleConfig.defaultLanguage).toEqual("en");
        });
    });

    describe("pipes", () => {
        it("contains the pure pipes from common module by default", () => {
            let translatorConfig = new TranslatorConfig(logHandler);

            expect(translatorConfig.pipes).toEqual({
                currency: CurrencyPipe,
                date: DatePipe,
                number: DecimalPipe,
                json: JsonPipe,
                lowercase: LowerCasePipe,
                percent: PercentPipe,
                slice: SlicePipe,
                titlecase: TitleCasePipe,
                uppercase: UpperCasePipe,
            });
        });

        it("appends pipes defined in options", () => {
            let translatorConfig = new TranslatorConfig(logHandler, {
                pipes: [ TranslatePipe ],
            });

            expect(translatorConfig.pipes).toEqual({
                currency: CurrencyPipe,
                date: DatePipe,
                number: DecimalPipe,
                json: JsonPipe,
                lowercase: LowerCasePipe,
                percent: PercentPipe,
                slice: SlicePipe,
                titlecase: TitleCasePipe,
                uppercase: UpperCasePipe,
                translate: TranslatePipe,
            });
        });

        it("uses pipeName for mapping if available", () => {
            let translatorConfig = new TranslatorConfig(logHandler, {
                pipes: [ AnotherPipe ],
            });

            expect(translatorConfig.pipes).toEqual({
                currency: CurrencyPipe,
                date: DatePipe,
                number: DecimalPipe,
                json: JsonPipe,
                lowercase: LowerCasePipe,
                percent: PercentPipe,
                slice: SlicePipe,
                titlecase: TitleCasePipe,
                uppercase: UpperCasePipe,
                another: AnotherPipe,
            });
        });

        it("does not modify the constant", () => {
            let translatorConfig = new TranslatorConfig(logHandler, {
                pipes: [ TranslatePipe ],
            });

            expect(COMMON_PURE_PIPES).toEqual([
                CurrencyPipe,
                DatePipe,
                DecimalPipe,
                JsonPipe,
                LowerCasePipe,
                PercentPipe,
                SlicePipe,
                TitleCasePipe,
                UpperCasePipe,
            ]);
        });

        it("logs an error when pipeName can not be resolved", () => {
            AnotherPipe.pipeName = null;
            spyOn(logHandler, "error");

            let translatorConfig = new TranslatorConfig(logHandler, {
                pipes: [ AnotherPipe ],
            });

            expect(translatorConfig.pipes).toEqual({
                currency: CurrencyPipe,
                date: DatePipe,
                number: DecimalPipe,
                json: JsonPipe,
                lowercase: LowerCasePipe,
                percent: PercentPipe,
                slice: SlicePipe,
                titlecase: TitleCasePipe,
                uppercase: UpperCasePipe,
            });
            expect(logHandler.error).toHaveBeenCalledWith("Pipe name for AnotherPipe can not be resolved");
        });
    });
});
