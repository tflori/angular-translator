import {TranslateComponent}  from "./TranslateComponent";
import {TranslateConfig}     from "./TranslateConfig";
import {TranslateLoaderJson} from "./TranslateLoaderJson";
import {TranslateLogHandler} from "./TranslateLogHandler";
import {TranslateModule}     from "./TranslateModule";
import {TranslatePipe}       from "./TranslatePipe";
import {TranslateService}    from "./TranslateService";
import {Translator}          from "./Translator";

import {NgModule}   from "@angular/core";
import {HttpModule} from "@angular/http";

export function translatorFactory(module: string): Function {
    return function(translate: TranslateService): TranslateModule {
        return translate.module(module);
    };
}

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
        { provide: Translator, useFactory: translatorFactory("default"), deps: [TranslateService] },
    ],
})
export class TranslatorModule {}
