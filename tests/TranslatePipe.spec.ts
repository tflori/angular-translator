import {
    TranslateConfig,
    TranslateLogHandler,
    TranslatePipe,
    TranslateService,
    TranslatorModule,
} from "../index";

import {JasmineHelper}                       from "./helper/JasmineHelper";
import {TranslateLoaderMock}                 from "./helper/TranslateLoaderMock";
import {TranslateLogHandlerMock}             from "./helper/TranslatorMocks";
import {ReflectiveInjector}                  from "@angular/core";
import {TestBed, fakeAsync, flushMicrotasks} from "@angular/core/testing";

describe("TranslatePipe", () => {
    it("is defined", () => {
        expect(TranslatePipe).toBeDefined();
    });

    describe("constructor", () => {
        it("requires a TranslateService", () => {
            let injector = ReflectiveInjector.resolveAndCreate([ TranslatePipe ]);

            let action = function () {
                injector.get(TranslatePipe);
            };

            // let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateService));
            // providerError.addKey(injector, ReflectiveKey.get(TranslatePipe));
            expect(action).toThrow();
        });
    });

    describe("transform", () => {
        let translate: TranslateService;
        let translatePipe: TranslatePipe;
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
            translatePipe = new TranslatePipe(translate);
            logHandler = TestBed.get(TranslateLogHandler);

            spyOn(translate, "translate").and.returnValue(Promise.resolve("This is a text"));
            spyOn(logHandler, "error");
        });

        it("returns an empty string", () => {
            let translation = translatePipe.transform("TEXT");

            expect(translation).toBe("");
        });

        it("calls translate to get translation", () => {
            translatePipe.transform("TEXT");

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("calls translate only once", () => {
            translatePipe.transform("TEXT");
            translatePipe.transform("TEXT");

            expect(JasmineHelper.calls(translate.translate).count()).toBe(1);
        });

        it("gets params from args[0]", () => {
            translatePipe.transform("TEXT", [{ some: "value" }]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("evaluates args[0] to get object", () => {
            translatePipe.transform("TEXT", ["{some:'value'}"]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
        });

        it("calls with empty object if args[0] got not evaluated to object", () => {
            translatePipe.transform("TEXT", ["'value'"]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
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

            expect(translate.translate).toHaveBeenCalledWith("ANYTHING", {});
            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it("calls translate again when params changes", () => {
            translatePipe.transform("TEXT", [{ some: "value" }]);
            translatePipe.transform("TEXT", [{ some: "otherValue" }]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "value" });
            expect(translate.translate).toHaveBeenCalledWith("TEXT", { some: "otherValue" });
            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it("calls translate again when language got changed", () => {
            translatePipe.transform("TEXT");

            translate.lang = "de";

            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it("shows error if params could not be parsed", () => {
            translatePipe.transform("TEXT", ["{baefa}"]);

            expect(logHandler.error).toHaveBeenCalledWith("'{baefa}' could not be parsed to object");
        });

        it("ignores params that are not object or string", () => {
            translatePipe.transform("TEXT", [42]);

            expect(translate.translate).toHaveBeenCalledWith("TEXT", {});
        });

        it("does not translate when no values given", () => {
            translate.lang = "de";

            expect(translate.translate).not.toHaveBeenCalled();
        });
    });
});
