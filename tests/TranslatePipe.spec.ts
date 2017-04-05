import {
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
        it("requires a Translator", function () {
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
            let translatorConfig: TranslatorConfig = new TranslatorConfig({
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslatePipe,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                { provide: Translator, useFactory: Translator.factory("test"), deps: [TranslatorContainer]},
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
            let translatorConfig: TranslatorConfig = new TranslatorConfig({
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslatePipe,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                { provide: Translator, useFactory: Translator.factory("test"), deps: [TranslatorContainer]},
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

        beforeEach(() => {
            translatorConfig = new TranslatorConfig({
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });

            TestBed.configureTestingModule({
                providers: [
                    { provide: TranslatorConfig, useValue: translatorConfig},
                    { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    { provide: Translator, useFactory: Translator.factory("test"), deps: [TranslatorContainer]},
                    TranslatorContainer,
                    TranslatePipe,
                ],
            });

            translator = TestBed.get(Translator);
            translatePipe = TestBed.get(TranslatePipe);
            logHandler = TestBed.get(TranslateLogHandler);

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
            translatePipe.transform("TEXT", [{ some: "value" }]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("evaluates args[0] to get object", () => {
            translatePipe.transform("TEXT", ["{some:'value'}"]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("calls with empty object if args[0] got not evaluated to object", () => {
            translatePipe.transform("TEXT", ["'value'"]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
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
            translatePipe.transform("TEXT", [{ some: "value" }]);
            translatePipe.transform("TEXT", [{ some: "otherValue" }]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "otherValue" });
            expect(JasmineHelper.calls(translator.translate).count()).toBe(2);
        });

        it("calls translate again when language got changed", () => {
            translatePipe.transform("TEXT");

            translator.language = "de";

            expect(JasmineHelper.calls(translator.translate).count()).toBe(2);
        });

        it("shows error if params could not be parsed", () => {
            translatePipe.transform("TEXT", ["{baefa}"]);

            expect(logHandler.error).toHaveBeenCalledWith("'{baefa}' could not be parsed to object");
        });

        it("ignores params that are not object or string", () => {
            translatePipe.transform("TEXT", [42]);

            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("does not translate when no values given", () => {
            translator.language = "de";

            expect(translator.translate).not.toHaveBeenCalled();
        });
    });
});
