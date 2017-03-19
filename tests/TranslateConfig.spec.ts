import {TranslateConfig} from "../index";

describe("TranslateConfig", function() {
    it("is defined", function() {
        let translateConfig = new TranslateConfig({});

        expect(TranslateConfig).toBeDefined();
        expect(translateConfig).toBeDefined();
        expect(translateConfig instanceof TranslateConfig).toBeTruthy();
    });

    it("gets default language from parameter defaultLang", function() {
        let translateConfig = new TranslateConfig({
            defaultLang: "cn",
            providedLangs: [ "en", "cn" ],
        });

        expect(translateConfig.defaultLang).toBe("cn");
    });

    it("defines a list of provided languages", function() {
        let translateConfig = new TranslateConfig({});

        expect(translateConfig.providedLangs).toEqual(["en"]);
    });

    it("gets provided languages from parameter providedLangs", function() {
        let translateConfig = new TranslateConfig({ providedLangs: [ "cn" ] });

        expect(translateConfig.providedLangs).toEqual([ "cn" ]);
    });

    it("uses first provided language", function() {
        let translateConfig = new TranslateConfig({
            defaultLang: "en", // default - unnecessary
            providedLangs: [ "cn" ],
        });

        expect(translateConfig.defaultLang).toBe("cn");
    });

    describe("navigatorLanguages", function() {
        it("is always an array", function() {
            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages instanceof Array).toBe(true);
        });

        it("uses navigator.languages when given", function() {
            TranslateConfig.navigator = { languages: [ "bm", "de", "fr", "en" ] };

            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages).toEqual([ "bm", "de", "fr", "en" ]);
        });

        it("transforms navigator.languages to Array if it is String", function() {
            TranslateConfig.navigator = { languages: "bm" };

            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages).toEqual([ "bm" ]);
        });

        it("falls back to navigator.language", function() {
            TranslateConfig.navigator = {language: "fr"};

            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages).toEqual(["fr"]);
        });
    });

    describe("langProvided", function() {
        let translateConfig: TranslateConfig;

        beforeEach(function() {
            translateConfig = new TranslateConfig({});
        });

        it("returns the language if provided", function() {
            translateConfig.providedLangs = ["bm", "en"];

            let providedLang = translateConfig.langProvided("bm");

            expect(providedLang).toBe("bm");
        });

        it("returns false when it is not provided", function() {
            translateConfig.providedLangs = ["en"];

            let providedLang = translateConfig.langProvided("bm");

            expect(providedLang).toBeFalsy();
        });

        it("returns provided language when we search with country", function() {
            translateConfig.providedLangs = ["en"];

            let providedLang = translateConfig.langProvided("en-US");

            expect(providedLang).toBe("en");
        });

        it("returns the first provided country specific language", function() {
            translateConfig.providedLangs = ["de-DE", "de-AT"];

            let providedLang = translateConfig.langProvided("de-CH");

            expect(providedLang).toBe("de-DE");
        });

        it("normalizes provided languages for checks", function() {
            translateConfig.providedLangs = [ "DE", "DE_AT" ];

            let providedLang = translateConfig.langProvided("de-AT");

            expect(providedLang).toBe("DE_AT");
        });

        it("normalizes searched language", function() {
            translateConfig.providedLangs = [ "de-DE", "de-AT" ];

            let providedLang = translateConfig.langProvided("DE/de");

            expect(providedLang).toBe("de-DE");
        });

        it("only finds direct matches", function() {
            translateConfig.providedLangs = ["de-DE"];

            let providedLang = translateConfig.langProvided("de", true);

            expect(providedLang).toBeFalsy();
        });

        it("only takes valid matches", function() {
            translateConfig.providedLangs = [ "br", "en" ];

            let providedLang = translateConfig.langProvided("british");

            expect(providedLang).toBeFalsy();
        });
    });
});
