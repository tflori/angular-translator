import {TranslateService} from './src/TranslateService';
import {TranslateConfig} from './src/TranslateConfig';
import {TranslateLoader} from './src/TranslateLoader';
import {TranslateLoaderJson, TranslateLoaderJsonConfig} from './src/TranslateLoaderJson';
import {Provider} from "angular2/core";

export * from './src/TranslateService';
export * from './src/TranslateConfig';
export * from './src/TranslateLoader';
export * from './src/TranslateLoaderJson';

export const TRANSLATE_PROVIDERS: any[] = [
    new Provider(TranslateConfig, {useValue: new TranslateConfig()}),
    new Provider(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig()}),
    new Provider(TranslateLoader, {useClass: TranslateLoaderJson}),
    TranslateService
];
