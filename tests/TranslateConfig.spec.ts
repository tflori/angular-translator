import {TranslateConfig} from "../src/TranslateConfig";

export function main() {
    describe('TranslateConfig', function() {
        it('is defined', function() {
            var translateConfig = new TranslateConfig();

            expect(TranslateConfig).toBeDefined();
            expect(translateConfig).toBeDefined();
            expect(translateConfig instanceof TranslateConfig).toBeTruthy();
        });

        it('gets default lang from first parameter', function() {
            var translateConfig = new TranslateConfig('cn');

            expect(translateConfig.defaultLang).toBe('cn');
        });
    });
}