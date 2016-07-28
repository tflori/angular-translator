import {provide, NoProviderError, ReflectiveKey, ReflectiveInjector} from "@angular/core";
import {HTTP_PROVIDERS} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {PromiseMatcher, JasminePromise} from "./helper/promise-matcher";
import {JasmineHelper} from "./helper/JasmineHelper";
import {TranslateLoaderMock} from "./helper/TranslateLoaderMock";
import {TranslateService, TranslateLogHandler} from '../angular2-translator/TranslateService';
import {TranslateConfig} from "../angular2-translator/TranslateConfig";
import {TranslateLoader} from "../angular2-translator/TranslateLoader";
import {TRANSLATE_PROVIDERS} from "../angular2-translator";
import {fakeAsync} from "@angular/core/testing";

describe('TranslateService', function () {
    beforeEach(function() {
        TranslateLogHandler.error = () => {};
    });

    it('is defined', function () {
        expect(TranslateService).toBeDefined();
    });

    describe('constructor', function () {
        it('requires a TranslateConfig', function () {
            var injector = ReflectiveInjector.resolveAndCreate([
                TranslateService
            ]);

            var action = function () {
                injector.get(TranslateService);
            };

            var providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateConfig));
            providerError.addKey(injector, ReflectiveKey.get(TranslateService));
            expect(action).toThrow(providerError);
        });

        it('requires a TranslateLoader', function () {
            var injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
                provide(TranslateConfig, {useValue: new TranslateConfig({})})
            ]);

            var action = function () {
                injector.get(TranslateService);
            };

            var providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateLoader));
            providerError.addKey(injector, ReflectiveKey.get(TranslateService));
            expect(action).toThrow(providerError);
        });

        it('requires an TranslateLogHandler', function() {
            var injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
                provide(TranslateConfig, {useValue: new TranslateConfig({})}),
                provide(TranslateLoader, {useValue: new TranslateLoaderMock()})
            ]);

            var action = function () {
                injector.get(TranslateService);
            };

            var providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateLogHandler));
            providerError.addKey(injector, ReflectiveKey.get(TranslateService));
            expect(action).toThrow(providerError);
        });

        it('predfines providers for default config', function () {
            var injector = ReflectiveInjector.resolveAndCreate([
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

        it('sets current lang to default lang', function () {
            var injector = ReflectiveInjector.resolveAndCreate([
                HTTP_PROVIDERS,
                TRANSLATE_PROVIDERS
            ]);

            var translate:TranslateService = injector.get(TranslateService);

            expect(translate.lang).toBe('en');
        });

        it('detects language automatically on start', function() {
            var translateConfig = new TranslateConfig({
                providedLangs: ['en','de']
            });
            translateConfig.navigatorLanguages = ['de-DE', 'de', 'en-US', 'en'];

            var injector = ReflectiveInjector.resolveAndCreate([
                HTTP_PROVIDERS,
                TRANSLATE_PROVIDERS,
                provide(TranslateConfig, {useValue: translateConfig}),
            ]);

            var translate:TranslateService = injector.get(TranslateService);

            expect(translate.lang).toBe('de');
        });

        it('informs about detected language', function() {
            var translateConfig = new TranslateConfig({
                providedLangs: ['en','de']
            });
            translateConfig.navigatorLanguages = ['de-DE', 'de', 'en-US', 'en'];
            spyOn(TranslateLogHandler, 'info');

            var injector = ReflectiveInjector.resolveAndCreate([
                HTTP_PROVIDERS,
                TRANSLATE_PROVIDERS,
                provide(TranslateConfig, {useValue: translateConfig}),
            ]);

            var translate:TranslateService = injector.get(TranslateService);

            expect(TranslateLogHandler.info).toHaveBeenCalledWith('Language de got detected');
        });
    });

    describe('instance', function () {
        var translateConfig:TranslateConfig = new TranslateConfig({});
        var translate:TranslateService;
        var loader:TranslateLoader;

        beforeEach(function () {
            translateConfig.providedLangs = ['en'];
            translateConfig.defaultLang = 'en';
            var injector:ReflectiveInjector = ReflectiveInjector.resolveAndCreate([
                HTTP_PROVIDERS,
                TRANSLATE_PROVIDERS,
                provide(TranslateConfig, {useValue: translateConfig})
            ]);
            translate             = injector.get(TranslateService);
            loader                = injector.get(TranslateLoader);
            PromiseMatcher.install();
        });

        afterEach(function() {
            //jasmine.clock().uninstall();
            PromiseMatcher.uninstall();
        });

        describe('detect language', function () {
            var mockNavigator:any;

            beforeEach(function () {
                mockNavigator = {};
            });

            it('detects language', function () {
                translateConfig.providedLangs = ['bm', 'en'];

                var detectedLang = translate.detectLang(['bm']);

                expect(detectedLang).toBe('bm');
            });

            it('detects only languages that are provided', function () {
                translateConfig.providedLangs = ['en'];

                var detectedLang = translate.detectLang(['bm']);

                expect(detectedLang).toBeFalsy();
            });

            it('using config.langProvided for checking', function () {
                spyOn(translateConfig, 'langProvided');

                translate.detectLang(['bm']);

                expect(translateConfig.langProvided).toHaveBeenCalledWith('bm');
            });

            it('rather takes direct matches', function () {
                translateConfig.providedLangs = ['de-DE', 'de-AT'];

                var detectedLang = translate.detectLang(['de-CH', 'de-AT']);

                expect(detectedLang).toBe('de-AT');
            });
        });

        describe('change language', function () {
            it('checks that language is provided using strict checking', function () {
                spyOn(translateConfig, 'langProvided').and.callThrough();

                translate.lang = 'en' ;

                expect(translateConfig.langProvided).toHaveBeenCalledWith('en', true);
            });

            it('sets current language to the provided language', function () {
                translateConfig.providedLangs = ['de/de'];

                translate.lang = 'de-DE';

                expect(translate.lang).toBe('de/de');
            });

            it('throws error if language is not provided', function () {
                translateConfig.providedLangs = ['de/de'];

                var action = function() {
                    translate.lang = 'de';
                };

                expect(action).toThrow(new Error('Language not provided'));
            });

            it('has an observable', function() {
                expect(translate.languageChanged instanceof Observable).toBe(true);
            });

            it('gives the next value to the observable', function() {
                translateConfig.providedLangs = ['en', 'de'];
                var newLang;
                translate.languageChanged.subscribe(function(nextLang) {
                    newLang = nextLang;
                });

                translate.lang = 'de';

                expect(newLang).toBe('de');
            });

            it('informs about language change', function() {
                spyOn(TranslateLogHandler, 'info');
                translateConfig.providedLangs = ['de/de'];

                translate.lang = 'de-DE';

                expect(TranslateLogHandler.info).toHaveBeenCalledWith('Language changed to de/de');
            });
        });

        describe('waiting for translation', function () {
            var loaderPromiseResolve:Function;
            var loaderPromiseReject:Function;

            beforeEach(function() {
                spyOn(loader, 'load').and.returnValue(new Promise<Object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it('returns a promise', function () {
                var promise = translate.waitForTranslation();

                expect(promise instanceof Promise).toBeTruthy();
            });

            it('starts loading the current language', function () {
                translate.waitForTranslation();

                expect(loader.load).toHaveBeenCalledWith('en');
            });

            it('resolves when loader resolves', fakeAsync(function() {
                var promise = translate.waitForTranslation();

                loaderPromiseResolve({"TEXT":"This is a text"});
                JasminePromise.flush();

                expect(promise).toBeResolved();
            }));

            it('rejects when loader rejects', fakeAsync(function() {
               var promise = translate.waitForTranslation();

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeRejected();
            }));

            it('loads a language only once', function() {
                translate.waitForTranslation();
                translate.waitForTranslation();

                expect(JasmineHelper.calls(loader.load).count()).toBe(1);
            });

            it('returns the already resolved promise', fakeAsync(function() {
                var firstPromise = translate.waitForTranslation();
                loaderPromiseResolve({"TEXT":"This is a text"});
                JasminePromise.flush();

                var secondPromise = translate.waitForTranslation();

                expect(secondPromise).toBeResolved();
                expect(secondPromise).toBe(firstPromise);
            }));

            it('loads given language', function() {
                translateConfig.providedLangs = ['en', 'de'];

                translate.waitForTranslation('de');

                expect(loader.load).toHaveBeenCalledWith('de');
            });

            it('checks if the language is provided', function() {
                spyOn(translateConfig, 'langProvided');

                translate.waitForTranslation('de');

                expect(translateConfig.langProvided).toHaveBeenCalledWith('de', true);
            });

            it('rejects if the language is not provided', function() {
                var promise = translate.waitForTranslation('de');

                expect(promise).toBeRejectedWith('Language not provided');
            });

            it('informs about loaded language', fakeAsync(function() {
                spyOn(TranslateLogHandler, 'info');

                translate.waitForTranslation();
                loaderPromiseResolve();
                JasminePromise.flush();

                expect(TranslateLogHandler.info).toHaveBeenCalledWith('Language en got loaded');
            }));

            it('shows error when language could not be loaded', fakeAsync(function() {
                spyOn(TranslateLogHandler, 'error');

                translate.waitForTranslation();
                loaderPromiseReject('File not found');
                JasminePromise.flush();

                expect(TranslateLogHandler.error).toHaveBeenCalledWith('Language en could not be loaded (File not found)');
            }));
        });

        describe('translate', function() {
            var loaderPromiseResolve:Function;
            var loaderPromiseReject:Function;

            beforeEach(function() {
                spyOn(loader, 'load').and.returnValue(new Promise<Object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it('loads the current language', function() {
                translate.translate('TEXT');

                expect(loader.load).toHaveBeenCalledWith('en');
            });

            it('loads the given language', function() {
                translateConfig.providedLangs = ['en', 'de'];

                translate.translate('TEXT', {}, 'de');

                expect(loader.load).toHaveBeenCalledWith('de');
            });

            it('checks if the language is provided', function() {
                spyOn(translateConfig, 'langProvided');

                translate.translate('TEXT', {}, 'de');

                expect(translateConfig.langProvided).toHaveBeenCalledWith('de', true);
            });

            // current language got checked before
            it('does not check current language', function() {
                spyOn(translateConfig, 'langProvided');

                translate.translate('TEXT');

                expect(translateConfig.langProvided).not.toHaveBeenCalled();
            });

            it('loads a language only once', function() {
                translate.translate('TEXT');
                translate.translate('OTHER_TEXT');

                expect(JasmineHelper.calls(loader.load).count()).toBe(1);
            });

            it('resolves keys if language is not provided', function() {
                var promise = translate.translate('TEXT', {}, 'de');

                expect(promise).toBeResolvedWith('TEXT');
            });

            it('resolves keys if laguage could not be loaded', fakeAsync(function() {
                var promise = translate.translate(['TEXT', 'OTHER_TEXT']);

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeResolvedWith(['TEXT', 'OTHER_TEXT']);
            }));

            it('uses instant to translate after loader resolves', fakeAsync(function() {
                spyOn(translate, 'instant');
                translate.translate('TEXT');

                loaderPromiseResolve({'TEXT': 'This is a text'});
                JasminePromise.flush();

                expect(translate.instant).toHaveBeenCalledWith('TEXT', {}, translate.lang);
            }));

            it('resolves with the return value from instant', fakeAsync(function() {
                spyOn(translate, 'instant').and.returnValue('This is a text');
                var promise = translate.translate('TEXT');

                loaderPromiseResolve({'TEXT': 'This is a text'});

                expect(promise).toBeResolvedWith('This is a text');
            }));
        });

        describe('instant', function() {

            beforeEach(fakeAsync(function() {
                var loaderPromiseResolve:Function = (t:Object) => {};
                spyOn(loader, 'load').and.returnValue(new Promise<Object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                }));

                translate.waitForTranslation();
                loaderPromiseResolve({
                    TEXT: 'This is a text',
                    INTERPOLATION: 'The sum from 1+2 is {{1+2}}',
                    VARIABLES_TEST: 'This {{this.count > 5 ? "is interesting" : "is boring"}}',
                    VARIABLES_OUT: 'Hello {{this.name.first}} {{this.name.title ? this.name.title + " " : ""}}{{this.name.last}}',
                    BROKEN: 'This "{{this.notExisting.func()}}" is empty string',
                    SALUTATION: '{{this.name.title ? this.name.title + " " : (this.name.gender === "w" ? "Ms." : "Mr.")}}{{this.name.first}} {{this.name.last}}',
                    WELCOME: 'Welcome{{this.lastLogin ? " back" : ""}} [[SALUTATION:name]]!{{this.lastLogin ? " Your last login was on " + this.lastLogin : ""}}',
                    HACK: '{{this.privateVar}}{{this.givenVar}}',
                    CALL: 'You don\'t know {{this.privateVar}} but [[HACK:givenVar]]'
                });

                JasminePromise.flush();
            }));

            it('returns keys if language is not loaded', function() {
                var translation = translate.instant('TEXT', {}, 'de');

                expect(translation).toBe('TEXT');
            });

            it('returns keys if translation not found', function() {
                var translations = translate.instant(['SOME_TEXT', 'OTHER_TEXT']);

                expect(translations).toEqual(['SOME_TEXT', 'OTHER_TEXT']);
            });

            it('returns interpolated text', function() {
                var translations = translate.instant([
                    'INTERPOLATION',
                    'VARIABLES_TEST',
                    'VARIABLES_OUT'
                ], {
                    count: 6,
                    name: {
                        first: 'John',
                        last: 'Doe'
                    }
                });

                expect(translations).toEqual([
                    'The sum from 1+2 is 3',
                    'This is interesting',
                    'Hello John Doe'
                ]);
            });

            it('catches parse errors in translations', function() {
                var translation = translate.instant('BROKEN');

                expect(translation).toBe('This "" is empty string');
            });

            it('translates values in brackets', function() {
                var translation = translate.instant('WELCOME', {
                    lastLogin: '24th of February, 2016',
                    name: {
                        gender: 'w',
                        first: 'Jane',
                        title: 'Dr.',
                        last: 'Doe'
                    }
                });

                expect(translation).toBe('Welcome back Dr. Jane Doe! Your last login was on 24th of February, 2016');
            });

            it('transports only variables defined to subtranslations', function() {
                var translation = translate.instant('CALL', {
                    privateVar: 'private',
                    givenVar: 'given'
                });

                expect(translation).toBe('You don\'t know private but given');
            });

            it('informs about missing translation', function() {
                spyOn(TranslateLogHandler, 'info');

                translate.instant('UNDEFINED');

                expect(TranslateLogHandler.info).toHaveBeenCalledWith('Translation for \'UNDEFINED\' in language en not found');
            });

            it('shows error when parsing throws error', function() {
                spyOn(TranslateLogHandler, 'error');

                translate.instant('BROKEN');

                expect(TranslateLogHandler.error).toHaveBeenCalledWith('Parsing error for expression \'this.notExisting.func()\'');
            });
        });
    });
});
