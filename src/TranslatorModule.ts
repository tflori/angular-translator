import {TranslateComponent} from "./TranslateComponent";
import {TranslateLogHandler} from "./TranslateLogHandler";
import {TranslatePipe} from "./TranslatePipe";
import {TranslationLoaderJson} from "./TranslationLoader/Json";
import {Translator} from "./Translator";
import {TranslatorConfig} from "./TranslatorConfig";
import {TranslatorContainer} from "./TranslatorContainer";

import {ModuleWithProviders, NgModule} from "@angular/core";
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
        TranslationLoaderJson,
        TranslateLogHandler,
        TranslatorContainer,
    ],
})
export class TranslatorModule {
    public static forRoot(config: any = {}): ModuleWithProviders {
        return {
            ngModule: TranslatorModule,
            providers: [
                { provide: TranslatorConfig, useValue: new TranslatorConfig(config) },
                { provide: Translator, useFactory: Translator.factory("default"), deps: [TranslatorContainer] },
            ],
        };
    }

    public static forChild(module: string = "default") {
        return {
            ngModule: TranslatorModule,
            providers: [
                { provide: Translator, useFactory: Translator.factory(module), deps: [TranslatorContainer] },
            ],
        };
    }
}
