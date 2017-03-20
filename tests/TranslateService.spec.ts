import {
    TranslateConfig,
    TranslateLoader,
    TranslateLoaderJson,
    TranslateLogHandler,
    TranslateService,
    TranslatorModule,
} from "../index";

import {
    TranslateLoaderMock,
    TranslateLogHandlerMock,
} from "./helper/TranslatorMocks";

import {JasmineHelper}                  from "./helper/JasmineHelper";
import {JasminePromise, PromiseMatcher} from "./helper/promise-matcher";
import {ReflectiveInjector}             from "@angular/core";
import {TestBed, fakeAsync}             from "@angular/core/testing";
import {Observable}                     from "rxjs/Observable";

describe("TranslateService", function () {
    it("is defined", function () {
        expect(TranslateService).toBeDefined();
    });

    describe("constructor", function () {
        it("requires a TranslateConfig", function () {
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
                { provide: TranslateLogHandler, useClass: TranslateLogHandlerMock },
            ]);

            let action = function () {
                try {
                    injector.get(TranslateService);
                } catch (e) {
                    expect(e.message).toBe(
                        "No provider for TranslateConfig! (TranslateService -> TranslateConfig)"
                    );
                    throw e;
                }
            };
            expect(action).toThrow();
        });

        it("requires an TranslateLogHandler", () => {
            let injector = ReflectiveInjector.resolveAndCreate([
                TranslateService,
                TranslateLoaderMock,
                { provide: TranslateConfig, useValue: new TranslateConfig({
                    loader: TranslateLoaderMock,
                }) },
            ]);

            let action = function () {
                try {
                    injector.get(TranslateService);
                } catch (e) {
                    expect(e.message).toBe(
                        "No provider for TranslateLogHandler! (TranslateService -> TranslateLogHandler)"
                    );
                    throw e;
                }
            };
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

        it("detects language automatically on start", () => {
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

        it("does not detect language on start by configuration", () => {
            let translateConfig = new TranslateConfig({
                detectLanguageOnStart: false,
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

            expect(translate.lang).toBe("en");
        });

        it("informs about detected language", () => {
            let translateConfig = new TranslateConfig({
                providedLangs: [ "en", "de" ],
            });
            translateConfig.navigatorLanguages = ["de-DE", "de", "en-US", "en"];
            let logHandler = new TranslateLogHandler();
            spyOn(logHandler, "info");

            TestBed.configureTestingModule({
                imports: [TranslatorModule],
                providers: [
                    { provide: TranslateConfig, useValue: translateConfig },
                    { provide: TranslateLogHandler, useValue: logHandler },
                ],
            });

            TestBed.get(TranslateService);

            expect(logHandler.info).toHaveBeenCalledWith("Language de got detected");
        });
    });

    describe("instance", function () {
        let translateConfig: TranslateConfig = new TranslateConfig({});
        let translate: TranslateService;
        let loader: TranslateLoader;

        beforeEach(function () {
            translateConfig.providedLangs = ["en", "de"];
            translateConfig.defaultLang = "en";
            translateConfig.detectLanguageOnStart = false;

            TestBed.configureTestingModule({
                imports: [TranslatorModule],
                providers: [
                    { provide: TranslateConfig, useValue: translateConfig },
                ],
            });

            translate = TestBed.get(TranslateService);
            loader    = TestBed.get(TranslateLoaderJson);
            translate.logHandler.error = (msg) => { console.error(msg); };
            PromiseMatcher.install();
        });

        afterEach(() => {
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

            it("stops when language got found", function() {
                translateConfig.providedLangs = [ "de-DE", "en-US" ];
                spyOn(translateConfig, "langProvided").and.callThrough();

                translate.detectLang(["de", "en"]);

                expect(translateConfig.langProvided).not.toHaveBeenCalledWith("en");
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

                let action = () => {
                    translate.lang = "de";
                };

                expect(action).toThrow(new Error("Language not provided"));
            });

            it("has an observable", () => {
                expect(translate.languageChanged instanceof Observable).toBe(true);
            });

            it("gives the next value to the observable", () => {
                translateConfig.providedLangs = ["en", "de"];
                let newLang: string;
                translate.languageChanged.subscribe(function(nextLang) {
                    newLang = nextLang;
                });

                translate.lang = "de";

                // noinspection JSUnusedAssignment
                expect(newLang).toBe("de");
            });

            it("informs about language change", () => {
                spyOn(translate.logHandler, "info");
                translateConfig.providedLangs = [ "de/de" ];

                translate.lang = "de-DE";

                expect(translate.logHandler.info).toHaveBeenCalledWith("Language changed to de/de");
            });
        });

        describe("waiting for translation", function () {
            let loaderPromiseResolve: Function;
            let loaderPromiseReject: Function;

            beforeEach(() => {
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

            it("resolves when loader resolves", fakeAsync(() => {
                let promise = translate.waitForTranslation();

                loaderPromiseResolve({ TEXT: "This is a text" });
                JasminePromise.flush();

                expect(promise).toBeResolved();
            }));

            it("rejects when loader rejects", fakeAsync(() => {
                translate.logHandler.error = () => {};
                let promise = translate.waitForTranslation();

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeRejected();
            }));

            it("loads a language only once", () => {
                translate.waitForTranslation();
                translate.waitForTranslation();

                expect(JasmineHelper.calls(loader.load).count()).toBe(1);
            });

            it("returns the already resolved promise", fakeAsync(() => {
                let firstPromise = translate.waitForTranslation();
                loaderPromiseResolve({ TEXT: "This is a text" });
                JasminePromise.flush();

                let secondPromise = translate.waitForTranslation();

                expect(secondPromise).toBeResolved();
                expect(secondPromise).toBe(firstPromise);
            }));

            it("loads given language", () => {
                translateConfig.providedLangs = ["en", "de"];

                translate.waitForTranslation("de");

                expect(loader.load).toHaveBeenCalledWith("de");
            });

            it("checks if the language is provided", () => {
                spyOn(translateConfig, "langProvided");

                translate.waitForTranslation("de");

                expect(translateConfig.langProvided).toHaveBeenCalledWith("de", true);
            });

            it("rejects if the language is not provided", () => {
                let promise = translate.waitForTranslation("ru");

                expect(promise).toBeRejectedWith("Language ru not provided");
            });

            it("informs about loaded language", fakeAsync(() => {
                spyOn(translate.logHandler, "info");

                translate.waitForTranslation();
                loaderPromiseResolve();
                JasminePromise.flush();

                expect(translate.logHandler.info).toHaveBeenCalledWith("Language en got loaded");
            }));

            it("shows error when language could not be loaded", fakeAsync(() => {
                spyOn(translate.logHandler, "error").and.callFake(() => {});

                translate.waitForTranslation();
                loaderPromiseReject("File not found");
                JasminePromise.flush();

                expect(translate.logHandler.error)
                    .toHaveBeenCalledWith("Language en could not be loaded (File not found)");
            }));
        });

        describe("translate", () => {
            let loaderPromiseResolve: Function;
            let loaderPromiseReject: Function;

            beforeEach(() => {
                spyOn(loader, "load").and.returnValue(new Promise<Object>((resolve, reject) => {
                    loaderPromiseResolve = resolve;
                    loaderPromiseReject = reject;
                }));
            });

            it("loads the current language", () => {
                translate.translate("TEXT");

                expect(loader.load).toHaveBeenCalledWith("en");
            });

            it("loads the given language", () => {
                translateConfig.providedLangs = ["en", "de"];

                translate.translate("TEXT", {}, "de");

                expect(loader.load).toHaveBeenCalledWith("de");
            });

            it("checks if the language is provided", () => {
                spyOn(translateConfig, "langProvided");

                translate.translate("TEXT", {}, "de");

                expect(translateConfig.langProvided).toHaveBeenCalledWith("de", true);
            });

            // current language got checked before
            it("does not check current language", () => {
                spyOn(translateConfig, "langProvided");

                translate.translate("TEXT");

                expect(translateConfig.langProvided).not.toHaveBeenCalled();
            });

            it("loads a language only once", () => {
                translate.translate("TEXT");
                translate.translate("OTHER_TEXT");

                expect(JasmineHelper.calls(loader.load).count()).toBe(1);
            });

            it("resolves keys if language is not provided", () => {
                let promise = translate.translate("TEXT", {}, "ru");

                expect(promise).toBeResolvedWith("TEXT");
            });

            it("resolves keys if laguage could not be loaded", fakeAsync(() => {
                translate.logHandler.error = () => {};
                let promise                = translate.translate(["TEXT", "OTHER_TEXT"]);

                loaderPromiseReject();
                JasminePromise.flush();

                expect(promise).toBeResolvedWith(["TEXT", "OTHER_TEXT"]);
            }));

            it("uses instant to translate after loader resolves", fakeAsync(() => {
                spyOn(translate, "instant");
                translate.translate("TEXT");

                loaderPromiseResolve({TEXT: "This is a text"});
                JasminePromise.flush();

                expect(translate.instant).toHaveBeenCalledWith("TEXT", {}, translate.lang);
            }));

            it("resolves with the return value from instant", fakeAsync(() => {
                spyOn(translate, "instant").and.returnValue("This is a text");
                let promise = translate.translate("TEXT");

                loaderPromiseResolve({TEXT: "This is a text"});

                expect(promise).toBeResolvedWith("This is a text");
            }));
        });

        describe("instant", () => {
            // noinspection JSUnusedLocalSymbols
            let loaderPromiseResolve: Function = (t: Object) => {};

            beforeEach(fakeAsync(() => {
                spyOn(loader, "load").and.callFake(() => {
                    return new Promise<Object>((resolve) => {
                        loaderPromiseResolve = resolve;
                    });
                });
            }));

            it("returns keys if language is not provided", () => {
                spyOn(translate.logHandler, "error");

                let translation = translate.instant("TEXT", {}, "ru");

                expect(translation).toBe("TEXT");
                expect(translate.logHandler.error).toHaveBeenCalledWith("Language ru not provided");
            });

            it("returns keys if translation not found", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({});
                JasminePromise.flush();

                let translations = translate.instant(["SOME_TEXT", "OTHER_TEXT"]);

                expect(translations).toEqual(["SOME_TEXT", "OTHER_TEXT"]);
            }));

            it("translates in different language", fakeAsync(() => {
                translate.waitForTranslation("de");
                loaderPromiseResolve({
                    HELLO_WORLD: "Hallo Welt!",
                });
                JasminePromise.flush();

                let translations = translate.instant("HELLO_WORLD", {}, "de");

                expect(translations).toEqual("Hallo Welt!");
            }));

            it("returns interpolated text", fakeAsync(() => {
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

            it("catches parse errors in translations", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    BROKEN: 'This "{{notExisting.func()}}" is empty string',
                });
                JasminePromise.flush();
                translate.logHandler.error = () => {};

                let translation = translate.instant("BROKEN");

                expect(translation).toBe('This "" is empty string');
            }));

            it("does not throw if variable is not existent", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    PROP: "{{another.one}}",
                    VAR: "{{something}}",
                });
                JasminePromise.flush();
                spyOn(translate.logHandler, "error");

                translate.instant(["VAR", "PROP"]);

                expect(translate.logHandler.error).not.toHaveBeenCalled();
            }));

            describe("referenced translations", () => {
                it("removes valid translation references", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[]]!",
                    });
                    JasminePromise.flush();
                    translate.logHandler.error = () => {};

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                }));

                it("logs an error if reference has no key", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        HELLO: "Hello [[:]]!",
                        WELCOME: "Welcome [[]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected key in '[[]]'"
                    );

                    JasmineHelper.calls(translate.logHandler.error).reset();

                    translation = translate.instant("HELLO");

                    expect(translation).toBe("Hello !");
                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 3 expected key in '[[:]]'"
                    );
                }));

                it("reads the key after opening brackets", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[A]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "info").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome A!");
                    expect(translate.logHandler.info).toHaveBeenCalledWith(
                        "Translation for 'A' in language en not found"
                    );
                }));

                it("ignores spaces before key", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ \t\n]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected key in '[[ \t\n]]'"
                    );
                }));

                it("allows dots in key", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        HELLO: "Hello [[ app.WORLD ]]!",
                        "app.WORLD": "World",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("HELLO");

                    expect(translation).toBe("Hello World!");
                }));

                it("key is finish after space character", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ A B ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 6 expected colon or end in '[[ A B ]]'"
                    );
                }));

                it("ignores other spaces before colon", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ A  B ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome !");
                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 7 expected colon or end in '[[ A  B ]]'"
                    );
                }));

                it("key can have more than one character", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        WELCOME: "Welcome [[ ABC ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("WELCOME");

                    expect(translation).toBe("Welcome ABC!");
                }));

                it("expects a parameter after colon", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T :. ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 7 expected parameter in " +
                        "'[[ T :. ]]'"
                    );
                }));

                it("ignores spaces after colon", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : ]]'"
                    );
                }));

                it("key can not have comma, equal sign, or colon", fakeAsync(() => {
                    // for key is allowed [A-Za-z0-9_.-] not [,=:]
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T, ]]!",
                        B: "[[ T= ]]!",
                        C: "[[ T: ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 5 expected colon or end in '[[ T, ]]'"
                    );

                    JasmineHelper.calls(translate.logHandler.error).reset();

                    translate.instant("B");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 5 expected colon or end in '[[ T= ]]'"
                    );

                    JasmineHelper.calls(translate.logHandler.error).reset();

                    translate.instant("C");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in '[[ T: ]]'"
                    );
                }));

                it("waits for parameters after colon", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in '[[ T : ]]'"
                    );
                }));

                it("reads the parameter key passes this parameter to referenced translation", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : a]]",
                        T: "{{a}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("A", { a: "Hello world!" });

                    expect(translation).toBe("Hello world!");
                }));

                it("transports only variables defined to subtranslations", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        CALL: "You don\'t know {{privateVar}} but [[HACK:givenVar]]",
                        HACK: "{{privateVar}}{{givenVar}}",
                    });
                    JasminePromise.flush();
                    translate.logHandler.error = () => {};

                    let translation = translate.instant("CALL", {
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
                    translate.waitForTranslation();
                    loaderPromiseResolve(translations);
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    for (let key in translations) {
                        if (!translations.hasOwnProperty(key)) {
                            continue;
                        }
                        JasmineHelper.calls(translate.logHandler.error).reset();

                        translate.instant(key);

                        if ([ "A", "B", "C" ].indexOf(key) > -1) {
                            // unexpected character for [.:-]
                            expect(translate.logHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected character at pos 9 expected comma, equal sign or end in " +
                                "'" + translations[key] + "'"
                            );
                        } else if (key === "D") {
                            // unexpected end expected parameter for [,]
                            expect(translate.logHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected end expected parameter in '" + translations[key] + "'"
                            );
                        } else if (key === "E") {
                            // unexpected end expected parameter for [=]
                            expect(translate.logHandler.error).toHaveBeenCalledWith(
                                "Parse error unexpected end expected getter in '" + translations[key] + "'"
                            );
                        }
                    }
                }));

                it("stops param reading after space", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo bar ]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 12 expected comma, equal sign or end in " +
                        "'[[ T : foo bar ]]'"
                    );
                }));

                it("expects comma after reading param key", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : a , ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : a , ]]'"
                    );
                }));

                it("waits for a getter after equal sign", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo =]]!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected getter in " +
                        "'[[ T : foo =]]'"
                    );
                }));

                it("transports variables under different names", fakeAsync(() => {
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

                it("throws error if getter begins with illegal character", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo ==]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 13 expected getter in " +
                        "'[[ T : foo ==]]'"
                    );
                }));

                it("ignores space in front of getter", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = ]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected getter in " +
                        "'[[ T : foo = ]]'"
                    );
                }));

                it("continues reading getter", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = ab]]",
                        T: "{{foo}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("A", {ab: "Hello world!"});

                    expect(translation).toBe("Hello world!");
                }));

                it("throws error if getter contains illegal character", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = a=]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 15 expected comma or end in " +
                        "'[[ T : foo = a=]]'"
                    );
                }));

                it("stops reading getter after space", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = a a]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected character at pos 16 expected comma or end in " +
                        "'[[ T : foo = a a]]'"
                    );
                }));

                it("waits for next parameter after comma", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = a ,]]",
                        B: "[[ T : foo = a,]]",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    translate.instant("A");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : foo = a ,]]'"
                    );

                    JasmineHelper.calls(translate.logHandler.error).reset();

                    translate.instant("B");

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error unexpected end expected parameter in " +
                        "'[[ T : foo = a,]]'"
                    );
                }));

                it("ignores spaces after reading getter", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : foo = ab  ]]",
                        T: "{{foo}}",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("A", {ab: "Hello world!"});

                    expect(translation).toBe("Hello world!");
                }));

                it("transports multiple parameters", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : h,a  ]]",
                        B: "[[ T : h ,b  ]]",
                        C: "[[ T : h=h,c  ]]",
                        D: "[[ T : h=h ,d  ]]",
                        T: "{{h}} {{a}}{{b}}{{c}}{{d}}!",
                    });
                    JasminePromise.flush();
                    translate.logHandler.error = () => {};

                    let translations = translate.instant(
                        [ "A", "B", "C", "D" ],
                        { a: "A", b: "B", c: "C", d: "D", h: "Hello" }
                    );

                    expect(translations[0]).toBe("Hello A!");
                    expect(translations[1]).toBe("Hello B!");
                    expect(translations[2]).toBe("Hello C!");
                    expect(translations[3]).toBe("Hello D!");
                }));

                it("gets deep objects", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        NEW_COMMENT: "New comment from [[ SALUTATION : name = comment.author ]].",
                        SALUTATION: "{{name.title ? name.title : (name.gender === 'w' ? 'Ms.' : 'Mr.')}} " +
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

                it("provides the object under getter for params", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        NEW_COMMENT: "New comment from [[ SALUTATION : = comment.author ]].",
                        SALUTATION: "{{title ? title : (gender === 'w' ? 'Mrs.' : 'Mr.')}} " +
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

                it("accepts only objects for params", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : = a ]]",
                        T: "Hello {{who}}!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("A", { a: "string" });

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Only objects can be passed as params in " +
                        "'[[ T : = a ]]'"
                    );
                    expect(translation).toBe("Hello !");
                }));

                it("accepts only first parameter without key", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        A: "[[ T : b , = a ]]",
                        T: "Hello {{who}}!",
                    });
                    JasminePromise.flush();
                    spyOn(translate.logHandler, "error").and.callFake(() => {});

                    let translation = translate.instant("A", {
                        a: {},
                        b: "string",
                    });

                    expect(translate.logHandler.error).toHaveBeenCalledWith(
                        "Parse error only first parameter can be passed as params in " +
                        "'[[ T : b , = a ]]'"
                    );
                    expect(translation).toBe("");
                }));

                it("second parameter got added to the object", fakeAsync(() => {
                    translate.waitForTranslation();
                    loaderPromiseResolve({
                        REFERENCE: "{{hello}} {{person}}!",
                        TEST:      "[[ REFERENCE: = text, person = world ]]",
                    });
                    JasminePromise.flush();

                    let translation = translate.instant("TEST", {
                        text: { hello: "Hello" },
                        world: "world",
                    });

                    expect(translation).toBe("Hello world!");
                }));
            });

            it("informs about missing translation", () => {
                spyOn(translate.logHandler, "info");

                translate.instant("UNDEFINED");

                expect(translate.logHandler.info)
                    .toHaveBeenCalledWith("Translation for \'UNDEFINED\' in language en not found");
            });

            it("shows error when parsing throws error", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    BROKEN: 'This "{{throw}}" is empty string',
                });
                JasminePromise.flush();
                spyOn(translate.logHandler, "error").and.callFake(() => {});

                translate.instant("BROKEN");

                expect(translate.logHandler.error)
                    .toHaveBeenCalledWith("Parsing error for expression \'{{throw}}\'");

            }));

            it("can not get __context as parameter", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(translate.logHandler, "error").and.callFake(() => {});

                translate.instant("INTERPOLATION", {__context: "at work"});

                expect(translate.logHandler.error).toHaveBeenCalledWith("Parameter \'__context\' is not allowed.");
            }));

            it("can not get numeric keys in parameter", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(translate.logHandler, "error").and.callFake(() => {});

                translate.instant("INTERPOLATION", {
                    42: "the answer",
                });

                expect(translate.logHandler.error).toHaveBeenCalledWith("Parameter \'42\' is not allowed.");
            }));

            it("ignores prototyped properties in parameters", fakeAsync(() => {
                translate.waitForTranslation();

                loaderPromiseResolve({
                    INTERPOLATION: "{{something}}",
                });
                JasminePromise.flush();

                let MyObject = function MyOption(): void {};
                MyObject.prototype.something = 42;

                let result = translate.instant("INTERPOLATION", new MyObject());

                expect(result).toBe("");
            }));

            it("continues with other parameters after __context", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();
                translate.logHandler.error = () => {};

                let translation = translate.instant("VARIABLES_TEST", {__context: "at work", count: 6});

                expect(translation).toBe("This is interesting");
            }));

            it("continues with other parameters after numeric", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    VARIABLES_TEST: "This {{count > 5 ? 'is interesting' : 'is boring'}}",
                });
                JasminePromise.flush();
                translate.logHandler.error = () => {};

                let translation = translate.instant("VARIABLES_TEST", {42: "the answer", count: 6});

                expect(translation).toBe("This is interesting");
            }));

            it("ignores array as parameters", fakeAsync(() => {
                translate.waitForTranslation();
                loaderPromiseResolve({
                    INTERPOLATION: "The sum from 1+2 is {{1+2}}",
                });
                JasminePromise.flush();
                spyOn(translate.logHandler, "error").and.callFake(() => {});

                let translation = translate.instant("INTERPOLATION", [1, 2, 3]);

                expect(translation).toBe("The sum from 1+2 is 3");
                expect(translate.logHandler.error).toHaveBeenCalledWith("Parameters can not be an array.");
            }));
        });
    });
});
