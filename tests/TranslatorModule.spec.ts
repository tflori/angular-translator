import {TranslateComponent, Translator, TranslatorModule} from "../index";

import {TestBed} from "@angular/core/testing";

describe("TranslatorModule", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ TranslatorModule ],
        });
    });

    it("provides the default Translator", () => {
        let translator = TestBed.get(Translator);

        expect(translator.module).toBe("default");
    });

    it("defines the translate component", () => {
        let component = TestBed.createComponent(TranslateComponent);

        expect(component.componentInstance).toEqual(jasmine.any(TranslateComponent));
    });
});
