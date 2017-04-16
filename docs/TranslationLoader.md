---
layout: default
title: TranslationLoader
permalink: /TranslationLoader.html
---
# TranslationLoader

This abstract class has to be used to define a new `TranslationLoader`. A `TranslationLoader` has to define a method
`load` with the following footprint `load(options: any): Promise<object>`. To inject the loader to 
[TranslateService](docs/TranslateService.md) it has to have the annotation `@Injectable()`.

## Load method

This is the only method required in a `TranslationLoader`. The loader gets a string for the language that should be
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

The load method gets an object with all options set in the `loaderOptions` configuration plus the key `language` and
the key `module`. An example how to use this information can be found in the `TranslationLoaderJson` source.

## Static loader example

Maybe you want to send only one javascript file for performance reasons and the translations should be included. Here
is a complete example how this could look like:

```ts
import {Injectable} from "@angular/core";

import {TranslationLoader} from "angular-translator";

@Injectable()
export class TranslationLoaderStatic extends TranslationLoader {
    private translations:Object = {
        en: {
            "HELLO WORLD": "Hello World!"
        },
        fr: {
            "HELLO WORLD": "Bonjour le monde!"
        },
        de: {
            "HELLO WORLD": "Hallo Welt!"
        },
        ru: {
            "HELLO WORLD": "Привет мир!"
        }
    };

    public load({language}: any):Promise<object> {
        if (!this.translations[language]) {
            Promise.reject("Language unknown");
        }
        return Promise.resolve(this.translations[language]);
    }
}
```

To use this loader in your application you have to provide it for your application. Here is an example how your
bootstrap can look like:

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TranslatorModule } from "angular-translator";

import { AppComponent } from './app.component';
import { TranslationLoaderStatic } from "./TranslationLoaderStatic"


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        TranslatorModule.forRoot({
            defaultLanguage: "ru",
            providedLanguages: [ "de", "en", "fr", "ru" ],
            detectLanguage: false,
            loader: TranslationLoaderStatic
        }),
    ],
    providers: [
        TranslationLoaderStatic,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```
