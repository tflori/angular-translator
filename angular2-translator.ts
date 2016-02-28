import {TranslateService} from './angular2-translator/TranslateService';
import {TranslateConfig} from './angular2-translator/TranslateConfig';
import {TranslateLoader} from './angular2-translator/TranslateLoader';
import {TranslateLoaderJson, TranslateLoaderJsonConfig} from './angular2-translator/TranslateLoaderJson';
import {Provider} from "angular2/core";

export * from './angular2-translator/TranslateService';
export * from './angular2-translator/TranslatePipe';
export * from './angular2-translator/TranslateConfig';
export * from './angular2-translator/TranslateLoader';
export * from './angular2-translator/TranslateLoaderJson';

export const TRANSLATE_PROVIDERS: any[] = [
    new Provider(TranslateConfig, {useValue: new TranslateConfig({})}),
    new Provider(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig()}),
    new Provider(TranslateLoader, {useClass: TranslateLoaderJson}),
    TranslateService
];
