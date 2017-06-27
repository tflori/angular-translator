import {
    TranslateLogHandler,
    Translator,
    TranslatorConfig,
    TranslatorContainer,
    TranslatorModule,
} from "../index";
import { TranslationLoader } from "../src/TranslationLoader";

import { JasmineHelper } from "./helper/JasmineHelper";
import { JasminePromise, PromiseMatcher } from "./helper/promise-matcher";
import { TranslateLogHandlerMock, TranslationLoaderMock } from "./helper/TranslatorMocks";

import { DatePipe, UpperCasePipe } from "@angular/common";
import { Injector } from "@angular/core";
import { fakeAsync, TestBed } from "@angular/core/testing";
import { Observable } from "rxjs/Observable";

describe("Translator", () => {
    it("is defined", () => {
        expect(Translator).toBeDefined();
    });

    describe("constructor", () => {
        let injector: Injector;
        let translatorConfig: TranslatorConfig;
        let translatorContainer: TranslatorContainer;

        beforeEach(() => {
            translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                providedLanguages: ["de", "en"],
                loader: TranslationLoaderMock,
                detectLanguage: false,
            });
            TestBed.configureTestingModule({
                providers: [
                    { provide: TranslatorConfig, useValue: translatorConfig},
                    { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    TranslatorContainer,
                ],
            });
            translatorContainer = TestBed.get(TranslatorContainer);
            injector = TestBed.get(Injector);
        });

        it("gets the base config from injector", () => {
            spyOn(injector, "get").and.callThrough();

            // tslint:disable-next-line
            new Translator("default", injector);

            expect(injector.get).toHaveBeenCalledWith(TranslatorConfig);
        });

        it("gets his config from TranslatorConfig", () => {
            spyOn(translatorConfig, "module").and.callThrough();

            // tslint:disable-next-line
            new Translator("test", injector);

            expect(translatorConfig.module).toHaveBeenCalledWith("test");
        });

        it("uses base config for default module", () => {
            spyOn(translatorConfig, "module").and.callThrough();

            // tslint:disable-next-line
            new Translator("default", injector);

            expect(translatorConfig.module).not.toHaveBeenCalled();
        });

        it("initialize with current language from TranslatorContainer", () => {
            translatorConfig.setOptions({
                defaultLanguage: "de",
                providedLanguages: [ "de", "en" ],
                detectLanguage: false,
            });
            translatorContainer.language = "en";

            let translator = new Translator("default", injector);

            expect(translator.language).toBe("en");
        });

        it("uses default language if the language is not provided", () => {
            translatorConfig.setOptions({
                defaultLanguage: "ru",
                providedLanguages: [ "de", "en", "ru" ],
                detectLanguage: false,
                modules: {
                    test: {
                        defaultLanguage: "de",
                        providedLanguages: ["de", "en"],
                    },
                },
            });
            translatorContainer.language = "ru";

            let translator = new Translator("test", injector);

            expect(translator.language).toBe("de");
        });

        it("creates an observable for language changes", () => {
            let translator = new Translator("default", injector);

            expect(translator.languageChanged).toEqual(jasmine.any(Observable));
        });

        it("subscribes to language changes", () => {
            let observable = injector.get(TranslatorContainer).languageChanged;
            spyOn(observable, "subscribe");

            // tslint:disable-next-line
            new Translator("default", injector);

            expect(observable.subscribe).toHaveBeenCalled();
        });
    });

    describe("instance", () => {
        let translator: Translator;
        let translatorConfig: TranslatorConfig;
        let translationLoader: TranslationLoader;
        let translateLogHandler: TranslateLogHandler;

        beforeEach(() => {
            translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock());
            TestBed.configureTestingModule({
                imports: [
                    TranslatorModule.forRoot({
                        loader: TranslationLoaderMock,
                        providedLanguages: ["de", "en"],
                        detectLanguage: false,
                    }),
                ],
                providers: [
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    TranslationLoaderMock,
                ],
            });

            translatorConfig = TestBed.get(TranslatorConfig);
            translationLoader = TestBed.get(TranslationLoaderMock);
            translateLogHandler = TestBed.get(TranslateLogHandler);
            translator = new Translator("default", TestBed.get(Injector));

            PromiseMatcher.install();
        });

        afterEach(() => {
            PromiseMatcher.uninstall();
        });

        describe("change language", () => {
            it("checks that language is provided using strict checking", () => {
                spyOn(translatorConfig, "providedLanguage").and.callThrough();

                translator.language = "en" ;

                expect(translatorConfig.providedLanguage).toHaveBeenCalledWith("en", true);
            });

            it("sets current language to the provided language", () => {
                translatorConfig.setOptions({ providedLanguages: [ "de/de" ]});

                translator.language = "de-DE";

                expect(translator.language).toBe("de/de");
            });

            it("does not change when language not available", () => {
                translator.language = "ru";

                expect(translator.language).toBe("en");
            });

            it("gives the next value to the observable", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"]});
                let spy = jasmine.createSpy("languageChanged");
                translator.languageChanged.subscribe(spy);

                translator.language = "de";

                expect(spy).toHaveBeenCalledWith("de");
            });

            it("informs about language change", () => {
                spyOn(translateLogHandler, "info");
                translatorConfig.setOptions({ providedLanguages: [ "de/de" ]});

                translator.language = "de-DE";

                expect(translateLogHandler.info).toHaveBeenCalledWith("Language changed to de/de");
            });

            it("changes language when container changes language", () => {
                let translatorContainer: TranslatorContainer = TestBed.get(TranslatorContainer);

                translatorContainer.language = "de";

                expect(translator.language).toBe("de");
            });

            it("hits all subscribers when language change", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"]});
                let spy1 = jasmine.createSpy("languageChanged");
                let spy2 = jasmine.createSpy("languageChanged");
                translator.languageChanged.subscribe(spy1);
                translator.languageChanged.subscribe(spy2);

                translator.language = "de";

                expect(spy1).toHaveBeenCalledWith("de");
                expect(spy2).toHaveBeenCalledWith("de");
            });

            it("fires next when container changes language", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"]});
                let translatorContainer: TranslatorContainer = TestBed.get(TranslatorContainer);
                let spy = jasmine.createSpy("languageChanged");
                translator.languageChanged.subscribe(spy);

                translatorContainer.language = "de";

                expect(spy).toHaveBeenCalledWith("de");
            });
        });

        describe("waiting for translation", () => {
            let loaderPromiseResolve: (...params: any[]) => void;
            let loaderPromiseReject: (reason?: string) => void;

            beforeEach(() => {
                spyOn(translationLoader, "load").and.returnValue(new Promise<object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it("returns a promise", () => {
                let promise = translator.waitForTranslation();

                expect(promise instanceof Promise).toBeTruthy();
            });

            it("starts loading the current language", () => {
                translator.waitForTranslation();

                expect(translationLoader.load).toHaveBeenCalledWith({ language: "en", module: "default" });
            });

            it("resolves when loader resolves", fakeAsync(() => {
                let promise = translator.waitForTranslation();

                loaderPromiseResolve({ TEXT: "This is a text" });
                JasminePromise.flush();

                expect(promise).toBeResolved();
            }));

            it("rejects when loader rejects", fakeAsync(() => {
                let promise = translator.waitForTranslation();

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeRejected();
            }));

            it("loads a language only once", () => {
                translator.waitForTranslation();
                translator.waitForTranslation();

                expect(JasmineHelper.calls(translationLoader.load).count()).toBe(1);
            });

            it("returns the already resolved promise", fakeAsync(() => {
                let firstPromise = translator.waitForTranslation();
                loaderPromiseResolve({ TEXT: "This is a text" });
                JasminePromise.flush();

                let secondPromise = translator.waitForTranslation();

                expect(secondPromise).toBeResolved();
                expect(secondPromise).toBe(firstPromise);
            }));

            it("loads given language", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"] });

                translator.waitForTranslation("de").then();

                expect(translationLoader.load).toHaveBeenCalledWith({ language: "de", module: "default" });
            });

            it("adds the loaderOptions from config", () => {
                translatorConfig.setOptions({ loaderOptions: { loaderOption: "value" } });

                translator.waitForTranslation();

                expect(translationLoader.load).toHaveBeenCalledWith({
                    loaderOption: "value",
                    language: "en",
                    module: "default",
                });
            });

            it("checks if the language is provided", () => {
                spyOn(translatorConfig, "providedLanguage");

                translator.waitForTranslation("de").then();

                expect(translatorConfig.providedLanguage).toHaveBeenCalledWith("de", true);
            });

            it("rejects if the language is not provided", () => {
                let promise = translator.waitForTranslation("ru");

                expect(promise).toBeRejectedWith("Language ru not provided");
            });

            it("informs about loaded language", fakeAsync(() => {
                spyOn(translateLogHandler, "info");

                translator.waitForTranslation();
                loaderPromiseResolve();
                JasminePromise.flush();

                expect(translateLogHandler.info).toHaveBeenCalledWith("Language en got loaded");
            }));

            it("shows error when language could not be loaded", fakeAsync(() => {
                spyOn(translateLogHandler, "error").and.callFake(() => {});

                translator.waitForTranslation();
                loaderPromiseReject("File not found");
                JasminePromise.flush();

                expect(translateLogHandler.error)
                    .toHaveBeenCalledWith("Language en could not be loaded (File not found)");
            }));
        });

        describe("translate", () => {
            let loaderPromiseResolve: (...params: any[]) => void;
            let loaderPromiseReject: (reason?: string) => void;

            beforeEach(() => {
                spyOn(translationLoader, "load").and.returnValue(new Promise<object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it("loads the current language", () => {
                translator.translate("TEXT");

                expect(translationLoader.load).toHaveBeenCalledWith({ module: "default", language: "en" });
            });

            it("loads the given language", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"] });

                translator.translate("TEXT", {}, "de");

                expect(translationLoader.load).toHaveBeenCalledWith({ module: "default", language: "de" });
            });

            it("checks if the language is provided", () => {
                spyOn(translatorConfig, "providedLanguage");

                translator.translate("TEXT", {}, "de");

                expect(translatorConfig.providedLanguage).toHaveBeenCalledWith("de", true);
            });

            it("loads a language only once", () => {
                translator.translate("TEXT");
                translator.translate("OTHER_TEXT");

                expect(JasmineHelper.calls(translationLoader.load).count()).toBe(1);
            });

            it("resolves keys if language is not provided", () => {
                let promise = translator.translate("TEXT", {}, "ru");

                expect(promise).toBeResolvedWith("TEXT");
            });

            it("resolves keys if laguage could not be loaded", fakeAsync(() => {
                translateLogHandler.error = () => {};

                let promise = translator.translate(["TEXT", "OTHER_TEXT"]);
                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeResolvedWith(["TEXT", "OTHER_TEXT"]);
            }));

            it("uses instant to translate after loader resolves", fakeAsync(() => {
                spyOn(translator, "instant");
                translator.translate("TEXT");

                loaderPromiseResolve({TEXT: "This is a text"});
                JasminePromise.flush();

                expect(translator.instant).toHaveBeenCalledWith("TEXT", {}, translator.language);
            }));

            it("resolves with the return value from instant", fakeAsync(() => {
                spyOn(translator, "instant").and.returnValue("This is a text");

                let promise = translator.translate("TEXT");
                loaderPromiseResolve({TEXT: "This is a text"});

                expect(promise).toBeResolvedWith("This is a text");
            }));
        });

        describe("observe", () => {
            let translateSpy: jasmine.Spy;

            beforeEach(() => {
                translateSpy = spyOn(translator, "translate").and.callFake((keys: string|string[], params?: any) => {
                    return Promise.resolve(keys);
                });
            });

            it("returns an observable", () => {
                let result = translator.observe("HELLO");

                expect(result).toEqual(jasmine.any(Observable));
            });

            it("is using translate", () => {
                translator.observe("HELLO").subscribe();

                expect(translator.translate).toHaveBeenCalledWith("HELLO", {});
            });

            it("pushes the result from translate to observable", fakeAsync(() => {
                let spy = jasmine.createSpy("subscriber");
                translator.observe("HELLO").subscribe(spy);

                JasminePromise.flush();

                expect(spy).toHaveBeenCalledWith("HELLO");
            }));

            it("translates again when language got changed", () => {
                translatorConfig.setOptions({ providedLanguages: ["en", "de"]});

                translator.observe("HELLO").subscribe();
                translator.language = "de";

                expect(translator.translate).toHaveBeenCalledTimes(2);
            });

            it("pushes the result for the new language", fakeAsync(() => {
                let spy = jasmine.createSpy("subscriber");
                translator.observe("HELLO").subscribe(spy);

                JasminePromise.flush();
                translateSpy.and.returnValue(Promise.resolve("Hallo"));
                translator.language = "de";
                JasminePromise.flush();

                expect(spy).toHaveBeenCalledWith("HELLO");
                expect(spy).toHaveBeenCalledWith("Hallo");
            }));
        });

        describe("instant", () => {
            let loaderPromiseResolve: (...params: any[]) => void;

            beforeEach(fakeAsync(() => {
                spyOn(translationLoader, "load").and.callFake(() => {
                    return new Promise<object>((resolve) => {
                        loaderPromiseResolve = resolve;
                    });
                });
            }));

            it("returns keys if language is not provided", () => {
                spyOn(translateLogHandler, "error");

                let translation = translator.instant("TEXT", {}, "ru");

                expect(translation).toBe("TEXT");
                expect(translateLogHandler.error).toHaveBeenCalledWith("Language ru not provided");
            });

            it("returns keys if translation not found", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({});
                JasminePromise.flush();

                let translations = translator.instant(["SOME_TEXT", "OTHER_TEXT"]);

                expect(translations).toEqual(["SOME_TEXT", "OTHER_TEXT"]);
            }));

            it("translates in different language", fakeAsync(() => {
                translator.waitForTranslation("de");
                loaderPromiseResolve({
                    HELLO_WORLD: "Hallo Welt!",
                });
                JasminePromise.flush();

                let translations = translator.instant("HELLO_WORLD", {}, "de");

                expect(translations).toEqual("Hallo Welt!");
            }));

            it("returns interpolated text", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                    VARIABLES_OUT: "Hello {{name.first}} {{name.title ? name.title + ' ' : ''}}{{name.last}}",
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();

                let translations = translator.instant([
                    "INTERPOLATION",
                    "VARIABLES_TEST",
                    "VARIABLES_OUT",
                ], {
                    count: 6,
                    name: {
                        first: "John",
                        last: "Doe",
                    },
                });

                expect(translations).toEqual([
                    "The sum from 1+2 is 3",
                    "This is interesting",
                    "Hello John Doe",
                ]);
            }));

            it("catches parse errors in translations", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    BROKEN: 'This "{{notExisting.func()}}" is empty string',
                });
                JasminePromise.flush();
                translateLogHandler.error = () => {};

                let translation = translator.instant("BROKEN");

                expect(translation).toBe('This "" is empty string');
            }));

            it("does not throw if variable is not existent", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    PROP: "{{another.one}}",
                    VAR: "{{something}}",
                });
                JasminePromise.flush();
                spyOn(translateLogHandler, "error");

                translator.instant(["VAR", "PROP"]);

                expect(translateLogHandler.error).not.toHaveBeenCalled();
            }));

            it("shows error when parsing throws error", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    BROKEN: 'This "{{throw}}" is empty string',
                });
                JasminePromise.flush();
                spyOn(translateLogHandler, "error").and.callFake(() => {});

                translator.instant("BROKEN");

                expect(translateLogHandler.error)
                    .toHaveBeenCalledWith("Parse error for expression \'{{throw}}\'");
                expect(translateLogHandler.error)
                    .toHaveBeenCalledWith(jasmine.any(Error));
            }));

            it("informs about missing translation", () => {
                spyOn(translateLogHandler, "info");

                translator.instant("UNDEFINED");

                expect(translateLogHandler.info)
                    .toHaveBeenCalledWith("Translation for \'UNDEFINED\' in language en not found");
            });

            it("can not get __context as parameter", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(translateLogHandler, "error").and.callFake(() => {});

                translator.instant("INTERPOLATION", {__context: "at work"});

                expect(translateLogHandler.error).toHaveBeenCalledWith("Parameter \'__context\' is not allowed.");
            }));

            it("can not get numeric keys in parameter", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(translateLogHandler, "error").and.callFake(() => {});

                translator.instant("INTERPOLATION", {
                    42: "the answer",
                });

                expect(translateLogHandler.error).toHaveBeenCalledWith("Parameter \'42\' is not allowed.");
            }));

            it("ignores prototyped properties in parameters", fakeAsync(() => {
                translator.waitForTranslation();

                loaderPromiseResolve({
                    INTERPOLATION: "{{something}}",
                });
                JasminePromise.flush();

                // tslint:disable-next-line
                let MyObject = function MyOption(): void {};
                MyObject.prototype.something = 42;

                let result = translator.instant("INTERPOLATION", new MyObject());

                expect(result).toBe("");
            }));

            it("continues with other parameters after __context", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();
                translateLogHandler.error = () => {};

                let translation = translator.instant("VARIABLES_TEST", {__context: "at work", count: 6});

                expect(translation).toBe("This is interesting");
            }));

            it("continues with other parameters after numeric", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();
                translateLogHandler.error = () => {};

                let translation = translator.instant("VARIABLES_TEST", {42: "the answer", count: 6});

                expect(translation).toBe("This is interesting");
            }));

            it("ignores array as parameters", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(translateLogHandler, "error").and.callFake(() => {});

                let translation = translator.instant("INTERPOLATION", [1, 2, 3]);

                expect(translation).toBe("The sum from 1+2 is 3");
                expect(translateLogHandler.error).toHaveBeenCalledWith("Parameters can not be an array.");
            }));

            it("resolves 0 number as '0'", fakeAsync(() => {
                translator.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The count is {{count}}",
                });
                JasminePromise.flush();

                let translation = translator.instant("INTERPOLATION", { count: 0 });

                expect(translation).toBe("The count is 0");
            }));

            describe("referenced translations", () => {
                it("removes valid translation references", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[]]!",
                    });
                    JasminePromise.flush();
                    translateLogHandler.error = () => {};

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                }));

                it("logs an error if reference has no key", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        HELLO: "Hello [[:]]!",
                        WELCOME: "Welcome [[]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected key in '[[]]'",
                    );

                    JasmineHelper.calls(translateLogHandler.error).reset();

                    translation = translator.instant("HELLO");

                    expect(translation).toBe("Hello !");
                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 3 expected key in '[[:]]'",
                    );
                }));

                it("reads the key after opening brackets", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[A]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "info").and.callFake(() => {});

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome A!");
                    expect(translateLogHandler.info).toHaveBeenCalledWith(
                        "Translation for 'A' in language en not found",
                    );
                }));

                it("ignores spaces before key", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ \t\n]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected key in '[[ \t\n]]'",
                    );
                }));

                it("allows dots in key", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        "HELLO": "Hello [[ app.WORLD ]]!",
                        "app.WORLD": "World",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("HELLO");

                    expect(translation).toBe("Hello World!");
                }));

                it("key is finish after space character", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ A B ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 6 expected colon or end in '[[ A B ]]'",
                    );
                }));

                it("ignores other spaces before colon", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ A  B ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 7 expected colon or end in '[[ A  B ]]'",
                    );
                }));

                it("key can have more than one character", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ ABC ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("WELCOME");

                    expect(translation).toBe("Welcome ABC!");
                }));

                it("expects a parameter after colon", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T :. ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 7 expected parameter in " +
                        "'[[ T :. ]]'",
                    );
                }));

                it("ignores spaces after colon", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : ]]'",
                    );
                }));

                it("key can not have comma, equal sign, or colon", fakeAsync(() => {
                    // for key is allowed [A-Za-z0-9_.-] not [,=:]
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T, ]]!",
                        B: "[[ T= ]]!",
                        C: "[[ T: ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 5 expected colon or end in '[[ T, ]]'",
                    );

                    JasmineHelper.calls(translateLogHandler.error).reset();

                    translator.instant("B");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 5 expected colon or end in '[[ T= ]]'",
                    );

                    JasmineHelper.calls(translateLogHandler.error).reset();

                    translator.instant("C");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in '[[ T: ]]'",
                    );
                }));

                it("waits for parameters after colon", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in '[[ T : ]]'",
                    );
                }));

                it("reads the parameter key passes this parameter to referenced translation", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : a]]",
                        T: "{{a}}",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("A", { a: "Hello world!" });

                    expect(translation).toBe("Hello world!");
                }));

                it("transports only variables defined to subtranslations", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        CALL: "You don\'t know {{privateVar}} but [[HACK:givenVar]]",
                        HACK: "{{privateVar}}{{givenVar}}",
                    });
                    JasminePromise.flush();
                    translateLogHandler.error = () => {};

                    let translation = translator.instant("CALL", {
                        givenVar:   "given",
                        privateVar: "private",
                    });

                    expect(translation).toBe("You don\'t know private but given");
                }));

                it("throws an error for illegal parameter characters", fakeAsync(() => {
                    // for parameter is allowed [A-Za-z0-9_] not [.,=:-]
                    let translations = {
                        A: "[[ T : a.]]",
                        B: "[[ T : a:]]",
                        C: "[[ T : a-]]",
                        D: "[[ T : a,]]",
                        E: "[[ T : a=]]",
                    };
                    translator.waitForTranslation();
                    loaderPromiseResolve(translations);
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    for (let key in translations) {
                        if (!translations.hasOwnProperty(key)) {
                            continue;
                        }
                        JasmineHelper.calls(translateLogHandler.error).reset();

                        translator.instant(key);

                        if ([ "A", "B", "C" ].indexOf(key) > -1) {
                            // unexpected character for [.:-]
                            expect(translateLogHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected character at pos 9 expected comma, equal sign or end in " +
                                "'" + translations[key] + "'",
                            );
                        } else if (key === "D") {
                            // unexpected end expected parameter for [,]
                            expect(translateLogHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected end expected parameter in '" + translations[key] + "'",
                            );
                        } else if (key === "E") {
                            // unexpected end expected parameter for [=]
                            expect(translateLogHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected end expected getter in '" + translations[key] + "'",
                            );
                        }
                    }
                }));

                it("stops param reading after space", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo bar ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 12 expected comma, equal sign or end in " +
                        "'[[ T : foo bar ]]'",
                    );
                }));

                it("expects comma after reading param key", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : a , ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : a , ]]'",
                    );
                }));

                it("waits for a getter after equal sign", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo =]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected getter in " +
                        "'[[ T : foo =]]'",
                    );
                }));

                it("transports variables under different names", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        GREETING:   "Hello [[SALUTATION:name=u]]!",
                        SALUTATION: "{{name.title ? name.title + ' ' : (name.gender === 'w' ? 'Ms.' : 'Mr.')}}" +
                        "{{name.first}} {{name.last}}",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("GREETING", {
                        u: {
                            first: "Jane",
                            gender: "w",
                            last: "Doe",
                            title: "Dr.",
                        },
                    });

                    expect(translation).toBe("Hello Dr. Jane Doe!");
                }));

                it("throws error if getter begins with illegal character", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo ==]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 13 expected getter in " +
                        "'[[ T : foo ==]]'",
                    );
                }));

                it("ignores space in front of getter", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected getter in " +
                        "'[[ T : foo = ]]'",
                    );
                }));

                it("continues reading getter", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = ab]]",
                        T: "{{foo}}",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("A", {ab: "Hello world!"});

                    expect(translation).toBe("Hello world!");
                }));

                it("throws error if getter contains illegal character", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = a=]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 15 expected comma or end in " +
                        "'[[ T : foo = a=]]'",
                    );
                }));

                it("stops reading getter after space", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = a a]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 16 expected comma or end in " +
                        "'[[ T : foo = a a]]'",
                    );
                }));

                it("waits for next parameter after comma", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = a ,]]",
                        B: "[[ T : foo = a,]]",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    translator.instant("A");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : foo = a ,]]'",
                    );

                    JasmineHelper.calls(translateLogHandler.error).reset();

                    translator.instant("B");

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : foo = a,]]'",
                    );
                }));

                it("ignores spaces after reading getter", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = ab  ]]",
                        T: "{{foo}}",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("A", {ab: "Hello world!"});

                    expect(translation).toBe("Hello world!");
                }));

                it("transports multiple parameters", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : h,a  ]]",
                        B: "[[ T : h ,b  ]]",
                        C: "[[ T : h=h,c  ]]",
                        D: "[[ T : h=h ,d  ]]",
                        T: "{{h}} {{a}}{{b}}{{c}}{{d}}!",
                    });
                    JasminePromise.flush();
                    translateLogHandler.error = () => {};

                    let translations = translator.instant(
                        [ "A", "B", "C", "D" ],
                        { a: "A", b: "B", c: "C", d: "D", h: "Hello" },
                    );

                    expect(translations[0]).toBe("Hello A!");
                    expect(translations[1]).toBe("Hello B!");
                    expect(translations[2]).toBe("Hello C!");
                    expect(translations[3]).toBe("Hello D!");
                }));

                it("gets deep objects", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        NEW_COMMENT: "New comment from [[ SALUTATION : name = comment.author ]].",
                        SALUTATION: "{{name.title ? name.title : (name.gender === 'w' ? 'Ms.' : 'Mr.')}} " +
                        "{{name.first}} {{name.last}}",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("NEW_COMMENT", {
                        comment: {
                            author: {
                                first: "John",
                                gender: "m",
                                last: "Doe",
                            },
                            title: "Lorem ipsum usum",
                        },
                    });

                    expect(translation).toBe("New comment from Mr. John Doe.");
                }));

                it("provides the object under getter for params", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        NEW_COMMENT: "New comment from [[ SALUTATION : = comment.author ]].",
                        SALUTATION: "{{title ? title : (gender === 'w' ? 'Mrs.' : 'Mr.')}} " +
                        "{{first}} {{last}}",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("NEW_COMMENT", {
                        comment: {
                            author: {
                                first: "Jane",
                                gender: "w",
                                last: "Doe",
                                title: undefined,
                            },
                            title: "Lorem ipsum usum",
                        },
                    });

                    expect(translation).toBe("New comment from Mrs. Jane Doe.");
                }));

                it("accepts only objects for params", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : = a ]]",
                        T: "Hello {{who}}!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("A", { a: "string" });

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Only objects can be passed as params in " +
                        "'[[ T : = a ]]'",
                    );
                    expect(translation).toBe("Hello !");
                }));

                it("accepts only first parameter without key", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : b , = a ]]",
                        T: "Hello {{who}}!",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error").and.callFake(() => {});

                    let translation = translator.instant("A", {
                        a: {},
                        b: "string",
                    });

                    expect(translateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error only first parameter can be passed as params in " +
                        "'[[ T : b , = a ]]'",
                    );
                    expect(translation).toBe("");
                }));

                it("second parameter got added to the object", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        REFERENCE: "{{hello}} {{person}}!",
                        TEST:      "[[ REFERENCE: = text, person = world ]]",
                    });
                    JasminePromise.flush();

                    let translation = translator.instant("TEST", {
                        text: { hello: "Hello" },
                        world: "world",
                    });

                    expect(translation).toBe("Hello world!");
                }));
            });

            describe("interpolation of pipes", () => {
                it("parses expression and sends parsed content to pipe", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        TEST: "{{varA|uppercase}}",
                    });
                    JasminePromise.flush();
                    let uppercasePipe: UpperCasePipe = TestBed.get(UpperCasePipe);
                    spyOn(uppercasePipe, "transform").and.returnValue("transformed");

                    let translation = translator.instant("TEST", { varA: "anything" });

                    expect(uppercasePipe.transform).toHaveBeenCalledWith("anything");
                }));

                it("throws an error when pipe does not exist", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        TEST: "{{varA|non-existing}}",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error");

                    let translation = translator.instant("TEST", { varA: "anything" });

                    expect(translateLogHandler.error).toHaveBeenCalledWith(new Error("Pipe non-existing unknown"));
                }));

                it("parses and provides arguments for pipes", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        TEST: "{{'string'|uppercase:varA:varB}}",
                    });
                    JasminePromise.flush();
                    let uppercasePipe: UpperCasePipe = TestBed.get(UpperCasePipe);
                    spyOn(uppercasePipe, "transform").and.returnValue("transformed");

                    let translation = translator.instant("TEST", { varA: "anything", varB: "something" });

                    expect(uppercasePipe.transform).toHaveBeenCalledWith("string", "anything", "something");
                }));

                it("allows colons in arguments for pipes", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        TEST: "{{'2014-01-01 23:21:25'|date:'HH:mm'}}",
                    });
                    JasminePromise.flush();
                    let datePipe: DatePipe = TestBed.get(DatePipe);
                    spyOn(datePipe, "transform").and.returnValue("transformed");

                    let translation = translator.instant("TEST");

                    expect(datePipe.transform).toHaveBeenCalledWith("2014-01-01 23:21:25", "HH:mm");
                }));

                it("throws an error when pipe arguments invalid", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        TEST: "{{ varA|uppercase:'unparsable }}",
                    });
                    JasminePromise.flush();
                    spyOn(translateLogHandler, "error");

                    let translation = translator.instant("TEST", { varA: "anything" });

                    expect(translateLogHandler.error).toHaveBeenCalledWith(jasmine.any(Error));
                }));

                it("calls pipe without params when args can't be parsed", fakeAsync(() => {
                    translator.waitForTranslation();
                    loaderPromiseResolve({
                        TEST: "{{ varA|uppercase:'unparsable }}",
                    });
                    JasminePromise.flush();
                    let uppercasePipe: UpperCasePipe = TestBed.get(UpperCasePipe);
                    spyOn(uppercasePipe, "transform").and.returnValue("transformed");

                    let translation = translator.instant("TEST", { varA: "anything" });

                    expect(uppercasePipe.transform).toHaveBeenCalledWith("anything");
                }));
            });
        });
    });

    describe("Translator module", () => {
        let translator: Translator;
        let translatorConfig: TranslatorConfig;
        let translationLoader: TranslationLoader;
        let translateLogHandler: TranslateLogHandler;
        let loaderPromiseResolve: (...params: any[]) => void;
        let loaderPromiseReject: (reason?: string) => void;

        beforeEach(() => {
            translatorConfig = new TranslatorConfig(new TranslateLogHandlerMock(), {
                loader: TranslationLoaderMock,
                providedLanguages: [ "en", "de" ],
                detectLanguage: false,
            });
            TestBed.configureTestingModule({
                providers: [
                    { provide: TranslatorConfig, useValue: translatorConfig},
                    { provide: TranslationLoaderMock, useValue: new TranslationLoaderMock() },
                    { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
                    TranslatorContainer,
                ],
            });

            translationLoader = TestBed.get(TranslationLoaderMock);
            translateLogHandler = TestBed.get(TranslateLogHandler);
            translator = new Translator("test", TestBed.get(Injector));

            spyOn(translationLoader, "load").and.returnValue(new Promise<object>((resolve, reject) => {
                loaderPromiseResolve = resolve;
                loaderPromiseReject = reject;
            }));

            PromiseMatcher.install();
        });

        afterEach(() => {
            PromiseMatcher.uninstall();
        });

        it("informs about missing translation", () => {
            spyOn(translateLogHandler, "info");

            translator.instant("UNDEFINED");

            expect(translateLogHandler.info)
                .toHaveBeenCalledWith("Translation for 'UNDEFINED' in module 'test' and language en not found");
        });

        it("informs about language changes", () => {
            spyOn(translateLogHandler, "info");

            translator.language = "de";

            expect(translateLogHandler.info)
                .toHaveBeenCalledWith("Language changed to de in module 'test'");
        });

        it("informs about non provided language", () => {
            spyOn(translateLogHandler, "error");

            let translation = translator.instant("TEXT", {}, "ru");

            expect(translateLogHandler.error)
                .toHaveBeenCalledWith("Language ru not provided in module 'test'");
        });

        it("informs about loaded language", fakeAsync(() => {
            spyOn(translateLogHandler, "info");

            translator.waitForTranslation();
            loaderPromiseResolve();
            JasminePromise.flush();

            expect(translateLogHandler.info)
                .toHaveBeenCalledWith("Language en for module 'test' got loaded");
        }));

        it("shows error when language could not be loaded", fakeAsync(() => {
            spyOn(translateLogHandler, "error");

            translator.waitForTranslation();
            loaderPromiseReject("File not found");
            JasminePromise.flush();

            expect(translateLogHandler.error)
                .toHaveBeenCalledWith("Language en for module 'test' could not be loaded (File not found)");
        }));
    });
});
