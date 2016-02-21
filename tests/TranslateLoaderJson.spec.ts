import {Injector, NoProviderError, Key, provide} from "angular2/core";
import {RequestMethod, RequestOptions, Request, ResponseOptions, Response, HTTP_PROVIDERS, Connection, Http} from "angular2/http";
import {MockBackend, MockConnection} from "angular2/http/testing";
import {TranslateLoaderJsonConfig, TranslateLoaderJson} from "../src/TranslateLoaderJson";
import {XHRBackend} from "angular2/http";

export function main() {
    describe('TranslateLoaderJsonConfig', function () {
        it('is defined', function () {
            var config = new TranslateLoaderJsonConfig();

            expect(TranslateLoaderJsonConfig).toBeDefined();
            expect(config).toBeDefined();
            expect(config instanceof TranslateLoaderJsonConfig).toBeTruthy();
        });

        it('defines default path and extension', function () {
            var config = new TranslateLoaderJsonConfig();

            expect(config.path).toBe('i18n/');
            expect(config.extension).toBe('.json');
        });

        it('overrides defaults by constructor', function () {
            var config = new TranslateLoaderJsonConfig('localization', '-lang.json');

            expect(config.path).toBe('localization/');
            expect(config.extension).toBe('-lang.json');
        });
    });

    describe('TranslateLoaderJson', function () {
        it('is defined', function () {
            expect(TranslateLoaderJson).toBeDefined();
        });

        describe('constructor', function () {
            it('requires a config', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TranslateLoaderJson
                ]);

                var action = function () {
                    injector.get(TranslateLoaderJson);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateLoaderJsonConfig));
                providerError.addKey(injector, Key.get(TranslateLoaderJson));
                expect(action).toThrow(providerError);
            });
        });

        describe('load', function () {
            var loader:TranslateLoaderJson;
            var backend:MockBackend;
            var connection:MockConnection;

            beforeEach(function () {
                var injector:Injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    provide(XHRBackend, {useClass: MockBackend}),
                    provide(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig()}),
                    TranslateLoaderJson
                ]);
                backend               = injector.get(XHRBackend);
                loader                = injector.get(TranslateLoaderJson);
                backend.connections.subscribe((c:MockConnection) => connection = c);
            });

            it('is defined', function () {
                expect(loader.load).toBeDefined();
                expect(typeof loader.load).toBe('function');
            });

            it('returns a promise', function () {
                var promise = loader.load('en');

                expect(promise instanceof Promise).toBeTruthy();
            });

            it('loads a language file', function () {
                spyOn(backend, 'createConnection').and.callThrough();

                loader.load('en');

                expect(backend.createConnection).toHaveBeenCalled();
                var request = backend.createConnection["calls"].mostRecent().args[0]; // requires implicitAny :(
                expect(request.url).toBe('i18n/en.json');
                expect(request.method).toBe(RequestMethod.Get);
            });
        })
    });
}