import {TranslateComponent}                             from "./TranslateComponent";
import {TranslateConfig}                                from "./TranslateConfig";
import {TranslateLoader}                                from "./TranslateLoader";
import {TranslateLoaderJson, TranslateLoaderJsonConfig} from "./TranslateLoaderJson";
import {TranslateLogHandler}                            from "./TranslateLogHandler";
import {TranslatePipe}                                  from "./TranslatePipe";
import {TranslateService}                               from "./TranslateService";

import {NgModule}                                       from "@angular/core";
import {HttpModule}                                     from "@angular/http";

export class DefaultTranslateConfig extends TranslateConfig {
    constructor() {
        super({});
    }
}

export class DefaultTranslateLoaderJsonConfig extends TranslateLoaderJsonConfig {
    constructor() {
        super("assets/i18n/", ".json");
    }
}

export const TRANSLATE_PROVIDERS: any[] = [
    { provide: TranslateConfig, useClass: DefaultTranslateConfig },
    { provide: TranslateLoaderJsonConfig, useClass: DefaultTranslateLoaderJsonConfig },
    { provide: TranslateLoader, useClass: TranslateLoaderJson },
    TranslateLogHandler,
    TranslateService,
];

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
        TRANSLATE_PROVIDERS,
    ],
})
export class TranslatorModule {}
