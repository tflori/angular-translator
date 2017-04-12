# Angular Translator

[![Build Status](https://travis-ci.org/tflori/angular-translator.svg?branch=master)](https://travis-ci.org/tflori/angular-translator)
[![Coverage Status](https://coveralls.io/repos/github/tflori/angular-translator/badge.svg?branch=master)](https://coveralls.io/github/tflori/angular-translator?branch=master)
[![npm version](https://badge.fury.io/js/angular-translator.svg)](https://badge.fury.io/js/angular-translator)

`angular-translator` is a simple translation service for angular applications. It should support all necessary
features for translation. Like interpolation, references to other translations, modules and loaders.

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
  
[* dynamic translations](https://tflori.github.io/angular-translator/dynamize.html)
  
### Refer to other translations

By referring to other translations you can make it easy to have everywhere the same text without copy and paste.

```json
{
  "GREETING": "Hello {{name}}!",
  "REGISTERED": "[[GREETING:name]] Thanks for registering at this service.",
  "LOGIN_CONFIRM": "[[GREETING:name]] Your last login was on {{lastLogin.format('L')}}."
}
```

[* dynamic translations](https://tflori.github.io/angular-translator/dynamize.html)

### Modules

Your translations can be divided to multiple modules. Each module can have a different configuration. This way you have
more control over the size of translation files and are able to provide some modules in more or less languages.

[* Modules](https://tflori.github.io/angular-translator/modules.html)

### Different loaders

This module supports different loaders. It is shipped with a basic JSON loader (next paragraph). You can create own 
and static loaders. It is also possible to use different loader strategies for each module.

[* TranslationLoader](https://tflori.github.io/angular-translator/TranslationLoader.html)

#### JSON loader

It is a basic loader that loads the translation for a specific language and module from your JSON file. A translation
can be an array to allow multi line translations (to make the files readable and better structured).

[* TranslationLoaderJson](https://tflori.github.io/angular-translator/TranslationLoaderJson.html)

## How to use

Simple basic usage:

```ts
import { Component } from "angular2/core";
import { Translator } from "angular-translator";

@Component({
    selector: "my-app",
    template: "{TEXT|translate} is the same as <span translate=\"TEXT\"></span>"
})
export class AppComponent {
    constructor(translator: Translator) {
        translator.translate("TEXT").then(
          (translation) => console.log(translation)
        );
    }
}
```

To learn more have a look at [the documentation](https://tflori.github.io/angular-translator/).

## How to upgrade from angular2-translator

1. Upgrade the package
  - remove angular2-translator
  - install angular-translator
  
2. Update your setup
  - use `TranslatorModule.forRoot()`
  
3. Change the implementation from TranslateService to Translator
  - same functionality
  
4. Change the implementation for changing the language
  - you can use `Translator` if you don't plan to have multiple modules
  - we suggest to use `TranslatorContainer.language` to change the language

## How to install

### Get the package

First you need to install the package. The easiest way is to install it via npm:

```bash
npm install --save angular-translator
```

## Setup angular module

You have to set up each `NgModule`  where you want to use the `TranslatorModule` and may be configure it:

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslatorModule } from "angular-translator";

import { AppComponent } from './app.component';

export function translateConfigFactory() {
    return new TranslateConfig();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TranslatorModule.forRoot({
      defaultLang: "de",
      providedLangs: [ "de", "en" ],
      detectLanguageOnStart: false
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Using SystemJs

When you are using SystemJs you need to configure where to load angular-translator:

```js
System.config({
    map: {
        'angular-translator':       'npm:angular-translator/bundles/angular-translator.js'
    }
});
```

### Manually

You also can clone the repository and symlink the project folder or what ever:

```bash
git clone https://github.com/tflori/angular-translator.git
ln -s angular-translator MyApp/libs/angular-translator
```

> You should know what you do and don't follow this guide for installation.
