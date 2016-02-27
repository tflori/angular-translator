# angular2-translator

## Features
### Different loaders
#### JSON loader

Customize directory and extension
```javascript
import {MyApp} from './myApp';
import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {TRANSLATE_PROVIDERS, TranslateLoaderJsonConfig} from 'angular2-translator';

bootstrap(MyApp, [
  HTTP_PROVIDERS,
  TRANSLATE_PROVIDERS,
  provide(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig('app/localization', '-lang.json')})
])
```