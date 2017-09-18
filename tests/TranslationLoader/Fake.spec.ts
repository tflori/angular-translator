import {
    TranslationLoaderFake,
} from "../../index";

import {PromiseMatcher} from "../helper/promise-matcher";

describe("TranslationLoaderFake", () => {
    it("is defined", () => {
        expect(TranslationLoaderFake).toBeDefined();
    });

    describe("instant", () => {
        let loader: TranslationLoaderFake;

        beforeEach(() => {
            loader = new TranslationLoaderFake();
            PromiseMatcher.install();
        });

        afterEach(PromiseMatcher.uninstall);

        it("returns an empty translation table", () => {
            let result = loader.load();

            expect(result).toBeResolvedWith({});
        });

        it("returns the object from addTranslations", () => {
            loader.addTranslations({k1: "value1", k2: "value2"});

            let result = loader.load();

            expect(result).toBeResolvedWith({k1: "value1", k2: "value2"});
        });
    });
});
