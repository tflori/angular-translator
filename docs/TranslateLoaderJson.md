# TranslateLoaderJson

The TranslateLoaderJson loads one json file for each language via angular2/http.

You have to add `HTTP_PROVIDERS` to your bootstrap to make it work.

## Multiline translations

To keep order in your translation file your can use arrays for translations. Example:
```json
{
  "COOKIE_INFORMATION": [
    "We are using cookies, to adjust our website to the needs of our customers.",
    "By using our websites you agree to store cookies on your computer, tablet or smartphone."
  ]
}
```

## TranslateLoaderJsonConfig

To configure TranslateLoaderJson you can create your own TranslateLoaderJsonConfig and provide it.

Configurable is the base path where translation files are served and the extension that is used.
```javascript
class TranslateLoaderJsonConfig {
  constructor(path: string, extension: string) {}
}
```

Default values are `path = 'i18n'` and `extension = '.json'` .

### Example with customized path and extension:
Directory structure:
```
+ project
  + app
    + localization
      - en-lang.json
      - de-lang.json
      - fr-lang.json
    - main.ts
    - myApp.ts
```

main.ts:
```javascript
import {MyApp} from './myApp';
import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {TRANSLATE_PROVIDERS, TranslateLoaderJsonConfig, TranslateConfig} from 'angular2-translator';

bootstrap(MyApp, [
  HTTP_PROVIDERS,
  TRANSLATE_PROVIDERS,
  provide(TranslateConfig, {useValue: new TranslateConfig({
    providedLangs: ['de','en','fr']  
  })}),
  provide(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig('app/localization', '-lang.json')})
]);
```
