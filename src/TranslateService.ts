//import {TranslateConfig}     from "./TranslateConfig";
//import {TranslateLogHandler} from "./TranslateLogHandler";
//import {TranslateModule}     from "./TranslateModule";
//
//import {Injectable, Injector} from "@angular/core";
//import {Observable}           from "rxjs/Observable";
//import {Observer}             from "rxjs/Observer";
//
//import "rxjs/add/operator/share";
//
//interface IModules<T> {
//    [key: string]: T;
//}
//
//@Injectable()
//export class TranslateService {
//    public languageChanged: Observable<string>;
//
//    private _lang: string;
//    private languageChangedObserver: Observer<string>;
//    private modules: IModules<TranslateModule> = {};
//
//    constructor(
//        public logHandler: TranslateLogHandler,
//        private config: TranslateConfig,
//        private injector: Injector
//    ) {
//        this._lang = config.defaultLang;
//        this.modules.default = new TranslateModule("default", this, config, injector);
//
//        if (config.detectLanguageOnStart) {
//            let lang = this.detectLang(config.navigatorLanguages);
//            if (lang) {
//                this._lang = String(lang);
//                logHandler.info("Language " + lang + " got detected");
//            }
//        }
//
//        this.languageChanged = new Observable<string>(
//            (observer: any) => this.languageChangedObserver = observer
//        ).share();
//    }
//
//    get lang(): string {
//        return this._lang;
//    }
//
//    set lang(lang: string) {
//        let providedLang = this.config.langProvided(lang, true);
//
//        if (typeof providedLang === "string") {
//            this._lang = providedLang;
//            this.logHandler.info("Language changed to " + providedLang);
//            if (this.languageChangedObserver) {
//                this.languageChangedObserver.next(this._lang);
//            }
//
//            return;
//        }
//
//        throw new Error("Language not provided");
//    }
//
//    /**
//     * Detects the preferred language by navLangs.
//     *
//     * Returns false if the user prefers a language that is not provided or
//     * the provided language.
//     *
//     * @param {string[]} navLangs (usually navigator.languages)
//     * @returns {string|boolean}
//     */
//    public detectLang(navLangs: string[]): string|boolean {
//        let detected: string|boolean = false;
//        let i: number;
//
//        this.logHandler.debug("Detecting language from " + JSON.stringify(navLangs) + " in strict mode.");
//        for (i = 0; i < navLangs.length; i++) {
//            detected = this.config.langProvided(navLangs[i], true);
//            if (detected) {
//                break;
//            }
//        }
//        if (!detected) {
//            this.logHandler.debug("Detecting language from " + JSON.stringify(navLangs) + " in non-strict mode.");
//            for (i = 0; i < navLangs.length; i++) {
//                detected = this.config.langProvided(navLangs[i]);
//                if (detected) {
//                    break;
//                }
//            }
//        }
//
//        return detected;
//    }
//
//    /**
//     * Waits for the current language to be loaded.
//     *
//     * @param {string?} lang
//     * @returns {Promise<void>|Promise}
//     */
//    public waitForTranslation(lang: string = this._lang): Promise<void> {
//        return this.modules.default.waitForTranslation(lang);
//    }
//
//    /**
//     * Translate keys for current language or given language (lang) asynchronously.
//     *
//     * Optionally you can pass params for translation to be interpolated.
//     *
//     * @param {string|string[]} keys
//     * @param {any?} params
//     * @param {string?} lang
//     * @returns {Promise<string|string[]>|Promise}
//     */
//    public translate(keys: string|string[], params: any = {}, lang?: string): Promise<string|string[]> {
//        return this.modules.default.translate(keys, params, lang);
//    }
//
//    /**
//     * Translate keys for current language or given language (lang) synchronously.
//     *
//     * Optionally you can pass params for translation to be interpolated.
//     *
//     * @param {string|string[]} keys
//     * @param {any?} params
//     * @param {string?} lang
//     * @returns {string|string[]}
//     */
//    public instant(keys: string|string[], params: any = {}, lang?: string): string|string[] {
//        return this.modules.default.instant(keys, params, lang);
//    }
//
//    public module(module: string): TranslateModule {
//        if (module === "default") {
//            return this.modules.default;
//        }
//
//        if (!this.config.modules[module]) {
//            throw new Error("Module " + module + " is not configured");
//        }
//
//        if (!this.modules[module]) {
//            let moduleConfig = this.config.modules[module];
//            moduleConfig.providedLangs = this.config.providedLangs;
//            if (!moduleConfig.loader) {
//                moduleConfig.loader = this.config.loader;
//            }
//            if (!moduleConfig.loaderConfig) {
//                moduleConfig.loaderConfig = this.config.loaderConfig;
//            }
//
//            this.modules[module] = new TranslateModule(module, this, new TranslateConfig(moduleConfig), this.injector);
//        }
//
//        return this.modules[module];
//    }
//}
