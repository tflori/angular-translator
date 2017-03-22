import {
    TranslateComponent,
    TranslateConfig,
    TranslateLogHandler,
    TranslateService,
    TranslatorModule,
} from "../index";

import {JasmineHelper}                       from "./helper/JasmineHelper";
import {TranslateLoaderMock}                 from "./helper/TranslateLoaderMock";
import {TranslateLogHandlerMock}             from "./helper/TranslatorMocks";
import {ReflectiveInjector}                  from "@angular/core";
import {TestBed, fakeAsync, flushMicrotasks} from "@angular/core/testing";

describe("TranslateComponent", () => {

    describe("constructor", () => {
        it("requires a TranslateService", function () {
            let injector = ReflectiveInjector.resolveAndCreate([ TranslateComponent ]);

            let action = function () {
                injector.get(TranslateComponent);
            };

            // let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateService));
            // providerError.addKey(injector, ReflectiveKey.get(TranslateComponent));
            expect(action).toThrow();
        });
    });

    describe("instance", () => {
        let translate: TranslateService;
        let translateComponent: TranslateComponent;
        let logHandler: TranslateLogHandler;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [TranslatorModule],
                providers: [
                    TranslateLoaderMock,
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    { provide: TranslateConfig, useValue: new TranslateConfig( {
                        loader: TranslateLoaderMock,
                        providedLangs: [ "en", "de" ],
                    } ) },
                ],
            });

            translate = TestBed.get(TranslateService);
            translateComponent = new TranslateComponent(translate);
            logHandler = TestBed.get(TranslateLogHandler);

            spyOn(translate, "translate").and.returnValue(Promise.resolve("This is a text"));
            spyOn(logHandler, "error");
        });

        it("starts translation when key got set", () => {
            translateComponent.key = "TEXT";

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("starts translation when key is set and params got changed", () => {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translate.translate).reset();

            translateComponent.params = { some: "value" };

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("restarts translation when key got changed", () => {
            translateComponent.key = "ANYTHING";
            translateComponent.params = { some: "value" };
            JasmineHelper.calls(translate.translate).reset();

            translateComponent.key = "TEXT";

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("does not translate when key got not set", () => {
            translateComponent.params = { some: "value" };

            expect(translate.translate).not.toHaveBeenCalled();
        });

        it("does not accept non-object params", () => {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translate.translate).reset();

            translateComponent.params = "foo";

            expect(translate.translate).not.toHaveBeenCalled();
        });

        it("stores translation when promise got resolved", fakeAsync(() => {
            translateComponent.key = "TEXT";

            flushMicrotasks();

            expect(translateComponent.translation).toBe("This is a text");
        }));

        it("restarts translation when language got changed", () => {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translate.translate).reset();

            translate.lang = "de";

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("shows error if params are not object", () => {
            translateComponent.params = "foo";

            expect(logHandler.error).toHaveBeenCalledWith("Params have to be an object");
        });
    });
});
