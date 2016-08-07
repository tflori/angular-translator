import {
    TranslateLoaderJson,
    TranslateLoaderJsonConfig,
} from "../angular2-translator";

import {JasmineHelper}                                                        from "./helper/JasmineHelper";
import {PromiseMatcher}                                                       from "./helper/promise-matcher";
import {NoProviderError, ReflectiveInjector, ReflectiveKey}                   from "@angular/core";
import {HTTP_PROVIDERS, RequestMethod, Response, ResponseOptions, XHRBackend} from "@angular/http";
import {MockBackend, MockConnection}                                          from "@angular/http/testing";

describe("TranslateLoaderJsonConfig", function () {
    it("is defined", function () {
        let config = new TranslateLoaderJsonConfig();

        expect(TranslateLoaderJsonConfig).toBeDefined();
        expect(config).toBeDefined();
        expect(config instanceof TranslateLoaderJsonConfig).toBeTruthy();
    });

    it("defines default path and extension", function () {
        let config = new TranslateLoaderJsonConfig();

        expect(config.path).toBe("i18n/");
        expect(config.extension).toBe(".json");
    });

    it("overrides defaults by constructor", function () {
        let config = new TranslateLoaderJsonConfig("localization", "-lang.json");

        expect(config.path).toBe("localization/");
        expect(config.extension).toBe("-lang.json");
    });
});

describe("TranslateLoaderJson", function () {
    it("is defined", function () {
        expect(TranslateLoaderJson).toBeDefined();
    });

    describe("constructor", function () {
        it("requires a TranslateLoaderJsonConfig", function () {
            let injector = ReflectiveInjector.resolveAndCreate([
                HTTP_PROVIDERS,
                TranslateLoaderJson,
            ]);

            let action = function () {
                injector.get(TranslateLoaderJson);
            };

            let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateLoaderJsonConfig));
            providerError.addKey(injector, ReflectiveKey.get(TranslateLoaderJson));
            expect(action).toThrow(providerError);
        });
    });

    describe("load", function () {
        let loader: TranslateLoaderJson;
        let backend: MockBackend;
        let connection: MockConnection;

        beforeEach(function () {
            PromiseMatcher.install();

            let injector: ReflectiveInjector = ReflectiveInjector.resolveAndCreate([
                HTTP_PROVIDERS,
                { provide: XHRBackend, useClass: MockBackend },
                { provide: TranslateLoaderJsonConfig, useValue: new TranslateLoaderJsonConfig() },
                TranslateLoaderJson,
            ]);
            backend               = injector.get(XHRBackend);
            loader                = injector.get(TranslateLoaderJson);
            backend.connections.subscribe((c: MockConnection) => connection = c);
        });

        afterEach(PromiseMatcher.uninstall);

        it("is defined", function () {
            expect(loader.load).toBeDefined();
            expect(typeof loader.load).toBe("function");
        });

        it("returns a promise", function () {
            let promise = loader.load("en");

            expect(promise instanceof Promise).toBeTruthy();
        });

        it("loads a language file", function () {
            spyOn(backend, "createConnection").and.callThrough();

            loader.load("en");

            expect(backend.createConnection).toHaveBeenCalled();
            let request = JasmineHelper.calls(backend.createConnection).mostRecent().args[0];
            expect(request.url).toBe("i18n/en.json");
            expect(request.method).toBe(RequestMethod.Get);
        });

        it("resolves when connection responds", function() {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({ "TEXT": "This is a text" }),
                status: 200,
            })));

            expect(promise).toBeResolved();
        });

        it("transforms result to object", function() {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({ "TEXT": "This is a text" }),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({ "TEXT": "This is a text" });
        });

        it("rejectes when connection fails", function() {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                status: 500,
                statusText: "Internal Server Error",
            })));

            expect(promise).toBeRejected();
        });
    });
});
