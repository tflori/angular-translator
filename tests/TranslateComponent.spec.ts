import {
    TranslateComponent,
    TranslateLogHandler,
    Translator,
    TranslatorConfig,
    TranslatorContainer,
} from "../index";

import {ReflectiveInjector} from "@angular/core";
import {fakeAsync, flushMicrotasks, TestBed} from "@angular/core/testing";
import {JasmineHelper} from "./helper/JasmineHelper";
import {TranslateLogHandlerMock, TranslationLoaderMock} from "./helper/TranslatorMocks";

describe("TranslateComponent", () => {

    describe("constructor", () => {
        it("requires a Translator", function () {
            let injector = ReflectiveInjector.resolveAndCreate([ TranslateComponent ]);

            let action = () => {
                try {
                    injector.get(TranslateComponent);
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
                TranslateComponent,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                { provide: Translator, useFactory: Translator.factory("test"), deps: [TranslatorContainer]},
            ]);

            let action = () => {
                try {
                    injector.get(TranslateComponent);
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
                TranslateComponent,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                { provide: Translator, useFactory: Translator.factory("test"), deps: [TranslatorContainer]},
            ]);

            let translator: Translator = injector.get(Translator);
            spyOn(translator.languageChanged, "subscribe").and.callThrough();

            injector.get(TranslateComponent);

            expect(translator.languageChanged.subscribe).toHaveBeenCalled();
        });
    });

    describe("instance", () => {
        let translator: Translator;
        let translatorConfig: TranslatorConfig;
        let translateComponent: TranslateComponent;
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
                    TranslateComponent,
                ],
            });

            translator = TestBed.get(Translator);
            translateComponent = TestBed.get(TranslateComponent);
            logHandler = TestBed.get(TranslateLogHandler);

            spyOn(translator, "translate").and.returnValue(Promise.resolve("This is a text"));
            spyOn(logHandler, "error");
        });

        it("starts translation when key got set", () => {
            translateComponent.key = "TEXT";

            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("starts translation when key is set and params got changed", () => {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translator.translate).reset();

            translateComponent.params = { some: "value" };

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("restarts translation when key got changed", () => {
            translateComponent.key = "ANYTHING";
            translateComponent.params = { some: "value" };
            JasmineHelper.calls(translator.translate).reset();

            translateComponent.key = "TEXT";

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("does not translate when key got not set", () => {
            translateComponent.params = { some: "value" };

            expect(translator.translate).not.toHaveBeenCalled();
        });

        it("does not accept non-object params", () => {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translator.translate).reset();

            translateComponent.params = "foo";

            expect(translator.translate).not.toHaveBeenCalled();
        });

        it("stores translation when promise got resolved", fakeAsync(() => {
            translateComponent.key = "TEXT";

            flushMicrotasks();

            expect(translateComponent.translation).toBe("This is a text");
        }));

        it("restarts translation when language got changed", () => {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translator.translate).reset();

            translator.language = "de";

            expect(translator.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("shows error if params are not object", () => {
            translateComponent.params = "foo";

            expect(logHandler.error).toHaveBeenCalledWith("Params have to be an object");
        });
    });
});
