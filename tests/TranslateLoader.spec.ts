import {TranslateLoader} from "../index";

describe("TranslateLoader", function() {
    it("is defined", function() {
        expect(TranslateLoader).toBeDefined();
    });

    // because it is abstract we can only test if it is defined
    // we can not test:
    //  - is abstract
    //  - has abstract method load

    // the interface: ITranslateLoader { public load(lang: string): Promise<Object> }
});
