import {
    provideTranslator,
    TranslateComponent,
    TranslateLogHandler,
    Translator,
    TranslatorConfig,
    TranslatorContainer,
    TranslatorModule,
} from "../index";

import {Component, ReflectiveInjector} from "@angular/core";
import {fakeAsync, flushMicrotasks, TestBed} from "@angular/core/testing";
import {JasmineHelper} from "./helper/JasmineHelper";
import {TranslateLogHandlerMock, TranslationLoaderMock} from "./helper/TranslatorMocks";

describe("TranslateComponent", () => {

    describe("constructor", () => {
        it("requires a Translator", () => {
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
            let translatorConfig: TranslatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateComponent,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                provideTranslator("test"),
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
            let translatorConfig: TranslatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
            });
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateComponent,
                TranslatorContainer,
                { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                { provide: TranslatorConfig, useValue: translatorConfig },
                { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                provideTranslator("test"),
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
                    TranslateComponent,
                ],
            });

            translator = TestBed.get(Translator);
            translateComponent = TestBed.get(TranslateComponent);
            logHandler = TestBed.get(TranslateLogHandler);
            translateContainer = TestBed.get(TranslatorContainer);

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

        describe("translatorModule attribute", () => {
            let anotherTranslator: Translator;

            beforeEach(() => {
                anotherTranslator = translateContainer.getTranslator("another");

                spyOn(anotherTranslator, "translate").and.returnValue(Promise.resolve("This is a text"));
            });

            it("uses another module with translatorModule", () => {
                spyOn(translateContainer, "getTranslator").and.callThrough();

                translateComponent.module = "another";

                expect(translateContainer.getTranslator).toHaveBeenCalledWith("another");
            });

            it("subscribes to the other language changed", () => {
                spyOn(anotherTranslator.languageChanged, "subscribe").and.callThrough();

                translateComponent.module = "another";

                expect(anotherTranslator.languageChanged.subscribe).toHaveBeenCalled();
            });

            it("starts the translation after module is changed", () => {
                translateComponent.key = "TEXT";

                translateComponent.module = "another";

                expect(anotherTranslator.translate).toHaveBeenCalledWith("TEXT", {});
            });

            it("does not react on language changes of original translator", () => {
                translateComponent.key = "TEXT";
                translateComponent.module = "another";

                translator.language = "de";

                expect(JasmineHelper.calls(anotherTranslator.translate).count()).toBe(1);
            });

            it("restarts translation on language changes", () => {
                translateComponent.key = "TEXT";
                translateComponent.module = "another";
                JasmineHelper.calls(anotherTranslator.translate).reset();

                anotherTranslator.language = "de";

                expect(anotherTranslator.translate).toHaveBeenCalledWith("TEXT", {});
            });
        });
    });

    describe("within module", () => {
        let translator: Translator;

        @Component({
            selector: "my-component",
            template: `<p translate="TEXT" [translateParams]="{ some: 'value' }"></p>`,
        })
        class MyComponent {}

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [ TranslatorModule.forRoot() ],
                declarations: [ MyComponent ],
            });

            translator = TestBed.get(Translator);
            spyOn(translator, "translate").and.returnValue(Promise.resolve("some text"));
        });

        it("first resolves the parameters", () => {
            let component = TestBed.createComponent(MyComponent);

            component.detectChanges();

            expect(translator.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
            expect(JasmineHelper.calls(translator.translate).count()).toBe(1);
        });
    });
});
