import {Injector, NoProviderError, Key, provide} from "angular2/core";
import {PromiseMatcher, JasminePromise} from "./helper/promise-matcher";
import {JasmineHelper} from "./helper/JasmineHelper";
import {TRANSLATE_PROVIDERS} from "../angular2-translator";
import {TranslatePipe} from "../angular2-translator/TranslatePipe";
import {TranslateService} from "../angular2-translator/TranslateService";
import {TranslateLoader} from "../angular2-translator/TranslateLoader";
import {TranslateLoaderMock} from "./helper/TranslateLoaderMock";

export function main() {
    describe('TranslatePipe', function() {
        it('is defined', function () {
            expect(TranslatePipe).toBeDefined();
        });

        describe('constructor', function() {
            it('requires a TranslateService', function () {
                var injector = Injector.resolveAndCreate([
                    TranslatePipe
                ]);

                var action = function () {
                    injector.get(TranslatePipe);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateService));
                providerError.addKey(injector, Key.get(TranslatePipe));
                expect(action).toThrow(providerError);
            });
        });

        describe('transform', function() {
            var translate:TranslateService;
            var translatePipe:TranslatePipe;

            beforeEach(function() {
                PromiseMatcher.install();
                var injector = Injector.resolveAndCreate([
                    TRANSLATE_PROVIDERS,
                    provide(TranslateLoader, {useValue: new TranslateLoaderMock()})
                ]);

                translate = injector.get(TranslateService);
                translatePipe = new TranslatePipe(translate);
                spyOn(translate, 'translate').and.returnValue(Promise.resolve('This is a text'));
            });

            afterEach(PromiseMatcher.uninstall);

            it('returns an empty string', function() {
                var translation = translatePipe.transform('TEXT');

                expect(translation).toBe('');
            });

            it('calls translate to get translation', function() {
                translatePipe.transform('TEXT');

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {});
            });

            it('calls translate only once', function() {
                translatePipe.transform('TEXT');
                translatePipe.transform('TEXT');

                expect(JasmineHelper.calls(translate.translate).count()).toBe(1);
            });

            it('gets params from args[0]', function() {
                translatePipe.transform('TEXT', [{some:'value'}]);

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {some:'value'})
            });

            it('evaluates args[0] to get object', function() {
                translatePipe.transform('TEXT', ['{some:\'value\'}']);

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {some:'value'});
            });

            it('calls with empty object if args[0] got not evaluated to object', function() {
                translatePipe.transform('TEXT', ['\'value\'']);

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {});
            });

            it('returns translation when promise got resolved', function() {
                translatePipe.transform('TEXT');

                JasminePromise.flush();
                var translation = translatePipe.transform('TEXT');

                expect(translation).toBe('This is a text');
            });

            it('calls translate again when key changes', function() {
                translatePipe.transform('ANYTHING');
                translatePipe.transform('TEXT');

                expect(translate.translate).toHaveBeenCalledWith('ANYTHING', {});
                expect(translate.translate).toHaveBeenCalledWith('TEXT', {});
                expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
            });

            it('calls translate again when params changes', function() {
                translatePipe.transform('TEXT', [{some:'value'}]);
                translatePipe.transform('TEXT', [{some:'otherValue'}]);

                expect(translate.translate).toHaveBeenCalledWith('TEXT', {some:'value'});
                expect(translate.translate).toHaveBeenCalledWith('TEXT', {some:'otherValue'});
                expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
            });
        });
    });
}