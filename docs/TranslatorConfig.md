---
layout: default
title: TranslateConfig
permalink: /TranslatorConfig.html
---
# TranslatorConfig

As the name reveals `TranslatorConfig` gives a configuration for this module.

You can change the options by giving an object to the constructor:
```ts
import { TranslatorConfig } from 'angular-translator';

new TranslatorConfig({
  defaultLanguage: 'de'
});
```

This is done for you within `TranslatorModule.forRoot(config = {})`. You can also change the configuration afterwards
with `TranslatorConfig.setOptions(options)` but we can't recommend as we never tested what happens. There is no reason
to do so.

## The Options

| Name                  | Type     | Default  | Description |
|-----------------------|----------|----------|-------------|
| defaultLanguage       | string   | `'en'`   | Defines the default language to be used if no language got set and language detection is disabled or does not detect a language. |
| providedLanguages     | string[] | `['en']` | Defines a list of the languages that are supported from you. The provided languages has to match your file names. To make language detection work you should use the ISO format 639-1 (e.g. 'en') or the IETF language tag (e.g. 'de-AT'). You don't have to use "-" and don't have to care about case sensitive. A language 'en/us' will also match a browser language en-US and vise versa - but the file has to be *path**en/us**extension* then. |
| detectLanguage        | boolean  | `true`   | Defines whether the language should be detected by navigator.language(s) when TranslateService got initialized or not. |
| loader                | Type     | `TranslationLoaderJson` | The loader that is used for loading translations. |
| loaderOptions         | any      | `{}`     | Options that are passed to the loader. |
| modules               | any      | `{}`     | The module configurations. The modules inherit the options from the root and overwrite with the options in this object. (see [Modules](modules.md) for more information) |

## The Methods

### providedLanguage(lang: string, strict: boolean): string

Tries to find matching provided language and returns the provided language. The provided language and the language that
is searched are getting normalized for matching. That means that `'EN/usa'` is getting `'en-US'`.

Only valid language/region combinations are allowed for non-strict matching. This is necessary to exclude finding provided language Breton if the browser says `"british"`. Valid in this case means to use this format: 
`<two letter language>[[divider]<two letter region>]`. Or - to be more precise - this regular expression: 
`/^([A-Za-z]{2})(?:[.\-_\/]?([A-Za-z]{2}))?$/`.

Example:

```ts
import { TranslatorConfig } from 'angular-translator';

var translatorConfig = new TranslatorConfig({
  providedLanguages: ['EN', 'EN/usa']
});

expect(translatorConfig.providedLanguage('en-US')).toBe('EN/usa');
```

## Example

This example shows how you usually use the `TranslatorConfig` class:

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslatorModule } from "angular-translator";

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TranslatorModule.forRoot({
        defaultLanguage: "de",
        providedLanguages: [ "de", "en" ],
        detectLanguage: false
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
