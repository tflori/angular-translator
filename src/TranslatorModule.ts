import {TranslateComponent}                             from "./TranslateComponent";
import {TranslateConfig}                                from "./TranslateConfig";
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
        TranslateLoaderJson,
        TranslateLogHandler,
        TranslateService,
    ],
})
export class TranslatorModule {}
