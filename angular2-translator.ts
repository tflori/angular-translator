import {TranslateConfig}                                from "./angular2-translator/TranslateConfig";
import {TranslateLoader}                                from "./angular2-translator/TranslateLoader";
import {TranslateLoaderJson, TranslateLoaderJsonConfig} from "./angular2-translator/TranslateLoaderJson";
import {TranslateLogHandler, TranslateService}          from "./angular2-translator/TranslateService";

export * from "./angular2-translator/TranslateService";
export * from "./angular2-translator/TranslatePipe";
export * from "./angular2-translator/TranslateComponent";
export * from "./angular2-translator/TranslateConfig";
export * from "./angular2-translator/TranslateLoader";
export * from "./angular2-translator/TranslateLoaderJson";

export const TRANSLATE_PROVIDERS: any[] = [
    { provide: TranslateConfig, useValue: new TranslateConfig({}) },
    { provide: TranslateLoaderJsonConfig, useValue: new TranslateLoaderJsonConfig() },
    { provide: TranslateLoader, useClass: TranslateLoaderJson },
    { provide: TranslateLogHandler, useValue: TranslateLogHandler },
    TranslateService,
];
