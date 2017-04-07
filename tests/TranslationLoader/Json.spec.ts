import {
    TranslationLoaderJson,
} from "../../index";

import {JasmineHelper} from "../helper/JasmineHelper";
import {PromiseMatcher} from "../helper/promise-matcher";

import {TestBed} from "@angular/core/testing";
import {
    HttpModule,
    RequestMethod,
    Response,
    ResponseOptions,
    XHRBackend,
} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";

describe("TranslationLoaderJson", () => {
    it("is defined", () => {
        expect(TranslationLoaderJson).toBeDefined();
    });

    describe("load", () => {
        let loader: TranslationLoaderJson;
        let backend: MockBackend;
        let connection: MockConnection;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpModule],
                providers: [
                    {provide: XHRBackend, useClass: MockBackend},
                    TranslationLoaderJson,
                ],
            });

            backend = TestBed.get(XHRBackend);
            loader = TestBed.get(TranslationLoaderJson);
            backend.connections.subscribe((c: MockConnection) => connection = c);

            PromiseMatcher.install();
        });

        afterEach(PromiseMatcher.uninstall);

        it("is defined", () => {
            expect(loader.load).toBeDefined();
            expect(typeof loader.load).toBe("function");
        });

        it("returns a promise", () => {
            let promise = loader.load({ language: "en" });

            expect(promise instanceof Promise).toBeTruthy();
        });

        it("loads a language file", () => {
            spyOn(backend, "createConnection").and.callThrough();

            loader.load({ language: "en" });

            expect(backend.createConnection).toHaveBeenCalled();
            let request = JasmineHelper.calls(backend.createConnection).mostRecent().args[0];
            expect(request.url).toBe("assets/i18n/./en.json");
            expect(request.method).toBe(RequestMethod.Get);
        });

        it("can be configured", () => {
            spyOn(backend, "createConnection").and.callThrough();

            loader.load({
                language: "en",
                module: "test",
                path: "app/translations/{{module}}/{{language}}-lang.json",
            });

            expect(backend.createConnection).toHaveBeenCalled();
            let request = JasmineHelper.calls(backend.createConnection).mostRecent().args[0];
            expect(request.url).toBe("app/translations/test/en-lang.json");
            expect(request.method).toBe(RequestMethod.Get);
        });

        it("resolves when connection responds", () => {
            let promise = loader.load({ language: "en" });

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({TEXT: "This is a text"}),
                status: 200,
            })));

            expect(promise).toBeResolved();
        });

        it("transforms result to object", () => {
            let promise = loader.load({ language: "en" });

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({TEXT: "This is a text"}),
                status: 200,
            })));

            expect(promise).toBeResolvedWith({TEXT: "This is a text"});
        });

        it("rejectes when connection fails", () => {
            let promise = loader.load({ language: "en" });

            connection.mockRespond(new Response(new ResponseOptions({
                status: 500,
                statusText: "Internal Server Error",
            })));

            expect(promise).toBeRejectedWith("StatusCode: 500");
        });

        it("rejects when connection throws", () => {
            let promise = loader.load({ language: "en" });

            connection.mockError(new Error("Some reason"));

            expect(promise).toBeRejectedWith("Some reason");
        });

        it("combines arrays to a string", () => {
            let promise = loader.load({ language: "en" });

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

        it("allows nested objects", () => {
            let promise = loader.load({ language: "en" });
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

        it("allows multiple nested objects", () => {
            let promise = loader.load({ language: "en" });
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

        it("combines arrays to a string while returning nested objects", () => {
            let promise = loader.load({ language: "en" });
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
                "COOKIE_INFORMATION": "We are using cookies to adjust our website to " +
                "the needs of our customers. By using our websites you agree to store cookies on your computer, " +
                "tablet or smartphone.", "TEXT.NESTED": "This is a text",
            });
        });

        it("allows nested objects with lower case keys and with camel case", () => {
            let promise = loader.load({ language: "en" });
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

        it("filters non string values within nested object", () => {
            let promise = loader.load({ language: "en" });
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

        it("combines arrays to a string while beeing in nested objects", () => {
            let promise = loader.load({ language: "en" });
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

        it("merges translations to one dimension", () => {
            let promise = loader.load({ language: "en" });

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

        it("filters non string values", () => {
            let promise = loader.load({ language: "en" });

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
