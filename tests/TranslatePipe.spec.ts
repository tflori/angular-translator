import {
    TRANSLATE_PROVIDERS,
    TranslateConfig,
    TranslateLoader,
    TranslateLogHandler,
    TranslatePipe,
    TranslateService,
} from "../index";

import {JasmineHelper}                  from "./helper/JasmineHelper";
import {TranslateLoaderMock}            from "./helper/TranslateLoaderMock";
import {ReflectiveInjector}             from "@angular/core";
import {fakeAsync, flushMicrotasks}     from "@angular/core/testing";

describe("TranslatePipe", function() {
    it("is defined", function () {
        expect(TranslatePipe).toBeDefined();
    });

    describe("constructor", function() {
        it("requires a TranslateService", function () {
            let injector = ReflectiveInjector.resolveAndCreate([ TranslatePipe ]);

            let action = function () {
                injector.get(TranslatePipe);
            };

            // let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateService));
            // providerError.addKey(injector, ReflectiveKey.get(TranslatePipe));
            expect(action).toThrow();
        });
    });

    describe("transform", function() {
        let translate: TranslateService;
        let translatePipe: TranslatePipe;
        let logHandler: TranslateLogHandler;

        beforeEach(function() {
            let injector = ReflectiveInjector.resolveAndCreate([
                TRANSLATE_PROVIDERS,
                { provide: TranslateLoader, useValue: new TranslateLoaderMock() },
                { provide: TranslateConfig, useValue: new TranslateConfig( {
                    providedLangs: [ "en", "de" ],
                } ) },
                { provide: TranslateLogHandler, useValue: new TranslateLogHandler() },
            ]);

            translate = injector.get(TranslateService);
            translatePipe = new TranslatePipe(translate);
            logHandler = injector.get(TranslateLogHandler);

            spyOn(translate, "translate").and.returnValue(Promise.resolve("This is a text"));
            spyOn(logHandler, "error");
        });

        it("returns an empty string", function() {
            let translation = translatePipe.transform("TEXT");

            expect(translation).toBe("");
        });

        it("calls translate to get translation", function() {
            translatePipe.transform("TEXT");

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("calls translate only once", function() {
            translatePipe.transform("TEXT");
            translatePipe.transform("TEXT");

            expect(JasmineHelper.calls(translate.translate).count()).toBe(1);
        });

        it("gets params from args[0]", function() {
            translatePipe.transform("TEXT", [{ some: "value" }]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("evaluates args[0] to get object", function() {
            translatePipe.transform("TEXT", ["{some:'value'}"]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("calls with empty object if args[0] got not evaluated to object", function() {
            translatePipe.transform("TEXT", ["'value'"]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("returns translation when promise got resolved", fakeAsync(function() {
            translatePipe.transform("TEXT");

            flushMicrotasks();
            let translation = translatePipe.transform("TEXT");

            expect(translation).toBe("This is a text");
        }));

        it("calls translate again when key changes", function() {
            translatePipe.transform("ANYTHING");
            translatePipe.transform("TEXT");

            expect(translate.translate).toHaveBeenCalledWith("ANYTHING", {});
            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it("calls translate again when params changes", function() {
            translatePipe.transform("TEXT", [{ some: "value" }]);
            translatePipe.transform("TEXT", [{ some: "otherValue" }]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "otherValue" });
            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it("calls translate again when language got changed", function() {
            translatePipe.transform("TEXT");

            translate.lang = "de";

            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it("shows error if params could not be parsed", function() {
            translatePipe.transform("TEXT", ["{baefa}"]);

            expect(logHandler.error).toHaveBeenCalledWith("'{baefa}' could not be parsed to object");
        });
    });
});
