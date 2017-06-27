---
layout: default
title: TranslateService
permalink: /Translator.html
---
# Translator

The `Translator` holds the core functionality for this module. It is not only for translation also it provides
functions for control structures. For example: when you want to know if the language got loaded or changed you need
this class.

## The Public Properties

| Name            | Type                | Access level | Description |
|-----------------|---------------------|--------------|-------------|
| language        | string              | read/write   | The setter for this property is checking if the language is provided or not. If the language is not provided it does not change. |
| languageChanged | Observable<string>  | read         | The observer fires next when the language got changed. If you use translator manually (not the component or the pipe) you may want to update your translations on this event. |
| module          | string              | read         | The name of the module for this translator. |

## The Public Methods

### waitForTranslation(language?: string): Promise<void>

Waits for language to be loaded. If language is not given it loads the current language. Returns a promise that got be 
resolved once language got loaded.

Example:

```ts
translator.waitForTranslation().then(() => this.translation = translator.instant('TEXT'));
```

### translate(keys: string|string[], params?: any, lang?: string): Promise<string|string[]>

Translate keys language asynchronously. Translations can use params for dynamization (see 
[Dynamize translations with params](docs/dynamize.md) for more info). If language is not given it uses the current
language.

The promise always get resolved. Even if the loader rejects and especially when the translation does not exist. In this
case the promise get resolved with the keys itself.

If keys is an array you get an array with the same order back.

```ts
translator.translate(['STATUS_OPEN', 'STATUS_CLOSED']).then((translations) => {
  this.translations['open'] = translations[0];
  this.translations['closed'] = translations[1];
});
```

### observe(keys: string|string[], params?: any): Observable<string|string[]>

Instead of using the language given it is using the current language and pushes the translation for the new language
every time when the language got changed.

```ts
translator.observe(['STATUS_OPEN', 'STATUS_CLOSED']).subscribe((translations) => {
  this.translations['open'] = translations[0];
  this.translations['closed'] = translations[1];
});
```

### instant(keys: string|string[], params?: any, lang?: string): string|string[]

Basically it is the same like `translate` but it does not wait for translation and can therefore be synchronous. When
you take a look in the code you will see that `translate` is using `instant` after translations got loaded.

```ts
translator.waitForTranslation().then(() => {
  this.translations = {
    statuses: {
      open: translator.instant('STATUS_OPEN'),
      closed: translator.instant('STATUS_CLOSED')
    }
  }
});
```

