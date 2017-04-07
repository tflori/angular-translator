import {TranslateComponent} from "./TranslateComponent";
import {TranslateLogHandler} from "./TranslateLogHandler";
import {TranslatePipe} from "./TranslatePipe";
import {TranslationLoaderJson} from "./TranslationLoader/Json";
import {Translator} from "./Translator";
import {TranslatorConfig} from "./TranslatorConfig";
import {TranslatorContainer} from "./TranslatorContainer";

import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";

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
        { provide: TranslatorConfig, useValue: new TranslatorConfig() },
        TranslationLoaderJson,
        TranslateLogHandler,
        TranslatorContainer,
        { provide: Translator, useFactory: Translator.factory("default"), deps: [ TranslatorContainer ] },
    ],
})
export class TranslatorModule {}
