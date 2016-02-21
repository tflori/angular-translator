import {Injector, NoProviderError, Key, provide} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";
import {TranslateLoaderJsonConfig, TranslateLoaderJson} from "../src/TranslateLoaderJson";

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
        describe('constructor', function () {
            it('requires a config', function () {
                var injector      = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TranslateLoaderJson
                ]);
                var providerError = new NoProviderError(injector, Key.get(TranslateLoaderJsonConfig));
                providerError.addKey(injector, Key.get(TranslateLoaderJson));

                expect(function () {
                    injector.get(TranslateLoaderJson);
                }).toThrow(providerError);
            });
        });

        describe('load', function () {
            var loader:TranslateLoaderJson;

            beforeEach(function () {
                var injector:Injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    provide(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig()}),
                    TranslateLoaderJson
                ]);

                loader = injector.get(TranslateLoaderJson);
            });

            it('is defined', function () {
                expect(loader.load).toBeDefined();
                expect(typeof loader.load).toBe('function');
            });

            it('returns a promise', function () {
                var promise = loader.load('en');

                expect(promise instanceof Promise).toBeTruthy();
            });
        })
    });
}