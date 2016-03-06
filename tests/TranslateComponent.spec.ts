import {Injector, Key, NoProviderError, provide} from "angular2/core";
import {JasmineHelper} from "./helper/JasmineHelper";
import {PromiseMatcher} from "./helper/promise-matcher";
import {TranslateLoaderMock} from "./helper/TranslateLoaderMock";
import {TRANSLATE_PROVIDERS} from "../angular2-translator";
import {TranslateComponent} from "../angular2-translator/TranslateComponent";
import {TranslateService} from "../angular2-translator/TranslateService";
import {TranslateLoader} from "../angular2-translator/TranslateLoader";
import {JasminePromise} from "./helper/promise-matcher";
import {TranslateConfig} from "../angular2-translator/TranslateConfig";
import {TranslateLogHandler} from "../angular2-translator/TranslateService";

export function main() {
    describe('TranslateComponent', function() {
        beforeEach(function() {
            TranslateLogHandler.error = () => {}
        });

        describe('constructor', function() {
            it('requires a TranslateService', function () {
                var injector = Injector.resolveAndCreate([
                    TranslateComponent
                ]);

                var action = function () {
                    injector.get(TranslateComponent);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateService));
                providerError.addKey(injector, Key.get(TranslateComponent));
                expect(action).toThrow(providerError);
            }); 
        });

        describe('instance', function() {
            var translate:TranslateService;
            var translateComponent:TranslateComponent;

            beforeEach(function() {
                PromiseMatcher.install();
                var injector = Injector.resolveAndCreate([
                    TRANSLATE_PROVIDERS,
                    provide(TranslateLoader, {useValue: new TranslateLoaderMock()}),
                    provide(TranslateConfig, {useValue: new TranslateConfig({
                        providedLangs: ['en', 'de']
                    })})
                ]);

                translate = injector.get(TranslateService);
                translateComponent = new TranslateComponent(translate);
                spyOn(translate, 'translate').and.returnValue(Promise.resolve('This is a text'));
            });

            afterEach(PromiseMatcher.uninstall);

            it('starts translation when key got set', function() {
                translateComponent.key = 'TEXT';

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {});
            });

            it('starts translation when key is set and params got changed', function() {
                translateComponent.key = 'TEXT';
                JasmineHelper.calls(translate.translate).reset();

                translateComponent.params = {some:'value'};

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {some:'value'});
            });

            it('restarts translation when key got changed', function() {
                translateComponent.key = 'ANYTHING';
                translateComponent.params = {some:'value'};
                JasmineHelper.calls(translate.translate).reset();

                translateComponent.key = 'TEXT';

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {some:'value'});
            });

            it('does not translate when key got not set', function() {
                translateComponent.params = {some:'value'};

                expect(translate.translate).not.toHaveBeenCalled();
            });

            it('does not accept non-object params', function() {
                translateComponent.key = 'TEXT';
                JasmineHelper.calls(translate.translate).reset();

                translateComponent.params = 'foo';

                expect(translate.translate).not.toHaveBeenCalled();
            });

            it('stores translation when promise got resolved', function() {
                translateComponent.key = 'TEXT';

                JasminePromise.flush();

                expect(translateComponent.translation).toBe('This is a text');
            });

            it('restarts translation when language got changed', function() {
                translateComponent.key = 'TEXT';
                JasmineHelper.calls(translate.translate).reset();

                translate.lang = 'de';

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {});
            });

            it('shows error if params are not object', function() {
                spyOn(TranslateLogHandler, 'error');

                translateComponent.params = 'foo';

                expect(TranslateLogHandler.error).toHaveBeenCalledWith('Params have to be an object');
            });
        });
    });
}
