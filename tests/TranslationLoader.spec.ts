import {TranslationLoader} from "../src/TranslationLoader";

describe("TranslationLoader", () => {
    it("is defined", () => {
        expect(TranslationLoader).toBeDefined();
    });

    // because it is abstract we can only test if it is defined
    // we can not test:
    //  - is abstract
    //  - has abstract method load

    // the interface: ITranslateLoader { public load(lang: string): Promise<Object> }
});
