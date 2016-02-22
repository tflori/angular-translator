import {provide, NoProviderError, Key, Injector} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";
import {TranslateService} from '../src/TranslateService';
import {TranslateConfig} from "../src/TranslateConfig";
import {TranslateLoader} from "../src/TranslateLoader";
import {TRANSLATE_PROVIDERS} from "../angular2-translator";

export function main() {
    describe('TranslateService', function () {
        it('is defined', function () {
            expect(TranslateService).toBeDefined();
        });

        describe('constructor', function () {
            it('requires a TranslateConfig', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TranslateService
                ]);

                var action = function () {
                    injector.get(TranslateService);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateConfig));
                providerError.addKey(injector, Key.get(TranslateService));
                expect(action).toThrow(providerError);
            });

            it('requires a TranslateLoader', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TranslateService,
                    provide(TranslateConfig, {useValue: new TranslateConfig()})
                ]);

                var action = function () {
                    injector.get(TranslateService);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateLoader));
                providerError.addKey(injector, Key.get(TranslateService));
                expect(action).toThrow(providerError);
            });

            it('predfines providers for default config', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TRANSLATE_PROVIDERS
                ]);
                var translate:TranslateService;

                var action = function () {
                    translate = injector.get(TranslateService);
                };

                expect(action).not.toThrow();
                expect(translate instanceof TranslateService).toBeTruthy();
            });
        });

        describe('instance', function () {
            var translate:TranslateService;

            beforeEach(function () {
                var injector:Injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    provide(TranslateConfig, {useValue: new TranslateConfig()}),
                    TranslateService
                ]);
                translate = injector.get(TranslateService);
            });
        });
    });
}