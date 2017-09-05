---
layout: default
title: TranslateLoaderJson
permalink: /TranslationLoaderJson.html
---
# TranslationLoaderJson

The TranslateLoaderJson loads one json file for each language via angular2/http.

## Multiline translations

To keep order in your translation file your can use arrays for translations. Example:

```json
{
  "COOKIE_INFORMATION": [
    "We are using cookies, to adjust our website to the needs of our customers. ",
    "By using our websites you agree to store cookies on your computer, tablet or smartphone."
  ]
}
```

## Nested translation tables

For more structure in your translation file we allow objects. Please note that they are merged to one dimension.

```json
{
  "app": {
    "loginText": "Please login before continuing!",
    "componentA": {
      "TEXT": "something else"
    }
  }
}
```

The translation table becomes:

```json
{
  "app.loginText": "Please login before continuing!",
  "app.componentA.TEXT": "something else"
}
```

So you can access them with `translate('app.loginText')`. You need to refer to translations with full key too:

```json
{
  "app": {
    "A": "This gets \"something else\": [[ TEXT ]]",
    "B": "This gets \"something\" [[ app.TEXT ]]",
    "TEXT": "something"
  },
  "TEXT": "something else"
}
```

## Configure

There is only one option that can be changed: the path where to load json files. This path can contain two
variables in mustache style. The default value is `assets/i18n/{{ module }}/{{ language }}.json`. To change it you
pass this option to the configuration like here:

> **CAUTION:** the default values changed from version 1.4. Before the default path was `i18n` - so you either change
> this in your config or move the files.

### Example with customized path and extension:
Directory structure:

```
+ project
  + assets
    + localization
          - en-lang.json
          - de-lang.json
          - fr-lang.json
  + app
    - main.ts
    - myApp.ts
```

main.ts:

{% raw %}
```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TranslatorModule } from 'angular-translator';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TranslatorModule.forRoot({
      providedLanguages: ['en', 'de', 'fr'],
      loaderOptions: {
        path: 'assets/localization/{{language}}-lang.json
      }
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
{% endraw %}
