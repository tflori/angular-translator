---
layout: default
title: TranslateContainer
permalink: /TranslatorContainer.html
---
# TranslatorContainer

The `TranslationContainer` is a container that holds all instances of `Translator` and creates new instances when
needed.

It also has a property `language` where you can change the language for all contained `Translator` instances. To get
this to work every module should have a subset of provided languages.

## The Public Properties

| Name            | Type                | Access level | Description |
|-----------------|---------------------|--------------|-------------|
| language        | string              | read/write   | The setter for this property is checking if the language is provided in the root configuration or not. If the language is not provided it does not change. |
| languageChanged | Observable<string>  | read         | The observer fires next when the language got changed. All `Translator` instances subscribe to this `Observable`. |

## The Public Methods

### getTranslator(module: string): Translator

One reason to use this class is to get a `Translator` for a specific module when you don't want to overwrite the
provider for `Translator`.

```ts
import { Injectable } from '@angular/core';

import { Translator, TranslatorContainer } from 'angular-translator';

@Injectable()
export class MyService {
  public translations: object = {};
  
  constructor(private translator: Translator, private translatorContainer: TranslatorContainer) {
    // this comes from default module (assets/i18n/{{language}}.json)
    translator.translateArray(['STATUS_PENDING', 'STATUS_DONE']).then((translations) => {
        this.translations['STATUS_PENDING'] = translations[0];
        this.translations['STATUS_DONE'] = translations[1];
    });
    
    // ['months.0', 'month.1', ...'month.11']
    let months = [...Array(12).keys()].map(function(i) { return 'month.'+i; });
    
    // this comes from 'calendar' module (assets/i18n/calendar/{{language}}.json)
    translatorContainer.getTranslator('calendar').translate(months).then((months) => {
        this.translations['months'] = months;
    });
  }
}
```
