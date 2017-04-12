import {TranslateComponent} from "./TranslateComponent";
import {TranslateLogHandler} from "./TranslateLogHandler";
import {TranslatePipe} from "./TranslatePipe";
import {TranslationLoaderJson} from "./TranslationLoader/Json";
import {Translator} from "./Translator";
import {TranslatorConfig} from "./TranslatorConfig";
import {TranslatorContainer} from "./TranslatorContainer";

import {Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, Provider, SkipSelf} from "@angular/core";
import {HttpModule} from "@angular/http";

export const TRANSLATOR_OPTIONS: InjectionToken<object> = new InjectionToken("TRANSLATOR_OPTIONS");
export const TRANSLATOR_MODULE: InjectionToken<string> = new InjectionToken("TRANSLATOR_MODULE");

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
    public static forRoot(options: any = {}, module: string = "default"): ModuleWithProviders {
        return {
            ngModule: TranslatorModule,
            providers: [
                { provide: TRANSLATOR_OPTIONS, useValue: options },
                { provide: TranslatorConfig, useFactory: createTranslatorConfig, deps: [ TRANSLATOR_OPTIONS ] },
                provideTranslator(module),
            ],
        };
    }
}

export function provideTranslator(module: string): Provider[] {
    return [
        { provide: TRANSLATOR_MODULE, useValue: module },
        { provide: Translator, useFactory: createTranslator, deps: [ TranslatorContainer, TRANSLATOR_MODULE ] },
    ];
}

export function createTranslatorConfig(config: any = {}) {
    return new TranslatorConfig(config);
}

export function createTranslator(translatorContainer: TranslatorContainer, module: string) {
    return translatorContainer.getTranslator(module);
}
