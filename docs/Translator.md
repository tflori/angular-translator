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

### instant(key: string, params?: any, language?: string): string

Translates the `key` into `language` synchronously using `params` for interpolation. When the language is not loaded it
returns the key - so make sure that the translation table is loaded before. For example by using `waitForTranslation()`:

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

This method is used from every other method that follows (`instantArray`, `search`, `translate`, `translateArray`, 
`translateSearch`, `observe`, `observeArray` and `observeSearch`) and holds the basic functionality for translations.

> **Please note** that the signature changed in version 2.3 and the usage with array of keys is deprecated now. For
> backward compatibility it is still supported but will be removed in version 3. Use `instantArray()` instead.

### instantArray(keys: string[], params?: any, language?: string): string[]

Translates `keys` into `language` synchronously using `params` for interpolation. Internally it is using instant for
each key - so it returns the keys when the language is not loaded. The translations are returned in strictly the same
order as the parameter keys.

```ts
expect(translator.instantArray(['KEY_1', 'KEY_2']))
    .toEqual(['translation for KEY_1', 'translation for KEY_2'])
```

> This method got implemented to have a more strict interface - this method excepts only array of strings and returns
> an array of strings.

### search(pattern: string, params?: any, language?: string): object

Searches synchronously for translations that matches `pattern` and returns an object with translations for each match
in `language` using `params` for interpolation. It removes common text from pattern from keys in the object:

```ts
expect(translator.search('MONTH_*')).toEqual({
    JAN: "January",
    FEB: "Februrary",
    MAR: "March",
    APR: "April",
    MAY: "May",
    "...": "and so on",
});
``` 

### translate(keys: string|string[], params?: any, language?: string): Promise<string|string[]>

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

