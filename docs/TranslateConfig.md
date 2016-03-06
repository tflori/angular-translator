# TranslateConfig

The TranslateConfig is a dependency for TranslateService. As the name suggests it gives a configuration for the TranslateService.

You can change the parameters by giving an object to the constructor:
```js
import {TranslateConfig} from 'angular2-translator';

new TranslateConfig({
  defaultLang: 'de'
});
```
## The parameters:

**`defaultLang:string`** <span style="font-size: 75%">default value: `'en'`</span>  
Defines the default language to be used if no language got set and language detection
is disabled or does not detect a language.

**`providedLangs:string[]`** <span style="font-size: 75%">default value: `['en']`</span>  
Dfines a list of the languages that are supported from you. The provided langs has to match your
file names. To make language detection work you should use the ISO format 639-1 (e.g. 'en')
or the IETF language tag (e.g. 'de-AT'). You don't have to use "-" and don't have to
care about case sensitive. A language 'en/us' will also match a browser language en-US and
vise versa - but the file has to be *path*\*en/us\**extension* then.

**`detectLanguageOnStart:boolean`** <span style="font-size: 75%">default value: `true`</span>  
Defines whether the language should be detected by navigator.language(s) when TranslateService
got initialized or not.

## The properties:

**\<all parameters\>**  
Each parameter is available as property (e. g. `translateConfig.providedLangs = ['en','de']`).

**`navigatorLanguages:string[]`**  
Holds an array of languages the browser accepts. Mostly it is exactly `navigator.languages` but
for browsers that only define `navigator.language` it is `[navigator.language]`. If nothing is
defined by the browser it is simply an empty array.

## The functions:

**`langProvided(lang:string, direct:boolean):string`**  
Tries to find matching provided language and returns the provided language. The provided
language and the language that is searched are getting normalized for matching. That means
that `'EN/usa'` is getting `'en-US'`.
```js
import {TranslateConfig} from 'angular2-translator';

var translateConfig = new TranslateConfig({
  providedLangs: ['EN', 'EN/usa']
});

expect(translateConfig.langProvided('en-US')).toBe('EN/usa');
```

## Complete example
```js
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
