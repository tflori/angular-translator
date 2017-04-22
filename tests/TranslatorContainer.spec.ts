import {
    TranslateLogHandler,
    Translator,
    TranslatorConfig,
    TranslatorContainer,
} from "../index";

import {ReflectiveInjector} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {Observable} from "rxjs/Observable";
import {TranslateLogHandlerMock, TranslationLoaderMock} from "./helper/TranslatorMocks";

describe("TranslatorContainer", () => {
    it("is defined", () => {
        expect(TranslatorContainer).toBeDefined();
    });

    it("requires a TranslatorConfig", () => {
        let injector = ReflectiveInjector.resolveAndCreate([
            { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
            TranslatorContainer,
        ]);

        let action = () => {
            try {
                injector.get(TranslatorContainer);
            } catch (e) {
                expect(e.message).toBe(
                    "No provider for TranslatorConfig! (TranslatorContainer -> TranslatorConfig)",
                );
                throw e;
            }
        };
        expect(action).toThrow();
    });

    it("requires a TranslateLogHandler", () => {
        let translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
            loader: TranslationLoaderMock,
        });
        let injector = ReflectiveInjector.resolveAndCreate([
            { provide: TranslatorConfig, useValue: translatorConfig },
            TranslatorContainer,
        ]);

        let action = () => {
            try {
                injector.get(TranslatorContainer);
            } catch (e) {
                expect(e.message).toBe(
                    "No provider for TranslateLogHandler! (TranslatorContainer -> TranslateLogHandler)",
                );
                throw e;
            }
        };
        expect(action).toThrow();
    });

    describe("constructor", () => {
        let translatorConfig: TranslatorConfig;
        let translatorContainer: TranslatorContainer;

        beforeEach(() => {
            translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
            });
            TestBed.configureTestingModule({
                providers: [
                    { provide: TranslatorConfig, useValue: translatorConfig},
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    TranslatorContainer,
                ],
            });
        });

        it("sets current lang to default lang", () => {
            translatorConfig.setOptions({
                detectLanguage: false,
                defaultLanguage: "ru",
                providedLanguages: [ "ru", "en" ],
            });

            translatorContainer = TestBed.get(TranslatorContainer);

            expect(translatorContainer.language).toBe("ru");
        });

        it("creates an observable for language changes", () => {
            translatorContainer = TestBed.get(TranslatorContainer);

            expect(translatorContainer.languageChanged).toEqual(jasmine.any(Observable));
        });

        describe("detectLanguage", () => {
            it("detects language automatically on start", () => {
                translatorConfig.setOptions({
                    providedLanguages: [ "en", "de" ],
                    navigatorLanguages: [ "de-DE", "de", "en-US", "en" ],
                });

                translatorContainer = TestBed.get(TranslatorContainer);

                expect(translatorContainer.language).toBe("de");
            });

            it("preferred language over exact matches", () => {
                translatorConfig.setOptions({
                    providedLanguages: ["de", "fr", "en-US", "en-GB"],
                    navigatorLanguages: ["fr-ML", "en-US"],
                    preferExactMatches: false,
                });

                translatorContainer = TestBed.get(TranslatorContainer);

                expect(translatorContainer.language).toBe("fr");
            });

            it("prefers exact matches", () => {
                translatorConfig.setOptions({
                    providedLanguages: ["de", "fr", "en-US", "en-GB"],
                    navigatorLanguages: ["fr-ML", "en-US"],
                    preferExactMatches: true,
                });

                translatorContainer = TestBed.get(TranslatorContainer);

                expect(translatorContainer.language).toBe("en-US");
            });

            it("informs about detected language", () => {
                translatorConfig.setOptions({
                    providedLanguages: [ "en", "de" ],
                    navigatorLanguages: [ "de-DE", "de", "en-US", "en" ],
                });
                let logHandler = TestBed.get(TranslateLogHandler);
                spyOn(logHandler, "info");

                translatorContainer = TestBed.get(TranslatorContainer);

                expect(logHandler.info).toHaveBeenCalledWith("Language de got detected");
            });
        });
    });

    describe("instance", () => {
        let translatorContainer: TranslatorContainer;
        let translatorConfig: TranslatorConfig;

        beforeEach(() => {
            translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
                detectLanguage: false,
            });

            TestBed.configureTestingModule({
                providers: [
                    { provide: TranslatorConfig, useValue: translatorConfig},
                    { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    TranslatorContainer,
                ],
            });

            translatorContainer = TestBed.get(TranslatorContainer);
        });

        describe("change language", () => {
            it("checks that language is provided using strict checking", () => {
                spyOn(translatorConfig, "providedLanguage").and.callThrough();

                translatorContainer.language = "en" ;

                expect(translatorConfig.providedLanguage).toHaveBeenCalledWith("en", true);
            });

            it("sets current language to the provided language", () => {
                translatorConfig.setOptions({ providedLanguages: [ "de/de" ]});

                translatorContainer.language = "de-DE";

                expect(translatorContainer.language).toBe("de/de");
            });

            it("throws error if language is not provided", () => {
                translatorConfig.setOptions({ providedLanguages: [ "de/de" ]});

                let action = () => {
                    translatorContainer.language = "de";
                };

                expect(action).toThrow(new Error("Language de not provided"));
            });

            it("does not change when language not available", () => {
                try {
                    translatorContainer.language = "ru";
                } catch (e) {}

                expect(translatorContainer.language).toBe("en");
            });

            it("gives the next value to the observable", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"]});
                let spy = jasmine.createSpy("languageChanged");
                translatorContainer.languageChanged.subscribe(spy);

                translatorContainer.language = "de";

                expect(spy).toHaveBeenCalledWith("de");
            });

            it("informs not about language change", () => {
                let translateLogHandler = TestBed.get(TranslateLogHandler);
                spyOn(translateLogHandler, "info");
                translatorConfig.setOptions({ providedLanguages: [ "de/de" ]});

                translatorContainer.language = "de-DE";

                expect(translateLogHandler.info).not.toHaveBeenCalled();
            });

            it("hits all subscribers when language change", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"]});
                let spy1 = jasmine.createSpy("languageChanged");
                let spy2 = jasmine.createSpy("languageChanged");
                translatorContainer.languageChanged.subscribe(spy1);
                translatorContainer.languageChanged.subscribe(spy2);

                translatorContainer.language = "de";

                expect(spy1).toHaveBeenCalledWith("de");
                expect(spy2).toHaveBeenCalledWith("de");
            });
        });

        describe("get translator", () => {
            it("returns a translator", () => {
                let translator: Translator = translatorContainer.getTranslator("test");

                expect(translator).toEqual(jasmine.any(Translator));
            });

            it("returns a translator for given module", () => {
                let translator: Translator = translatorContainer.getTranslator("test");

                expect(translator.module).toBe("test");
            });

            it("returns previously created translators", () => {
                let translator: Translator = translatorContainer.getTranslator("test");

                let result: Translator = translatorContainer.getTranslator("test");

                expect(result).toBe(translator);
            });
        });
    });
});
