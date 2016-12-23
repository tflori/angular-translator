---
layout: default
title: TranslateLoaderJson
permalink: /TranslateLoaderJson.html
---
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

## Filters

For convenience this loader will automatically filter out every translation key, which is not ether a object, array or string.

Multiple nestings are allowed. For example:

```json
{
  "TEXT": {
    "NESTED": "This is a text"
  },
  "COOKIE_INFORMATION": [
    "We are using cookies to adjust our website to the needs of our customers. ",
    "By using our websites you agree to store cookies on your computer, tablet or smartphone.",
  ]
}
```

## TranslateLoaderJsonConfig

To configure TranslateLoaderJson you can create your own TranslateLoaderJsonConfig and provide it.

Configurable is the base path where translation files are served and the extension that is used.

```ts
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

```ts
import {TranslateLoaderJsonConfig, TranslatorModule} from "angular2-translator";

@NgModule({
    imports: [ TranslatorModule ],
    providers: [
      { provide: TranslateLoaderJsonConfig, useValue: new TranslateLoaderJsonConfig('app/localization', '-lang.json') },
    ]
})
```
