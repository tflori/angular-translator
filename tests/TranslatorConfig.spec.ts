import {TranslatorConfig} from "../index";

describe("TranslatorConfig", () => {
    it("is defined", () => {
        let translatorConfig = new TranslatorConfig();

        expect(TranslatorConfig).toBeDefined();
        expect(translatorConfig).toBeDefined();
        expect(translatorConfig instanceof TranslatorConfig).toBeTruthy();
    });

    it("gets default language from parameter defaultLanguage", () => {
        let translatorConfig = new TranslatorConfig({
            defaultLanguage: "cn",
            providedLanguages: [ "en", "cn" ],
        });

        expect(translatorConfig.defaultLanguage).toBe("cn");
    });

    it("defines a list of provided languages", () => {
        let translatorConfig = new TranslatorConfig();

        expect(translatorConfig.providedLanguages).toEqual(["en"]);
    });

    it("gets provided languages from parameter providedLanguages", () => {
        let translatorConfig = new TranslatorConfig({ providedLanguages: [ "cn" ] });

        expect(translatorConfig.providedLanguages).toEqual([ "cn" ]);
    });

    it("uses first provided language", () => {
        let translatorConfig = new TranslatorConfig({
            defaultLanguage: "en", // default - unnecessary
            providedLanguages: [ "cn" ],
        });

        expect(translatorConfig.defaultLanguage).toBe("cn");
    });

    describe("languageProvided", () => {
        let translatorConfig: TranslatorConfig;

        it("returns the language if provided", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "bm", "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("bm");

            expect(providedLanguage).toBe("bm");
        });

        it("returns false when it is not provided", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("bm");

            expect(providedLanguage).toBeFalsy();
        });

        it("returns provided language when we search with country", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("en-US");

            expect(providedLanguage).toBe("en");
        });

        it("returns the first provided country specific language", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "de-DE", "de-AT" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("de-CH");

            expect(providedLanguage).toBe("de-DE");
        });

        it("normalizes provided languages for checks", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "DE", "DE_AT" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("de-AT");

            expect(providedLanguage).toBe("DE_AT");
        });

        it("normalizes searched language", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "de-DE", "de-AT" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("DE/de");

            expect(providedLanguage).toBe("de-DE");
        });

        it("only finds direct matches", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "de-DE" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("de", true);

            expect(providedLanguage).toBeFalsy();
        });

        it("only takes valid matches", () => {
            translatorConfig = new TranslatorConfig({
                providedLanguages: [ "br", "en" ],
            });

            let providedLanguage = translatorConfig.providedLanguage("british");

            expect(providedLanguage).toBeFalsy();
        });
    });

    describe("module", () => {
        let main: TranslatorConfig = new TranslatorConfig({
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
});
