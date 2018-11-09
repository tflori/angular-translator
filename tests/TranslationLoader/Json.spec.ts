import {
    TranslationLoaderJson,
} from "../../index";

import {PromiseMatcher} from "../helper/promise-matcher";

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";

describe("TranslationLoaderJson", () => {
    it("is defined", () => {
        expect(TranslationLoaderJson).toBeDefined();
    });

    describe("load", () => {
        let loader: TranslationLoaderJson;
        let httpClient: HttpClient;
        let httpTestingController: HttpTestingController;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                providers: [
                    TranslationLoaderJson,
                ],
            });

            httpClient = TestBed.get(HttpClient);
            loader = TestBed.get(TranslationLoaderJson);
            httpTestingController = TestBed.get(HttpTestingController);

            PromiseMatcher.install();
        });

        afterEach(() => {
            PromiseMatcher.uninstall();
            httpTestingController.verify();
        });

        it("is defined", () => {
            expect(loader.load).toBeDefined();
            expect(typeof loader.load).toBe("function");
        });

        it("returns a promise", () => {
            let promise = loader.load({ language: "en" });

            httpTestingController.expectOne("assets/i18n/./en.json");
            expect(promise instanceof Promise).toBeTruthy();
        });

        it("loads a language file", () => {
            loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            expect(request.request.method).toBe("GET");
        });

        it("can be configured", () => {
            loader.load({
                language: "en",
                module: "test",
                path: "app/translations/{{module}}/{{language}}-lang.json",
            });

            const request = httpTestingController.expectOne("app/translations/test/en-lang.json");
            expect(request.request.method).toBe("GET");
        });

        it("resolves when connection responds", () => {
            let promise = loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush({TEXT: "This is a text"});

            expect(promise).toBeResolved();
        });

        it("transforms result to object", () => {
            let promise = loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush({TEXT: "This is a text"});

            expect(promise).toBeResolvedWith({TEXT: "This is a text"});
        });

        it("rejects when connection fails", () => {
            let promise = loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush("", { status: 500, statusText: "Internal Server Error" });

            expect(promise).toBeRejectedWith("Internal Server Error");
        });

        it("combines arrays to a string", () => {
            let promise = loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush({
                COOKIE_INFORMATION: [
                    "We are using cookies to adjust our website to the needs of our customers. ",
                    "By using our websites you agree to store cookies on your computer, tablet or smartphone.",
                ],
            });

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

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush(nestedObj);

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

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush(nestedObj);

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

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush(nestedObj);

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

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush(nestedObj);

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

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush(nestedObj);

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

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush(nestedObj);

            expect(promise).toBeResolvedWith({
                "TEXT.COOKIE_INFORMATION": "We are using cookies to adjust our website " +
                "to the needs of our customers. By using our websites you agree to store cookies on your " +
                "computer, tablet or smartphone.",
            });
        });

        it("merges translations to one dimension", () => {
            let promise = loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush({
                app: {
                    componentA: {
                        TEXT: "something else",
                    },
                    loginText: "Please login before continuing!",
                },
            });

            expect(promise).toBeResolvedWith({
                "app.componentA.TEXT": "something else",
                "app.loginText": "Please login before continuing!",
            });
        });

        it("filters non string values", () => {
            let promise = loader.load({ language: "en" });

            const request = httpTestingController.expectOne("assets/i18n/./en.json");
            request.flush({
                ANSWER: 42,
                COMBINED: [
                    "7 multiplied by 6 is ",
                    42,
                ],
            });

            expect(promise).toBeResolvedWith({COMBINED: "7 multiplied by 6 is "});
        });
    });
});
