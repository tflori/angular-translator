import {ReflectiveInjector, NoProviderError, ReflectiveKey, provide} from "@angular/core";
import {PromiseMatcher, JasminePromise} from "./helper/promise-matcher";
import {JasmineHelper} from "./helper/JasmineHelper";
import {TRANSLATE_PROVIDERS} from "../angular2-translator";
import {TranslatePipe} from "../angular2-translator/TranslatePipe";
import {TranslateService, TranslateLogHandler} from "../angular2-translator/TranslateService";
import {TranslateLoader} from "../angular2-translator/TranslateLoader";
import {TranslateLoaderMock} from "./helper/TranslateLoaderMock";
import {TranslateConfig} from "../angular2-translator/TranslateConfig";
import {fakeAsync} from "@angular/core/testing";
import {COMPILER_PROVIDERS} from "@angular/compiler";

describe('TranslatePipe', function() {
    it('is defined', function () {
        expect(TranslatePipe).toBeDefined();
    });

    describe('constructor', function() {
        it('requires a TranslateService', function () {
            var injector = ReflectiveInjector.resolveAndCreate([
                TranslatePipe
            ]);

            var action = function () {
                injector.get(TranslatePipe);
            };

            var providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateService));
            providerError.addKey(injector, ReflectiveKey.get(TranslatePipe));
            expect(action).toThrow(providerError);
        });
    });

    describe('transform', function() {
        var translate:TranslateService;
        var translatePipe:TranslatePipe;

        beforeEach(function() {
            PromiseMatcher.install();
            TranslateLogHandler.error = () => {};
            var injector = ReflectiveInjector.resolveAndCreate([
                COMPILER_PROVIDERS,
                TRANSLATE_PROVIDERS,
                provide(TranslateLoader, {useValue: new TranslateLoaderMock()}),
                provide(TranslateConfig, {useValue: new TranslateConfig({
                    providedLangs: ['en', 'de']
                })}),
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

        it('returns translation when promise got resolved', fakeAsync(function() {
            translatePipe.transform('TEXT');

            JasminePromise.flush();
            var translation = translatePipe.transform('TEXT');

            expect(translation).toBe('This is a text');
        }));

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

        it('calls translate again when language got changed', function() {
            translatePipe.transform('TEXT');

            translate.lang = 'de';

            expect(JasmineHelper.calls(translate.translate).count()).toBe(2);
        });

        it('shows error if params could not be parsed', function() {
            spyOn(TranslateLogHandler, 'error');

            translatePipe.transform('TEXT', ['{baefa}']);

            expect(TranslateLogHandler.error).toHaveBeenCalledWith('\'{baefa}\' could not be parsed to object');
        });
    });
});
