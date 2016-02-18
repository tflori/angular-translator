# angular2-translator

## Features
### Different loaders
#### JSON loader

Customize directory and extension
```TypeScript
import {MyApp} from './myApp';
import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {TranslateLoaderJsonConfig} from 'angular2-translator/Translate';

bootstrap(MyApp, [
  provide(TranslateLoaderJsonConfig, {useValue: new TranslateLoaderJsonConfig('app/localization', '-lang.json')})
])
```