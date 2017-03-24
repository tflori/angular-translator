import {TranslateConfig} from "../index";

describe("TranslateConfig", () => {
    it("is defined", () => {
        let translateConfig = new TranslateConfig({});

        expect(TranslateConfig).toBeDefined();
        expect(translateConfig).toBeDefined();
        expect(translateConfig instanceof TranslateConfig).toBeTruthy();
    });

    it("gets default language from parameter defaultLang", () => {
        let translateConfig = new TranslateConfig({
            defaultLang: "cn",
            providedLangs: [ "en", "cn" ],
        });

        expect(translateConfig.defaultLang).toBe("cn");
    });

    it("defines a list of provided languages", () => {
        let translateConfig = new TranslateConfig({});

        expect(translateConfig.providedLangs).toEqual(["en"]);
    });

    it("gets provided languages from parameter providedLangs", () => {
        let translateConfig = new TranslateConfig({ providedLangs: [ "cn" ] });

        expect(translateConfig.providedLangs).toEqual([ "cn" ]);
    });

    it("uses first provided language", () => {
        let translateConfig = new TranslateConfig({
            defaultLang: "en", // default - unnecessary
            providedLangs: [ "cn" ],
        });

        expect(translateConfig.defaultLang).toBe("cn");
    });

    describe("navigatorLanguages", () => {
        it("is always an array", () => {
            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages instanceof Array).toBe(true);
        });

        it("uses navigator.languages when given", () => {
            TranslateConfig.navigator = { languages: [ "bm", "de", "fr", "en" ] };

            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages).toEqual([ "bm", "de", "fr", "en" ]);
        });

        it("transforms navigator.languages to Array if it is String", () => {
            TranslateConfig.navigator = { languages: "bm" };

            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages).toEqual([ "bm" ]);
        });

        it("falls back to navigator.language", () => {
            TranslateConfig.navigator = {language: "fr"};

            let translateConfig = new TranslateConfig({});

            expect(translateConfig.navigatorLanguages).toEqual(["fr"]);
        });
    });

    describe("langProvided", () => {
        let translateConfig: TranslateConfig;

        beforeEach(() => {
            translateConfig = new TranslateConfig({});
        });

        it("returns the language if provided", () => {
            translateConfig.providedLangs = ["bm", "en"];

            let providedLang = translateConfig.langProvided("bm");

            expect(providedLang).toBe("bm");
        });

        it("returns false when it is not provided", () => {
            translateConfig.providedLangs = ["en"];

            let providedLang = translateConfig.langProvided("bm");

            expect(providedLang).toBeFalsy();
        });

        it("returns provided language when we search with country", () => {
            translateConfig.providedLangs = ["en"];

            let providedLang = translateConfig.langProvided("en-US");

            expect(providedLang).toBe("en");
        });

        it("returns the first provided country specific language", () => {
            translateConfig.providedLangs = ["de-DE", "de-AT"];

            let providedLang = translateConfig.langProvided("de-CH");

            expect(providedLang).toBe("de-DE");
        });

        it("normalizes provided languages for checks", () => {
            translateConfig.providedLangs = [ "DE", "DE_AT" ];

            let providedLang = translateConfig.langProvided("de-AT");

            expect(providedLang).toBe("DE_AT");
        });

        it("normalizes searched language", () => {
            translateConfig.providedLangs = [ "de-DE", "de-AT" ];

            let providedLang = translateConfig.langProvided("DE/de");

            expect(providedLang).toBe("de-DE");
        });

        it("only finds direct matches", () => {
            translateConfig.providedLangs = ["de-DE"];

            let providedLang = translateConfig.langProvided("de", true);

            expect(providedLang).toBeFalsy();
        });

        it("only takes valid matches", () => {
            translateConfig.providedLangs = [ "br", "en" ];

            let providedLang = translateConfig.langProvided("british");

            expect(providedLang).toBeFalsy();
        });
    });
});
