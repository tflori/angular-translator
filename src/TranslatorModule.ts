import {TranslateComponent}                             from "./TranslateComponent";
import {TranslateConfig}                                from "./TranslateConfig";
import {TranslateLoader}                                from "./TranslateLoader";
import {TranslateLoaderJson} from "./TranslateLoaderJson";
import {TranslateLogHandler}                            from "./TranslateLogHandler";
import {TranslatePipe}                                  from "./TranslatePipe";
import {TranslateService}                               from "./TranslateService";

import {NgModule}                                       from "@angular/core";
import {HttpModule}                                     from "@angular/http";

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
        { provide: TranslateLoaderJson, useClass: TranslateLoaderJson },
        { provide: TranslateLogHandler, useClass: TranslateLogHandler },
        TranslateService,
    ],
})
export class TranslatorModule {}

export const TRANSLATE_PROVIDERS: any[] = [
    { provide: TranslateConfig, useValue: new TranslateConfig({}) },
    { provide: TranslateLoader, useClass: TranslateLoaderJson },
    { provide: TranslateLogHandler, useValue: TranslateLogHandler },
    TranslateService,
];
