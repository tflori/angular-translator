import {
    TRANSLATE_PROVIDERS,
    TranslateComponent,
    TranslateConfig,
    TranslateLoader,
    TranslateLogHandler,
    TranslateService,
} from "../angular2-translator";

import {JasmineHelper}                                      from "./helper/JasmineHelper";
import {TranslateLoaderMock}                                from "./helper/TranslateLoaderMock";
import {JasminePromise, PromiseMatcher}                     from "./helper/promise-matcher";
import {NoProviderError, ReflectiveInjector, ReflectiveKey} from "@angular/core";
import {fakeAsync}                                          from "@angular/core/testing";

describe("TranslateComponent", function() {
    beforeEach(function() {
        TranslateLogHandler.error = () => {};
    });

    describe("constructor", function() {
        it("requires a TranslateService", function () {
            let injector = ReflectiveInjector.resolveAndCreate([ TranslateComponent ]);

            let action = function () {
                injector.get(TranslateComponent);
            };

            let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateService));
            providerError.addKey(injector, ReflectiveKey.get(TranslateComponent));
            expect(action).toThrow(providerError);
        });
    });

    describe("instance", function() {
        let translate: TranslateService;
        let translateComponent: TranslateComponent;

        beforeEach(function() {
            PromiseMatcher.install();
            let injector = ReflectiveInjector.resolveAndCreate([
                TRANSLATE_PROVIDERS,
                { provide: TranslateLoader, useValue: new TranslateLoaderMock() },
                { provide: TranslateConfig, useValue: new TranslateConfig( {
                    providedLangs: [ "en", "de" ],
                } ) },
            ]);

            translate = injector.get(TranslateService);
            translateComponent = new TranslateComponent(translate);
            spyOn(translate, "translate").and.returnValue(Promise.resolve("This is a text"));
        });

        afterEach(PromiseMatcher.uninstall);

        it("starts translation when key got set", function() {
            translateComponent.key = "TEXT";

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("starts translation when key is set and params got changed", function() {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translate.translate).reset();

            translateComponent.params = { some: "value" };

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("restarts translation when key got changed", function() {
            translateComponent.key = "ANYTHING";
            translateComponent.params = { some: "value" };
            JasmineHelper.calls(translate.translate).reset();

            translateComponent.key = "TEXT";

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("does not translate when key got not set", function() {
            translateComponent.params = { some: "value" };

            expect(translate.translate).not.toHaveBeenCalled();
        });

        it("does not accept non-object params", function() {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translate.translate).reset();

            translateComponent.params = "foo";

            expect(translate.translate).not.toHaveBeenCalled();
        });

        it("stores translation when promise got resolved", fakeAsync(function() {
            translateComponent.key = "TEXT";

            JasminePromise.flush();

            expect(translateComponent.translation).toBe("This is a text");
        }));

        it("restarts translation when language got changed", function() {
            translateComponent.key = "TEXT";
            JasmineHelper.calls(translate.translate).reset();

            translate.lang = "de";

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("shows error if params are not object", function() {
            spyOn(TranslateLogHandler, "error");

            translateComponent.params = "foo";

            expect(TranslateLogHandler.error).toHaveBeenCalledWith("Params have to be an object");
        });
    });
});
