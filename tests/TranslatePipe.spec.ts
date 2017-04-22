import {
    provideTranslator,
    TranslateLogHandler,
    TranslatePipe,
    Translator,
    TranslatorConfig,
    TranslatorContainer,
} from "../index";

import {ReflectiveInjector} from "@angular/core";
import {fakeAsync, flushMicrotasks, TestBed} from "@angular/core/testing";
import {JasmineHelper} from "./helper/JasmineHelper";
import {TranslateLogHandlerMock, TranslationLoaderMock} from "./helper/TranslatorMocks";

describe("TranslatePipe", () => {
    it("is defined", () => {
        expect(TranslatePipe).toBeDefined();
    });

    describe("constructor", () => {
        it("requires a Translator", () => {
            let injector = ReflectiveInjector.resolveAndCreate([ TranslatePipe ]);

            let action = () => {
                try {
                    injector.get(TranslatePipe);
                } catch (e) {
                    expect(e.message).toContain("No provider for Translator!");
                    throw e;
                }
            };
            expect(action).toThrow();
        });

        it("requires a TranslateLogHandler", () => {
            let translatorConfig: TranslatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslatePipe,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                provideTranslator("test"),
            ]);

            let action = () => {
                try {
                    injector.get(TranslatePipe);
                } catch (e) {
                    expect(e.message).toContain("No provider for TranslateLogHandler!");
                    throw e;
                }
            };
            expect(action).toThrow();
        });

        it("subscribes on language changes", () => {
            let translatorConfig: TranslatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslatePipe,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                provideTranslator("test"),
            ]);

            let translator: Translator = injector.get(Translator);
            spyOn(translator.languageChanged, "subscribe").and.callThrough();

            injector.get(TranslatePipe);

            expect(translator.languageChanged.subscribe).toHaveBeenCalled();
        });
    });

    describe("transform", () => {
        let translator: Translator;
        let translatorConfig: TranslatorConfig;
        let translatePipe: TranslatePipe;
        let logHandler: TranslateLogHandler;
        let translateContainer: TranslatorContainer;

        beforeEach(() => {
            translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });

            TestBed.configureTestingModule({
                providers: [
                    { provide: TranslatorConfig, useValue: translatorConfig},
                    { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    provideTranslator("test"),
                    TranslatorContainer,
                    TranslatePipe,
                ],
            });

            translator = TestBed.get(Translator);
            translatePipe = TestBed.get(TranslatePipe);
            logHandler = TestBed.get(TranslateLogHandler);
            translateContainer = TestBed.get(TranslatorContainer);

            spyOn(translator, "translate").and.returnValue(Promise.resolve("This is a text"));
            spyOn(logHandler, "error");
        });

        it("returns an empty string", () => {
            let translation = translatePipe.transform("TEXT");

            expect(translation).toBe("");
        });

        it("calls translate to get translation", () => {
            translatePipe.transform("TEXT");

            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("calls translate only once", () => {
            translatePipe.transform("TEXT");
            translatePipe.transform("TEXT");

            expect(JasmineHelper.calls(translator.translate).count()).toBe(1);
        });

        it("gets params from args[0]", () => {
            translatePipe.transform("TEXT", { some: "value" });

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("returns translation when promise got resolved", fakeAsync(() => {
            translatePipe.transform("TEXT");

            flushMicrotasks();
            let translation = translatePipe.transform("TEXT");

            expect(translation).toBe("This is a text");
        }));

        it("calls translate again when key changes", () => {
            translatePipe.transform("ANYTHING");
            translatePipe.transform("TEXT");

            expect(translator.translate).toHaveBeenCalledWith("ANYTHING", {});
            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
            expect(JasmineHelper.calls(translator.translate).count()).toBe(2);
        });

        it("calls translate again when params changes", () => {
            translatePipe.transform("TEXT", { some: "value" });
            translatePipe.transform("TEXT", { some: "otherValue" });

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "otherValue" });
            expect(JasmineHelper.calls(translator.translate).count()).toBe(2);
        });

        it("calls translate again when language got changed", () => {
            translatePipe.transform("TEXT");

            translator.language = "de";

            expect(JasmineHelper.calls(translator.translate).count()).toBe(2);
        });

        it("does not translate when no values given", () => {
            translator.language = "de";

            expect(translator.translate).not.toHaveBeenCalled();
        });

        it("uses the first item of array if params is an array", () => {
            let params: any = { some: "value" };
            translatePipe.transform("TEXT", [params]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("parses string for backward compatibility", () => {
            let params: any = "{ some: 'value' }";
            translatePipe.transform("TEXT", [params]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("ignores errors while parsing", () => {
            let params: any = "{something}";
            translatePipe.transform("TEXT", [params]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
        });

        describe("translatorModule attribute", () => {
            let anotherTranslator: Translator;

            beforeEach(() => {
                anotherTranslator = translateContainer.getTranslator("another");

                spyOn(anotherTranslator, "translate").and.returnValue(Promise.resolve("This is a text"));
            });

            it("uses another module with translatorModule", () => {
                spyOn(translateContainer, "getTranslator").and.callThrough();

                translatePipe.transform("TEXT", {}, "another");

                expect(translateContainer.getTranslator).toHaveBeenCalledWith("another");
            });

            it("subscribes to the other language changed", () => {
                spyOn(anotherTranslator.languageChanged, "subscribe").and.callThrough();

                translatePipe.transform("TEXT", {}, "another");

                expect(anotherTranslator.languageChanged.subscribe).toHaveBeenCalled();
            });

            it("starts the translation when module got changed", () => {
                translatePipe.transform("TEXT", {});

                translatePipe.transform("TEXT", {}, "another");

                expect(anotherTranslator.translate).toHaveBeenCalledWith("TEXT", {});
            });

            it("does not react on language changes of original translator", () => {
                translatePipe.transform("TEXT", {});
                translatePipe.transform("TEXT", {}, "another");

                translator.language = "de";

                expect(JasmineHelper.calls(anotherTranslator.translate).count()).toBe(1);
            });

            it("restarts translation on language changes", () => {
                translatePipe.transform("TEXT", {}, "another");
                JasmineHelper.calls(anotherTranslator.translate).reset();

                anotherTranslator.language = "de";

                expect(anotherTranslator.translate).toHaveBeenCalledWith("TEXT", {});
            });
        });
    });
});
