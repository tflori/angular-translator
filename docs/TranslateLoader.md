# TranslateLoader

This abstract class has to be used to define a new `TranslateLoader`. A `TranslateLoader` has to define a method `load` 
with the following footprint `load(lang: string): Promise<Object>`. To inject the loader to 
[TranslateService](docs/TranslateService.md) it has to have the annotation `@Injectable()`.

## Load method

This is the only method required in a `TranslateLoader`. The loader gets a string for the language that should be
loaded (defined in `TranslateConfig` see [TranslateConfig](docs/TranslateConfig.md)). The loader should be able to
load every language provided there.

The loader has to return a `Promise`. This promise can also be rejected if something went wrong and
the language could not be loaded (please provide a meaningful reason). The `Promise` then have to be fulfilled with an
object that holds the translations. This could look like this JSON example:
```json
{
  "HELLO WORLD": "Привет мир!"
}
```

## Static loader example

Maybe you want to send only one javascript file for performance reasons and the translations should be included. Here
is a complete example how this could look like:

```ts
import {Injectable} from "@angular/core";
import {TranslateLoader} from "./TranslateLoader";

@Injectable()
export class TranslateLoaderStatic extends TranslateLoader {
    private translations:object = {
        en => {
            "HELLO WORLD": "Hello World!"
        },
        fr => {
            "HELLO WORLD": "Bonjour le monde!"
        },
        de => {
            "HELLO WORLD": "Hallo Welt!"
        },
        ru => {
            "HELLO WORLD:" "Привет мир!"
        }
    };

    constructor() {
        super();
    }

    public load(lang:string):Promise<Object> {
        return new Promise((resolve, reject) => {
            if (this.translations[lang]) {
                resolve(this.translations[lang];
            }
            reject('Language unknown');
        });
    }
}
```

To use this loader in your application you have to provide it for your application. Here is an example how your
bootstrap can look like:
```ts
import {bootstrap} from '@angular/platform/browser';
import {provide} from '@angular/core';
import {TRANSLATE_PROVIDERS, TranslateConfig} from 'angular2-translator';
import {AppComponent} from './app.component';
import {TranslateLoaderStatic} from './TranslateLoaderStatic';

bootstrap(AppComponent, [
    TRANSLATE_PROVIDERS,
    provide(TranslateConfig, {useValue: new TranslateConfig({
        defaultLang: 'en',
        providedLangs: ['en', 'de', 'fr', 'ru']
    })}),
    provide(TranslateLoader, {useClass: TranslateLoaderStatic})
]);
```
