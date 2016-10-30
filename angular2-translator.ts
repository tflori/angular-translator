import {TranslateComponent}                             from "./angular2-translator/TranslateComponent";
import {TranslateConfig}                                from "./angular2-translator/TranslateConfig";
import {TranslateLoader}                                from "./angular2-translator/TranslateLoader";
import {TranslateLoaderJson, TranslateLoaderJsonConfig} from "./angular2-translator/TranslateLoaderJson";
import {TranslatePipe}                                  from "./angular2-translator/TranslatePipe";
import {TranslateLogHandler, TranslateService}          from "./angular2-translator/TranslateService";

import {NgModule}                                       from "@angular/core";
import {HttpModule}                                     from "@angular/http";

export * from "./angular2-translator/TranslateService";
export * from "./angular2-translator/TranslatePipe";
export * from "./angular2-translator/TranslateComponent";
export * from "./angular2-translator/TranslateConfig";
export * from "./angular2-translator/TranslateLoader";
export * from "./angular2-translator/TranslateLoaderJson";

@NgModule({
    declarations: [
        TranslatePipe,
        TranslateComponent,
    ],
    exports: [
        TranslatePipe,
        TranslateComponent,
    ],
    imports: [HttpModule],
    providers: [
        { provide: TranslateConfig, useValue: new TranslateConfig({}) },
        { provide: TranslateLoaderJsonConfig, useValue: new TranslateLoaderJsonConfig() },
        { provide: TranslateLoader, useClass: TranslateLoaderJson },
        { provide: TranslateLogHandler, useValue: TranslateLogHandler },
        TranslateService,
    ],
})
export class TranslatorModule {}

export const TRANSLATE_PROVIDERS: any[] = [
    { provide: TranslateConfig, useValue: new TranslateConfig({}) },
    { provide: TranslateLoaderJsonConfig, useValue: new TranslateLoaderJsonConfig() },
    { provide: TranslateLoader, useClass: TranslateLoaderJson },
    { provide: TranslateLogHandler, useValue: TranslateLogHandler },
    TranslateService,
];
