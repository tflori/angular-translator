import {
    TranslateLoaderJson,
    TranslateLoaderJsonConfig,
} from "../index";

import {JasmineHelper}               from "./helper/JasmineHelper";
import {PromiseMatcher}              from "./helper/promise-matcher";
import {TestBed}                     from "@angular/core/testing";
import {
    HttpModule,
    RequestMethod,
    Response,
    ResponseOptions,
    XHRBackend,
}                                    from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";

describe("TranslateLoaderJsonConfig", function () {
    it("is defined", function () {
        let config = new TranslateLoaderJsonConfig();

        expect(TranslateLoaderJsonConfig).toBeDefined();
        expect(config).toBeDefined();
        expect(config instanceof TranslateLoaderJsonConfig).toBeTruthy();
    });

    it("defines default path and extension", function () {
        let config = new TranslateLoaderJsonConfig();

        expect(config.path).toBe("assets/i18n/");
        expect(config.extension).toBe(".json");
    });

    it("overrides defaults by constructor", function () {
        let config = new TranslateLoaderJsonConfig("localization", "-lang.json");

        expect(config.path).toBe("localization/");
        expect(config.extension).toBe("-lang.json");
    });
});

describe("TranslateLoaderJson", function () {
    it("is defined", function () {
        expect(TranslateLoaderJson).toBeDefined();
    });

    describe("constructor", function () {
        it("requires a TranslateLoaderJsonConfig", function () {
            TestBed.configureTestingModule({
                imports: [HttpModule],
                providers: [TranslateLoaderJson],
            });

            let action = function () {
                TestBed.get(TranslateLoaderJson);
            };

            expect(action).toThrow(new Error("No provider for TranslateLoaderJsonConfig!"));
        });
    });

    describe("load", function () {
        let loader: TranslateLoaderJson;
        let backend: MockBackend;
        let connection: MockConnection;

        beforeEach(function () {
            TestBed.configureTestingModule({
                imports: [HttpModule],
                providers: [
                    {provide: XHRBackend, useClass: MockBackend},
                    {provide: TranslateLoaderJsonConfig, useValue: new TranslateLoaderJsonConfig()},
                    TranslateLoaderJson,
                ],
            });

            backend = TestBed.get(XHRBackend);
            loader = TestBed.get(TranslateLoaderJson);
            backend.connections.subscribe((c: MockConnection) => connection = c);

            PromiseMatcher.install();
        });

        afterEach(PromiseMatcher.uninstall);

        it("is defined", function () {
            expect(loader.load).toBeDefined();
            expect(typeof loader.load).toBe("function");
        });

        it("returns a promise", function () {
            let promise = loader.load("en");

            expect(promise instanceof Promise).toBeTruthy();
        });

        it("loads a language file", function () {
            spyOn(backend, "createConnection").and.callThrough();

            loader.load("en");

            expect(backend.createConnection).toHaveBeenCalled();
            let request = JasmineHelper.calls(backend.createConnection).mostRecent().args[0];
            expect(request.url).toBe("assets/i18n/en.json");
            expect(request.method).toBe(RequestMethod.Get);
        });

        it("resolves when connection responds", function () {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({TEXT: "This is a text"}),
                status: 200,
            })));

            expect(promise).toBeResolved();
        });

        it("transforms result to object", function () {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({TEXT: "This is a text"}),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({TEXT: "This is a text"});
        });

        it("rejectes when connection fails", function () {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                status: 500,
                statusText: "Internal Server Error",
            })));

            expect(promise).toBeRejectedWith("StatusCode: 500");
        });

        it("rejects when connection throws", function () {
            let promise = loader.load("en");

            connection.mockError(new Error("Some reason"));

            expect(promise).toBeRejectedWith("Some reason");
        });

        it("combines arrays to a string", function () {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({
                    COOKIE_INFORMATION: [
                        "We are using cookies to adjust our website to the needs of our customers. ",
                        "By using our websites you agree to store cookies on your computer, tablet or smartphone.",
                    ],
                }),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({
                COOKIE_INFORMATION: "We are using cookies to adjust our website to the needs of our customers. " +
                "By using our websites you agree to store cookies on your computer, tablet or smartphone.",
            });
        });

        it("allows nested objects", function () {
            let promise = loader.load("en");
            let nestedObj: any = {
                TEXT: {
                    NESTED: "This is a text",
                },
            };

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(nestedObj),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({"TEXT.NESTED": "This is a text"});
        });

        it("allows multiple nested objects", function () {
            let promise = loader.load("en");
            let nestedObj: any = {
                TEXT: {
                    NESTED: "This is a text",
                    SECONDNEST: {
                        TEXT: "Second text",
                    },
                },
            };

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(nestedObj),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({"TEXT.NESTED": "This is a text", "TEXT.SECONDNEST.TEXT": "Second text"});
        });

        it("combines arrays to a string while returning nested objects", function () {
            let promise = loader.load("en");
            let nestedObj: any = {
                COOKIE_INFORMATION: [
                    "We are using cookies to adjust our website to the needs of our customers. ",
                    "By using our websites you agree to store cookies on your computer, tablet or smartphone.",
                ],
                TEXT: {
                    NESTED: "This is a text",
                },
            };

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(nestedObj),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({
                COOKIE_INFORMATION: "We are using cookies to adjust our website to " +
                "the needs of our customers. By using our websites you agree to store cookies on your computer, " +
                "tablet or smartphone.", "TEXT.NESTED": "This is a text",
            });
        });

        it("allows nested objects with lower case keys and with camel case", function () {
            let promise = loader.load("en");
            let nestedObj: any = {
                text: {
                    nestedText: "This is a text",
                },
            };

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(nestedObj),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({"text.nestedText": "This is a text"});
        });

        it("filters non string values within nested object", function () {
            let promise = loader.load("en");
            let nestedObj: any = {
                TEXT: {
                    ANSWER: 42,
                    NESTED: "This is a text",
                },
            };

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(nestedObj),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({"TEXT.NESTED": "This is a text"});
        });

        it("combines arrays to a string while beeing in nested objects", function () {
            let promise = loader.load("en");
            let nestedObj: any = {
                TEXT: {
                    COOKIE_INFORMATION: [
                        "We are using cookies to adjust our website to the needs of our customers. ",
                        "By using our websites you agree to store cookies on your computer, tablet or smartphone.",
                    ],
                },
            };

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(nestedObj),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({
                "TEXT.COOKIE_INFORMATION": "We are using cookies to adjust our website " +
                "to the needs of our customers. By using our websites you agree to store cookies on your " +
                "computer, tablet or smartphone.",
            });
        });

        it("merges translations to one dimension", function () {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({
                    app: {
                        componentA: {
                            TEXT: "something else",
                        },
                        loginText: "Please login before continuing!",
                    },
                }),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({
                "app.componentA.TEXT": "something else",
                "app.loginText": "Please login before continuing!",
            });
        });

        it("filters non string values", function () {
            let promise = loader.load("en");

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({
                    ANSWER: 42,
                    COMBINED: [
                        "7 multiplied by 6 is ",
                        42,
                    ],
                }),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({COMBINED: "7 multiplied by 6 is "});
        });
    });
});
