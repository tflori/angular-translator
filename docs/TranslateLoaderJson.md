# TranslateLoaderJson

The TranslateLoaderJson loads one json file for each language via angular2/http.

You have to add `HTTP_PROVIDERS` to your bootstrap to make it work.

## TranslateLoaderJsonConfig

To configure TranslateLoaderJson you can create your own TranslateLoaderJsonConfig and provide it.

Configurable is the base path where translation files are served and the extension that is used.
```js
class TranslateLoaderJsonConfig {
  constructor(path:string, extension:string) {}
}
```

### Example:
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
