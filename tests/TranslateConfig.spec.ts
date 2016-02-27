import {TranslateConfig} from "../angular2-translator/TranslateConfig";

export function main() {
    describe('TranslateConfig', function() {
        it('is defined', function() {
            var translateConfig = new TranslateConfig({});

            expect(TranslateConfig).toBeDefined();
            expect(translateConfig).toBeDefined();
            expect(translateConfig instanceof TranslateConfig).toBeTruthy();
        });

        it('gets default language from parameter defaultLang', function() {
            var translateConfig = new TranslateConfig({
                defaultLang: 'cn',
                providedLangs: ['en', 'cn']
            });

            expect(translateConfig.defaultLang).toBe('cn');
        });

        it('defines a list of provided languages', function() {
            var translateConfig = new TranslateConfig({});

            expect(translateConfig.providedLangs).toEqual(['en']);
        });

        it('gets provided languages from parameter providedLangs', function() {
            var translateConfig = new TranslateConfig({
                providedLangs: ['cn']
            });

            expect(translateConfig.providedLangs).toEqual(['cn']);
        });

        it('uses first provided language', function() {
            var translateConfig = new TranslateConfig({
                providedLangs: ['cn'],
                defaultLang: 'en' // default - unnecessary
            });

            expect(translateConfig.defaultLang).toBe('cn');
        });

        describe('langProvided', function() {
            var translateConfig:TranslateConfig;

            beforeEach(function() {
                translateConfig = new TranslateConfig({});
            });

            it('returns the language if provided', function() {
                translateConfig.providedLangs = ['bm', 'en'];

                var providedLang = translateConfig.langProvided('bm');

                expect(providedLang).toBe('bm');
            });

            it('returns false when it is not provided', function() {
                translateConfig.providedLangs = ['en'];

                var providedLang = translateConfig.langProvided('bm');

                expect(providedLang).toBeFalsy();
            });

            it('returns provided language when we search with country', function() {
                translateConfig.providedLangs = ['en'];

                var providedLang = translateConfig.langProvided('en-US');

                expect(providedLang).toBe('en');
            });

            it('returns the first provided country specific language', function() {
                translateConfig.providedLangs = ['de-DE', 'de-AT'];

                var providedLang = translateConfig.langProvided('de-CH');

                expect(providedLang).toBe('de-DE');
            });

            it('normalizes provided languages for checks', function() {
                translateConfig.providedLangs = ['DE', 'DE_AT'];

                var providedLang = translateConfig.langProvided('de-AT');

                expect(providedLang).toBe('DE_AT');
            });

            it('normalizes searched language', function() {
                translateConfig.providedLangs = ['de-DE', 'de-AT'];

                var providedLang = translateConfig.langProvided('DE/de');

                expect(providedLang).toBe('de-DE');
            });

            it('only finds direct matches', function() {
                translateConfig.providedLangs = ['de-DE'];

                var providedLang = translateConfig.langProvided('de', true);

                expect(providedLang).toBeFalsy();
            })
        });
    });
}