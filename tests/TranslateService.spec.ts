import {it} from "angular2/testing";
import {provide, Injector} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";
import {TranslateService} from '../src/TranslateService';
import {TranslateConfig} from "../src/TranslateConfig";

export function main() {
    describe('TranslateService', function() {
        let injector: Injector;
        let translate: TranslateService;

        beforeEach(function() {
            injector = Injector.resolveAndCreate([
                HTTP_PROVIDERS,
                provide(TranslateConfig, {useValue: new TranslateConfig()}),
                TranslateService
            ]);
            translate = injector.get(TranslateService);
        });

        afterEach(function() {
            injector = undefined;
            translate = undefined;
        });

        it('is defined', function() {
            expect(TranslateService).toBeDefined();
            expect(translate).toBeDefined();
            expect(translate instanceof TranslateService).toBeTruthy();
        });
    });
}