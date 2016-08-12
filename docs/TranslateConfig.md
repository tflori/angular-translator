# TranslateConfig

The TranslateConfig is a dependency for TranslateService. As the name suggests it gives a configuration for the TranslateService.

You can change the properties by giving an object to the constructor:
```ts
import {TranslateConfig} from 'angular2-translator';

new TranslateConfig({
  defaultLang: 'de'
});
```
## The Properties

| Name                  | Type     | Default  | Description |
|-----------------------|----------|----------|-------------|
| defaultLang           | string   | `'en'`   | Defines the default language to be used if no language got set and language detection is disabled or does not detect a language. |
| providedLangs         | string[] | `['en']` | Defines a list of the languages that are supported from you. The provided languages has to match your file names. To make language detection work you should use the ISO format 639-1 (e.g. 'en') or the IETF language tag (e.g. 'de-AT'). You don't have to use "-" and don't have to care about case sensitive. A language 'en/us' will also match a browser language en-US and vise versa - but the file has to be *path*\*en/us\**extension* then. |
| detectLanguageOnStart | string   | `true`   | Defines whether the language should be detected by navigator.language(s) when TranslateService got initialized or not. |
| navigatorLanguages    | string[] | -        | Holds an array of languages the browser accepts. Mostly it is exactly `navigator.languages` but for browsers that only define `navigator.language` it is `[navigator.language]`. If nothing is defined by the browser it is simply an empty array. |

## The Methods

### langProvided(lang:string, strict:boolean):string
Tries to find matching provided language and returns the provided language. The provided
language and the language that is searched are getting normalized for matching. That means
that `'EN/usa'` is getting `'en-US'`.

Only valid language/region combinations are allowed. This is necessary to exclude finding provided language Breton
if the browser says `"british"`. Valid in this case means to use this format: 
`<two letter language>[[divider]<two letter region>]`. Or - to be more precise - this regular expression: 
`/^([A-Za-z]{2})(?:[\.\-_\/]?([A-Za-z]{2}))?$/`.

Because the setter for TranslateServer.lang is checking if language is provided it is necessary that your provided
languages matches against this regular expression too. Otherwise you will never be able to switch to this language.

Example:
```ts
import {TranslateConfig} from 'angular2-translator';

var translateConfig = new TranslateConfig({
  providedLangs: ['EN', 'EN/usa']
});

expect(translateConfig.langProvided('en-US')).toBe('EN/usa');
```

## Example

This example shows how you usually use the TranslateConfig class:
```ts
import {bootstrap}    from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {TranslateConfig, TRANSLATE_PROVIDERS} from 'angular2-translator';
import {MyApp} from './MyApp.component';

bootstrap(MyApp, [
  HTTP_PROVIDERS,
  TRANSLATE_PROVIDERS,
  provide(TranslateConfig, {useValue: new TranslateConfig({
    defaultLang: 'de',
    providedLangs: ['de', 'en', 'fr', 'es'],
    detectLanguageOnStart: true
  })})
]);
```
