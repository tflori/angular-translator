import {TranslateService} from './src/TranslateService';
import {TranslateConfig} from './src/TranslateConfig';
import {Provider} from "angular2/core";

export * from './src/TranslateService';
export * from './src/TranslateConfig';

export const TRANSLATE_PROVIDER: any[] = [
    new Provider(TranslateConfig, {useValue: new TranslateConfig()}),
    TranslateService
];
