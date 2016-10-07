import {
    TRANSLATE_PROVIDERS,
    TranslateConfig,
    TranslateLoader,
    TranslateLogHandler,
    TranslateService,
    TranslatorModule,
} from "../angular2-translator";

import {JasmineHelper}                  from "./helper/JasmineHelper";
import {TranslateLoaderMock}            from "./helper/TranslateLoaderMock";
import {JasminePromise, PromiseMatcher} from "./helper/promise-matcher";
import {ReflectiveInjector}             from "@angular/core";
import {TestBed, fakeAsync}             from "@angular/core/testing";
import {HttpModule}                     from "@angular/http";
import {Observable}                     from "rxjs/Observable";

describe("TranslateService", function () {
    it("is defined", function () {
        expect(TranslateService).toBeDefined();
    });

    describe("constructor", function () {
        it("requires a TranslateConfig", function () {
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
            ]);

            let action = function () {
                injector.get(TranslateService);
            };

            // let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateConfig));
            // providerError.addKey(injector, ReflectiveKey.get(TranslateService));
            expect(action).toThrow();
        });

        it("requires a TranslateLoader", function () {
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
                { provide: TranslateConfig, useValue: new TranslateConfig({}) },
            ]);

            let action = function () {
                injector.get(TranslateService);
            };

            // let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateLoader));
            // providerError.addKey(injector, ReflectiveKey.get(TranslateService));
            expect(action).toThrow();
        });

        it("requires an TranslateLogHandler", function() {
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
                { provide: TranslateConfig, useValue: new TranslateConfig({}) },
                { provide: TranslateLoader, useValue: new TranslateLoaderMock() },
            ]);

            let action = function () {
                injector.get(TranslateService);
            };

            // let providerError = new NoProviderError(injector, ReflectiveKey.get(TranslateLogHandler));
            // providerError.addKey(injector, ReflectiveKey.get(TranslateService));
            expect(action).toThrow();
        });

        it("predfines providers for default config", function () {
            TestBed.configureTestingModule({imports: [TranslatorModule]});
            let translate: TranslateService;

            let action = function () {
                translate = TestBed.get(TranslateService);
            };

            expect(action).not.toThrow();
            // noinspection JSUnusedAssignment
            expect(translate instanceof TranslateService).toBeTruthy();
        });

        it("sets current lang to default lang", function () {
            TestBed.configureTestingModule({imports: [TranslatorModule]});

            let translate: TranslateService = TestBed.get(TranslateService);

            expect(translate.lang).toBe("en");
        });

        it("detects language automatically on start", function() {
            let translateConfig = new TranslateConfig({
                providedLangs: [ "en", "de" ],
            });
            translateConfig.navigatorLanguages = ["de-DE", "de", "en-US", "en"];

            TestBed.configureTestingModule({
                imports: [TranslatorModule],
                providers: [
                    { provide: TranslateConfig, useValue: translateConfig },
                ],
            });

            let translate: TranslateService = TestBed.get(TranslateService);

            expect(translate.lang).toBe("de");
        });

        it("informs about detected language", function() {
            let translateConfig = new TranslateConfig({
                providedLangs: [ "en", "de" ],
            });
            translateConfig.navigatorLanguages = ["de-DE", "de", "en-US", "en"];
            spyOn(TranslateLogHandler, "info");

            TestBed.configureTestingModule({
                imports: [TranslatorModule],
                providers: [
                    { provide: TranslateConfig, useValue: translateConfig },
                ],
            });

            TestBed.get(TranslateService);

            expect(TranslateLogHandler.info).toHaveBeenCalledWith("Language de got detected");
        });
    });

    describe("instance", function () {
        let translateConfig: TranslateConfig = new TranslateConfig({});
        let translate: TranslateService;
        let loader: TranslateLoader;

        beforeEach(function () {
            translateConfig.providedLangs = ["en"];
            translateConfig.defaultLang = "en";

            TestBed.configureTestingModule({
                imports: [TranslatorModule],
                providers: [
                    { provide: TranslateConfig, useValue: translateConfig },
                ],
            });

            translate = TestBed.get(TranslateService);
            loader    = TestBed.get(TranslateLoader);
            translate.logHandler.error = (msg) => { console.error(msg); };
            PromiseMatcher.install();
        });

        afterEach(function() {
            PromiseMatcher.uninstall();
        });

        describe("detect language", function () {
            let mockNavigator: any;

            beforeEach(function () {
                mockNavigator = {};
            });

            it("detects language", function () {
                translateConfig.providedLangs = ["bm", "en"];

                let detectedLang = translate.detectLang(["bm"]);

                expect(detectedLang).toBe("bm");
            });

            it("detects only languages that are provided", function () {
                translateConfig.providedLangs = ["en"];

                let detectedLang = translate.detectLang(["bm"]);

                expect(detectedLang).toBeFalsy();
            });

            it("using config.langProvided for checking", function () {
                spyOn(translateConfig, "langProvided");

                translate.detectLang(["bm"]);

                expect(translateConfig.langProvided).toHaveBeenCalledWith("bm");
            });

            it("rather takes direct matches", function () {
                translateConfig.providedLangs = [ "de-DE", "de-AT" ];

                let detectedLang = translate.detectLang(["de-CH", "de-AT"]);

                expect(detectedLang).toBe("de-AT");
            });
        });

        describe("change language", function () {
            it("checks that language is provided using strict checking", function () {
                spyOn(translateConfig, "langProvided").and.callThrough();

                translate.lang = "en" ;

                expect(translateConfig.langProvided).toHaveBeenCalledWith("en", true);
            });

            it("sets current language to the provided language", function () {
                translateConfig.providedLangs = [ "de/de" ];

                translate.lang = "de-DE";

                expect(translate.lang).toBe("de/de");
            });

            it("throws error if language is not provided", function () {
                translateConfig.providedLangs = ["de/de"];

                let action = function() {
                    translate.lang = "de";
                };

                expect(action).toThrow(new Error("Language not provided"));
            });

            it("has an observable", function() {
                expect(translate.languageChanged instanceof Observable).toBe(true);
            });

            it("gives the next value to the observable", function() {
                translateConfig.providedLangs = ["en", "de"];
                let newLang: string;
                translate.languageChanged.subscribe(function(nextLang) {
                    newLang = nextLang;
                });

                translate.lang = "de";

                // noinspection JSUnusedAssignment
                expect(newLang).toBe("de");
            });

            it("informs about language change", function() {
                spyOn(TranslateLogHandler, "info");
                translateConfig.providedLangs = [ "de/de" ];

                translate.lang = "de-DE";

                expect(TranslateLogHandler.info).toHaveBeenCalledWith("Language changed to de/de");
            });
        });

        describe("waiting for translation", function () {
            let loaderPromiseResolve: Function;
            let loaderPromiseReject: Function;

            beforeEach(function() {
                spyOn(loader, "load").and.returnValue(new Promise<Object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it("returns a promise", function () {
                let promise = translate.waitForTranslation();

                expect(promise instanceof Promise).toBeTruthy();
            });

            it("starts loading the current language", function () {
                translate.waitForTranslation();

                expect(loader.load).toHaveBeenCalledWith("en");
            });

            it("resolves when loader resolves", fakeAsync(function() {
                let promise = translate.waitForTranslation();

                loaderPromiseResolve({ "TEXT": "This is a text" });
                JasminePromise.flush();

                expect(promise).toBeResolved();
            }));

            it("rejects when loader rejects", fakeAsync(function() {
                TranslateLogHandler.error = () => {};
                let promise = translate.waitForTranslation();

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeRejected();
            }));

            it("loads a language only once", function() {
                translate.waitForTranslation();
                translate.waitForTranslation();

                expect(JasmineHelper.calls(loader.load).count()).toBe(1);
            });

            it("returns the already resolved promise", fakeAsync(function() {
                let firstPromise = translate.waitForTranslation();
                loaderPromiseResolve({ "TEXT": "This is a text" });
                JasminePromise.flush();

                let secondPromise = translate.waitForTranslation();

                expect(secondPromise).toBeResolved();
                expect(secondPromise).toBe(firstPromise);
            }));

            it("loads given language", function() {
                translateConfig.providedLangs = ["en", "de"];

                translate.waitForTranslation("de");

                expect(loader.load).toHaveBeenCalledWith("de");
            });

            it("checks if the language is provided", function() {
                spyOn(translateConfig, "langProvided");

                translate.waitForTranslation("de");

                expect(translateConfig.langProvided).toHaveBeenCalledWith("de", true);
            });

            it("rejects if the language is not provided", function() {
                let promise = translate.waitForTranslation("de");

                expect(promise).toBeRejectedWith("Language not provided");
            });

            it("informs about loaded language", fakeAsync(function() {
                spyOn(TranslateLogHandler, "info");

                translate.waitForTranslation();
                loaderPromiseResolve();
                JasminePromise.flush();

                expect(TranslateLogHandler.info).toHaveBeenCalledWith("Language en got loaded");
            }));

            it("shows error when language could not be loaded", fakeAsync(function() {
                spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                translate.waitForTranslation();
                loaderPromiseReject("File not found");
                JasminePromise.flush();

                expect(TranslateLogHandler.error)
                    .toHaveBeenCalledWith("Language en could not be loaded (File not found)");
            }));
        });

        describe("translate", function() {
            let loaderPromiseResolve: Function;
            let loaderPromiseReject: Function;

            beforeEach(function() {
                spyOn(loader, "load").and.returnValue(new Promise<Object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it("loads the current language", function() {
                translate.translate("TEXT");

                expect(loader.load).toHaveBeenCalledWith("en");
            });

            it("loads the given language", function() {
                translateConfig.providedLangs = ["en", "de"];

                translate.translate("TEXT", {}, "de");

                expect(loader.load).toHaveBeenCalledWith("de");
            });

            it("checks if the language is provided", function() {
                spyOn(translateConfig, "langProvided");

                translate.translate("TEXT", {}, "de");

                expect(translateConfig.langProvided).toHaveBeenCalledWith("de", true);
            });

            // current language got checked before
            it("does not check current language", function() {
                spyOn(translateConfig, "langProvided");

                translate.translate("TEXT");

                expect(translateConfig.langProvided).not.toHaveBeenCalled();
            });

            it("loads a language only once", function() {
                translate.translate("TEXT");
                translate.translate("OTHER_TEXT");

                expect(JasmineHelper.calls(loader.load).count()).toBe(1);
            });

            it("resolves keys if language is not provided", function() {
                let promise = translate.translate("TEXT", {}, "de");

                expect(promise).toBeResolvedWith("TEXT");
            });

            it("resolves keys if laguage could not be loaded", fakeAsync(function() {
                TranslateLogHandler.error = () => {};
                let promise                = translate.translate(["TEXT", "OTHER_TEXT"]);

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeResolvedWith(["TEXT", "OTHER_TEXT"]);
            }));

            it("uses instant to translate after loader resolves", fakeAsync(function() {
                spyOn(translate, "instant");
                translate.translate("TEXT");

                loaderPromiseResolve({"TEXT": "This is a text"});
                JasminePromise.flush();

                expect(translate.instant).toHaveBeenCalledWith("TEXT", {}, translate.lang);
            }));

            it("resolves with the return value from instant", fakeAsync(function() {
                spyOn(translate, "instant").and.returnValue("This is a text");
                let promise = translate.translate("TEXT");

                loaderPromiseResolve({"TEXT": "This is a text"});

                expect(promise).toBeResolvedWith("This is a text");
            }));
        });

        describe("instant", function() {
            // noinspection JSUnusedLocalSymbols
            let loaderPromiseResolve: Function = (t: Object) => {};

            beforeEach(fakeAsync(function() {
                spyOn(loader, "load").and.returnValue(new Promise<Object>((resolve) => {
                    loaderPromiseResolve = resolve;
                }));

                // loaderPromiseResolve({
                //     BROKEN: 'This "{{notExisting.func()}}" is empty string',
                //     CALL: "You don\'t know {{privateVar}} but [[HACK:givenVar]]",
                //     GREETING: "Hello [[SALUTATION:name=user]]!",
                //     HACK: "{{privateVar}}{{givenVar}}",
                //     HACKED: "Context: {{context}}",
                //     INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                //     SALUTATION: "{{name.title ? name.title + ' ' : (name.gender === 'w' ? 'Ms.' : 'Mr.')}}" +
                //                 "{{name.first}} {{name.last}}",
                //     TEXT: "This is a text",
                //     VARIABLES_OUT: "Hello {{name.first}} {{name.title ? name.title + ' ' : ''}}{{name.last}}",
                //     VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                //     WELCOME: "Welcome{{lastLogin ? ' back' : ''}} [[SALUTATION:name]]!" +
                //              "{{lastLogin ? ' Your last login was on ' + lastLogin : ''}}",
                // });
            }));

            it("returns keys if language is not loaded", function() {
                let translation = translate.instant("TEXT", {}, "de");

                expect(translation).toBe("TEXT");
            });

            it("returns keys if translation not found", function() {
                translate.waitForTranslation();
                loaderPromiseResolve({});

                let translations = translate.instant(["SOME_TEXT", "OTHER_TEXT"]);

                expect(translations).toEqual(["SOME_TEXT", "OTHER_TEXT"]);
            });

            it("returns interpolated text", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                    VARIABLES_OUT: "Hello {{name.first}} {{name.title ? name.title + ' ' : ''}}{{name.last}}",
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();

                let translations = translate.instant([
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

            it("catches parse errors in translations", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    BROKEN: 'This "{{notExisting.func()}}" is empty string',
                });
                JasminePromise.flush();
                TranslateLogHandler.error = () => {};

                let translation = translate.instant("BROKEN");

                expect(translation).toBe('This "" is empty string');
            }));

            describe("referenced translations", function() {
                it("removes valid translation references", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "WELCOME": "Welcome [[]]!",
                    });
                    JasminePromise.flush();
                    TranslateLogHandler.error = () => {};

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                }));

                it("logs an error if reference has no key", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "WELCOME": "Welcome [[]]!",
                        "HELLO": "Hello [[:]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected key in '[[]]'"
                    );

                    JasmineHelper.calls(TranslateLogHandler.error).reset();

                    translation = translate.instant("HELLO");

                    expect(translation).toBe("Hello !");
                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 3 expected key in '[[:]]'"
                    );
                }));

                it("reads the key after opening brackets", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "WELCOME": "Welcome [[A]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "info").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome A!");
                    expect(TranslateLogHandler.info).toHaveBeenCalledWith(
                        "Translation for 'A' in language en not found"
                    );
                }));

                it("ignores spaces before key", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "WELCOME": "Welcome [[ \t\n]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected key in '[[ \t\n]]'"
                    );
                }));

                it("key is finish after space character", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "WELCOME": "Welcome [[ A B ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 6 expected colon or end in '[[ A B ]]'"
                    );
                }));

                it("key can have more than one character", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "WELCOME": "Welcome [[ ABC ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome ABC!");
                }));

                it("expects a parameter after colon", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T :. ]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 7 expected parameter in " +
                        "'[[ T :. ]]'"
                    );
                }));

                it("ignores spaces after colon", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : ]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : ]]'"
                    );
                }));

                it("key can not have comma, equal sign, or colon", fakeAsync(function() {
                    // for key is allowed [A-Za-z0-9_.-] not [,=:]
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T, ]]!",
                        "B": "[[ T= ]]!",
                        "C": "[[ T: ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 5 expected colon or end in '[[ T, ]]'"
                    );

                    JasmineHelper.calls(TranslateLogHandler.error).reset();

                    translate.instant("B");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 5 expected colon or end in '[[ T= ]]'"
                    );

                    JasmineHelper.calls(TranslateLogHandler.error).reset();

                    translate.instant("C");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in '[[ T: ]]'"
                    );
                }));

                it("waits for parameters after colon", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in '[[ T : ]]'"
                    );
                }));

                it("reads the parameter key passes this parameter to referenced translation", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : a]]",
                        "T": "{{a}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("A", { a: "Hello world!" });

                    expect(translation).toBe("Hello world!");
                }));

                it("transports only variables defined to subtranslations", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        CALL: "You don\'t know {{privateVar}} but [[HACK:givenVar]]",
                        HACK: "{{privateVar}}{{givenVar}}",
                    });
                    JasminePromise.flush();
                    TranslateLogHandler.error = () => {};

                    let translation = translate.instant("CALL", {
                        givenVar:   "given",
                        privateVar: "private",
                    });

                    expect(translation).toBe("You don\'t know private but given");
                }));

                it("throws an error for illegal parameter characters", fakeAsync(function() {
                    // for parameter is allowed [A-Za-z0-9_] not [.,=:-]
                    let translations = {
                        "A": "[[ T : a.]]",
                        "B": "[[ T : a:]]",
                        "C": "[[ T : a-]]",
                        "D": "[[ T : a,]]",
                        "E": "[[ T : a=]]",
                    };
                    translate.waitForTranslation();
                    loaderPromiseResolve(translations);
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    for (let key in translations) {
                        if (!translations.hasOwnProperty(key)) {
                            continue;
                        }
                        JasmineHelper.calls(TranslateLogHandler.error).reset();

                        translate.instant(key);

                        if ([ "A", "B", "C" ].indexOf(key) > -1) {
                            // unexpected character for [.:-]
                            expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected character at pos 9 expected comma, equal sign or end in " +
                                "'" + translations[key] + "'"
                            );
                        } else if (key === "D") {
                            // unexpected end expected parameter for [,]
                            expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected end expected parameter in '" + translations[key] + "'"
                            );
                        } else if (key === "E") {
                            // unexpected end expected parameter for [=]
                            expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected end expected getter in '" + translations[key] + "'"
                            );
                        }
                    }
                }));

                it("stops param reading after space", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo bar ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 12 expected comma, equal sign or end in " +
                        "'[[ T : foo bar ]]'"
                    );
                }));

                it("expects comma after reading param key", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : a , ]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : a , ]]'"
                    );
                }));

                it("waits for a getter after equal sign", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo =]]!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected getter in " +
                        "'[[ T : foo =]]'"
                    );
                }));

                it("transports variables under different names", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        GREETING:   "Hello [[SALUTATION:name=u]]!",
                        SALUTATION: "{{name.title ? name.title + ' ' : (name.gender === 'w' ? 'Ms.' : 'Mr.')}}" +
                                    "{{name.first}} {{name.last}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("GREETING", {
                        u: {
                            first: "Jane",
                            gender: "w",
                            last: "Doe",
                            title: "Dr.",
                        },
                    });

                    expect(translation).toBe("Hello Dr. Jane Doe!");
                }));

                it("throws error if getter begins with illegal character", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo ==]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 13 expected getter in " +
                        "'[[ T : foo ==]]'"
                    );
                }));

                it("ignores space in front of getter", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo = ]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected getter in " +
                        "'[[ T : foo = ]]'"
                    );
                }));

                it("continues reading getter", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo = ab]]",
                        "T": "{{foo}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("A", {ab: "Hello world!"});

                    expect(translation).toBe("Hello world!");
                }));

                it("throws error if getter contains illegal character", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo = a=]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 15 expected comma or end in " +
                        "'[[ T : foo = a=]]'"
                    );
                }));

                it("stops reading getter after space", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo = a a]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 16 expected comma or end in " +
                        "'[[ T : foo = a a]]'"
                    );
                }));

                it("waits for next parameter after comma", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo = a ,]]",
                        "B": "[[ T : foo = a,]]",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : foo = a ,]]'"
                    );

                    JasmineHelper.calls(TranslateLogHandler.error).reset();

                    translate.instant("B");

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : foo = a,]]'"
                    );
                }));

                it("ignores spaces after reading getter", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : foo = ab  ]]",
                        "T": "{{foo}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("A", {ab: "Hello world!"});

                    expect(translation).toBe("Hello world!");
                }));

                it("transports multiple parameters", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : h,a  ]]",
                        "B": "[[ T : h ,b  ]]",
                        "C": "[[ T : h=h,c  ]]",
                        "D": "[[ T : h=h ,d  ]]",
                        "T": "{{h}} {{a}}{{b}}{{c}}{{d}}!",
                    });
                    JasminePromise.flush();
                    TranslateLogHandler.error = () => {};

                    let translations = translate.instant(
                        [ "A", "B", "C", "D" ],
                        { a: "A", b: "B", c: "C", d: "D", h: "Hello" }
                    );

                    expect(translations[0]).toBe("Hello A!");
                    expect(translations[1]).toBe("Hello B!");
                    expect(translations[2]).toBe("Hello C!");
                    expect(translations[3]).toBe("Hello D!");
                }));

                it("gets deep objects", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "NEW_COMMENT": "New comment from [[ SALUTATION : name = comment.author ]].",
                        "SALUTATION": "{{name.title ? name.title : (name.gender === 'w' ? 'Ms.' : 'Mr.')}} " +
                                      "{{name.first}} {{name.last}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("NEW_COMMENT", {
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

                it("provides the object under getter for params", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "NEW_COMMENT": "New comment from [[ SALUTATION : = comment.author ]].",
                        "SALUTATION": "{{title ? title : (gender === 'w' ? 'Mrs.' : 'Mr.')}} " +
                        "{{first}} {{last}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("NEW_COMMENT", {
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

                it("accepts only objects for params", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : = a ]]",
                        "T": "Hello {{who}}!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("A", { a: "string" });

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Only objects can be passed as params in " +
                        "'[[ T : = a ]]'"
                    );
                    expect(translation).toBe("Hello !");
                }));

                it("accepts only first parameter without key", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "A": "[[ T : b , = a ]]",
                        "T": "Hello {{who}}!",
                    });
                    JasminePromise.flush();
                    spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("A", {
                        a: {},
                        b: "string",
                    });

                    expect(TranslateLogHandler.error).toHaveBeenCalledWith(
                        "Parse error only first parameter can be passed as params in " +
                        "'[[ T : b , = a ]]'"
                    );
                    expect(translation).toBe("");
                }));

                it("second parameter got added to the object", fakeAsync(function() {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        "TEST":      "[[ REFERENCE: = text, person = world ]]",
                        "REFERENCE": "{{hello}} {{person}}!",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("TEST", {
                        text: { hello: "Hello" },
                        world: "world",
                    });

                    expect(translation).toBe("Hello world!");
                }));
            });

            it("informs about missing translation", function() {
                spyOn(TranslateLogHandler, "info");

                translate.instant("UNDEFINED");

                expect(TranslateLogHandler.info)
                    .toHaveBeenCalledWith("Translation for \'UNDEFINED\' in language en not found");
            });

            it("shows error when parsing throws error", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    BROKEN: 'This "{{notExisting.func()}}" is empty string',
                });
                JasminePromise.flush();
                spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                translate.instant("BROKEN");

                expect(TranslateLogHandler.error)
                    .toHaveBeenCalledWith("Parsing error for expression \'{{notExisting.func()}}\'");

            }));

            it("can not get __context as parameter", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                translate.instant("INTERPOLATION", {__context: "at work"});

                expect(TranslateLogHandler.error).toHaveBeenCalledWith("Parameter \'__context\' is not allowed.");
            }));

            it("can not get numeric keys in parameter", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                translate.instant("INTERPOLATION", {
                    42: "the answer",
                });

                expect(TranslateLogHandler.error).toHaveBeenCalledWith("Parameter \'42\' is not allowed.");
            }));

            it("continues with other parameters after __context", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();
                TranslateLogHandler.error = () => {};

                let translation = translate.instant("VARIABLES_TEST", {__context: "at work", count: 6});

                expect(translation).toBe("This is interesting");
            }));

            it("continues with other parameters after numeric", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();
                TranslateLogHandler.error = () => {};

                let translation = translate.instant("VARIABLES_TEST", {42: "the answer", count: 6});

                expect(translation).toBe("This is interesting");
            }));

            it("ignores array as parameters", fakeAsync(function() {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(TranslateLogHandler, "error").and.callFake(() => {});

                let translation = translate.instant("INTERPOLATION", [1, 2, 3]);

                expect(translation).toBe("The sum from 1+2 is 3");
                expect(TranslateLogHandler.error).toHaveBeenCalledWith("Parameters can not be an array.");
            }));
        });
    });
});
