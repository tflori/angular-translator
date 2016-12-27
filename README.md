# Angular2 Translator

[![Build Status](https://travis-ci.org/tflori/angular2-translator.svg?branch=master)](https://travis-ci.org/tflori/angular2-translator)
[![Coverage Status](https://coveralls.io/repos/github/tflori/angular2-translator/badge.svg?branch=master)](https://coveralls.io/github/tflori/angular2-translator?branch=master)
[![npm version](https://badge.fury.io/js/angular2-translator.svg)](https://badge.fury.io/js/angular2-translator)

`angular2-translator` is a simple translation service for angular2 applications. It should support all necessary
features for translation, like interpolation, references to other translations and so on.

## Features

### Interpolation

It supports interpolation so you can:

- output variables in your translations  
  `"HELLO":"Hello {{name}}!"`
- calculate in your translations  
  `"ANSWER":"The answer is {{7*6}}"`
- pluralize in your translations  
  `"MESSAGES":"You have {{count}} new message{{count != 1 ? 's' : ''}}"`
- execute functions in your translations  
  `"LAST_LOGIN":"Your last login was on {{lastLogin.format('MM/DD/YYYY')}}"`
  
[* dynamic translations](https://tflori.github.io/angular2-translator/dynamize.html)
  
### Refer to other translations

By referring to other translations you can make it easy to have everywhere the same text without copy and paste.
```json
{
  "GREETING": "Hello {{name}}!",
  "REGISTERED": "[[GREETING:name]] Thanks for registering at this service.",
  "LOGIN_CONFIRM": "[[GREETING:name]] Your last login was on {{lastLogin.format('L')}}."
}
```

[* dynamic translations](https://tflori.github.io/angular2-translator/dynamize.html)

### Different loaders

This module supports different loaders. Currently each loader has to load all translations for the app. You can write
your own loader or use the only one we have developed for you - the JSON loader.

[* TranslateLoader](https://tflori.github.io/angular2-translator/TranslateLoader.html)

#### JSON loader

It is a very basic loader that loads your JSON translation files. A translation can be an array to allow multiline
translations (to make the files readable and better structured).

[* TranslateLoaderJson](https://tflori.github.io/angular2-translator/TranslateLoaderJson.html)

## How to use

Simple basic usage:
```ts
import {Component} from "angular2/core";
import {TranslateService, TranslatePipe, TranslateComponent} from "angular2-translator";

@Component({
    selector: "my-app",
    template: "{TEXT|translate} is the same as <span translate=\"TEXT\"></span>"
})
export class AppComponent {
    constructor(translate: TranslateService) {
        translate.translate("TEXT").then(
          (translation) => console.log(translation)
        );
    }
}
```
To learn more have a look at [the documentation](https://tflori.github.io/angular2-translator/).

## How to install

### Via npm
First you need to install the package. The easiest way is to install it via npm:
```bash
npm install --save angular2-translator
```

Then you need to tell systemjs where to load angular2-translator:
```js
System.config({
    map: {
        'angular2-translator':       'npm:angular2-translator/bundles/angular2-translator.js'
    }
});
```
 
Or you load the file directly:
```html
<script type="text/javascript" src="node_modules/angular2-translator/bundles/angular2-translator.js"></script>
```

Now you have to set up your NgModule to use the `TranslatorModule` and may be configure it:
```ts
import {TranslateConfig, TranslatorModule} from "angular2-translator";

@NgModule({
    imports: [ TranslatorModule ],
    providers: [
      { provide: TranslateConfig, useValue: new TranslateConfig({
        defaultLang: "de",
        providedLangs: [ "de", "en" ],
      })},
    ]
})
export class AppModule {}
```

### Manually
You also can clone the repository and symlink the project folder or what ever:
```bash
git clone https://gitlab.w00tserver.org:617/tflori/angular2-translator
ln -s angular2-translator MyApp/libs/angular2-translator
```
> You should know what you do and don't follow this guide for installation.
