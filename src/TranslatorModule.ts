import { TranslateComponent } from "./TranslateComponent";
import { TranslateLogHandler } from "./TranslateLogHandler";
import { TranslatePipe } from "./TranslatePipe";
import { TranslationLoaderJson } from "./TranslationLoader/Json";
import { Translator } from "./Translator";
import { COMMON_PURE_PIPES, TranslatorConfig } from "./TranslatorConfig";
import { TranslatorContainer } from "./TranslatorContainer";

import { HttpClientModule } from "@angular/common/http";
import { InjectionToken, ModuleWithProviders, NgModule, PipeTransform, Provider, Type } from "@angular/core";

export const TRANSLATOR_OPTIONS: InjectionToken<object> = new InjectionToken("TRANSLATOR_OPTIONS");
export const TRANSLATOR_MODULE: InjectionToken<string> = new InjectionToken("TRANSLATOR_MODULE");

@NgModule({
    declarations: [
        TranslatePipe,
        TranslateComponent,
    ],
    exports:      [
        TranslatePipe,
        TranslateComponent,
    ],
    imports:      [HttpClientModule],
    providers:    [
        TranslationLoaderJson,
        TranslateLogHandler,
        TranslatorContainer,
        COMMON_PURE_PIPES,
    ],
})
export class TranslatorModule {
    public static forRoot(options: any = {}, module: string = "default"): ModuleWithProviders<TranslatorModule> {
        return {
            ngModule:  TranslatorModule,
            providers: [
                { provide: TRANSLATOR_OPTIONS, useValue: options },
                {
                    provide: TranslatorConfig, useFactory: createTranslatorConfig, deps: [
                    TranslateLogHandler,
                    TRANSLATOR_OPTIONS,
                ],
                },
                provideTranslator(module),
                options.pipes || [],
            ],
        };
    }
}

export function provideTranslator(module: string): Provider[] {
    return [
        { provide: TRANSLATOR_MODULE, useValue: module },
        { provide: Translator, useFactory: createTranslator, deps: [TranslatorContainer, TRANSLATOR_MODULE] },
    ];
}

export function createTranslatorConfig(logHandler: TranslateLogHandler, options: any = {}): TranslatorConfig {
    return new TranslatorConfig(logHandler, options);
}

export function createTranslator(translatorContainer: TranslatorContainer, module: string): Translator {
    return translatorContainer.getTranslator(module);
}
