# Angular2 Translator

## How to install

### Via npm
First you need to install the package. The easiest way is to install it via npm:
```bash
npm install --save angular2-translator
```

Then you need to load the bundle in your .html-file. Example:
```html
<script type="text/javascript" src="node_modules/angular2-translator/bundles/angular2-translator.js"></script>
```

And the only thing left is to load the providers it in your main file:
```javascript
import {HTTP_PROVIDERS} from 'angular2/http';
import {TRANSLATE_PROVIDERS} from 'angular2-translator';

bootstrap(MyApp, [
  HTTP_PROVIDERS,
  TRANSLATE_PROVIDERS
]);
```

### Manually
You also can clone the repository and symlink the project folder or what ever:
```bash
git clone https://gitlab.w00tserver.org:617/tflori/angular2-translator
ln -s angular2-translator MyApp/libs/angular2-translator
```
> You should know what you do and don't follow this guide for installation.

## How to use

Simple basic usage:
```javascript
import {Component} from 'angular2/core';
import {TranslateService, TranslatePipe, TranslateComponent} from 'angular2-translator';

@Component({
    selector: 'my-app',
    template: '{TEXT|translate} is the same as <span translate="TEXT"></span>',
    pipes: [TranslatePipe],
    directives: [TranslateComponent]
})
export class AppComponent {
    constructor(translate: TranslateService) {
        translate.translate('TEXT').then(
          (translation) => console.log(translation)
        );
    }
}
```

To learn more have a look at [the docs](https://gitlab.w00tserver.org:617/tflori/angular2-translator/blob/master/docs/index.md)

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
