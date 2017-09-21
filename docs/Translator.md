---
layout: default
title: TranslateService
permalink: /Translator.html
---
# Translator

The `Translator` holds the core functionality for this module. It is not only for translation also it provides
functions for control structures. For example: when you want to know if the language got loaded or changed you need
this class.

Translations can use params for dynamization (see  [Dynamize translations with params](docs/dynamize.md) for more info).

## The Public Properties

| Name            | Type                | Access level | Description |
|-----------------|---------------------|--------------|-------------|
| language        | string              | read/write   | The setter for this property is checking if the language is provided or not. If the language is not provided it does not change. |
| languageChanged | Observable<string>  | read         | The observer fires next when the language got changed. If you use translator manually (not the component or the pipe) you may want to update your translations on this event. |
| module          | string              | read         | The name of the module for this translator. |

## The Public Methods

### Synchronous Methods

These methods allow you to use the translations without passing a callback. The drawback is of course that they only
work when the translations got loaded. Often you need to wait till the translation table for the language got loaded.

#### instant

```ts
public instant(key: string, params?: any, language?: string): string
```

Translates the `key` into `language` synchronously using `params` for interpolation. When the language is not loaded or
the translation table does not have `key` it returns `key` - so make sure that the translation table is loaded
before (e. g. by using [`waitForTranslation()`](#prerequisite-waitfortranslation)):

```ts
expect(translator.instant('ISSUE_STATUS_IN_PROGRESS')).toEqual('in progress');
```

This method is used from every other method that follows (`instantArray`, `search`, `translate`, `translateArray`, 
`translateSearch`, `observe`, `observeArray` and `observeSearch`) and holds the basic functionality for translations.

> **Please note** that the signature changed in version 2.3 and the usage with array of keys is deprecated now. For
> backward compatibility it is still supported but will be removed in version 3. Use `instantArray()` instead.

#### instantArray

```ts
public instantArray(keys: string[], params?: any, language?: string): string[]
```

Translates `keys` into `language` synchronously using `params` for interpolation. Internally it is using instant for
each key - so it returns the keys when the language is not loaded. The translations are returned in strictly the same
order as the parameter keys.

```ts
expect(translator.instantArray(['KEY_1', 'KEY_2']))
    .toEqual(['translation for KEY_1', 'translation for KEY_2'])
```

> This method got implemented to have a more strict interface - this method accepts only array of strings and returns
> an array of strings.

#### search

```ts
public search(pattern: string, params?: any, language?: string): object
```

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

#### Prerequisite waitForTranslation 

To make synchronous methods work you need to make sure the translation tables got loaded. For this propose we provide
the following method:  

```ts
public waitForTranslation(language?: string): Promise<void>
```

Waits for language to be loaded. If language is not given it loads the current language. Returns a promise that gets
resolved once the language got loaded.

This method is not synchronous and when you are otherwise sure that the translations are loaded you can skip these
method.

```ts
translator.waitForTranslation().then(() => {
    showButton(translator.instant('BUTTON_TEXT'), actionCallback);
});

function actionCallback() {
    // we know the translations are loaded here
    showToast(translator.instant('SUCCESS_MESSAGE'));
}
```

### Thenable Methods 

These methods return a `Promise` that got resolved with the translation(s) once the translation table got loaded.
Please note that the `Promise` gets resolved with the requested language (or current language at the time it was 
called) and can not be used again when the language changed.

#### translate

```ts
public translate(key: string, params?: any, language?: string): Promise<string>
```

Translate `key` into `language` asynchronously using `params` for interpolation. If language is not given it uses the current language.

The promise always gets resolved. Even if the loader rejects and especially when the translation does not exist. In this
case the promise get resolved with `key`.

```ts
translator.translate('STATUS_OPEN')  .then((translation) => this.translations['open']   = translation);
translator.translate('STATUS_CLOSED').then((translation) => this.translations['closed'] = translation);
```

> **Please note** that the signature changed in version 2.3 and the usage with array of keys is deprecated now. For
> backward compatibility it is still supported but will be removed in version 3. Use `translateArray()` instead.

#### translateArray

```ts
public translateArray(keys: string[], params?: any, language?: string): Promise<string[]>
```

Like `translate` but using `instantArray` for translating an array of `keys`.

#### translateSearch

```ts
public translateSearch(pattern: string, params?: any, language?: string): Promise<object>
```

Like `translate` but using `search` to search for translations matching the given `pattern`.

### Observable Methods

These methods return an `Observable` that provides the translation(s) in the the current selected language. When the
language got changed they receive the new value after the translation table got loaded.

#### observe

```ts
public observe(key: string, params?: any): Observable<string>
```

Translate `key` into the current language using `params` for interpolation. Once the language got changed and the
translation table got loaded the observer receives the translation for the newly selected language.

Like translate the observable always get's a new value - even if the key the loader rejects to load the language and
especially when the `key` does not exist in translation table.

```ts
translator.observe('STATUS_OPEN')  .subscribe((translation) => this.translations['open']   = translation);
translator.observe('STATUS_CLOSED').subscribe((translation) => this.translations['closed'] = translation);
```

> **Please note** that the signature changed in version 2.3 and the usage with array of keys is deprecated now. For
> backward compatibility it is still supported but will be removed in version 3. Use `observeArray()` instead.

#### observerArray

```ts
public observeArray(keys: string[], params?: any): Observable<string[]>
```

Like `observe` but using `instantArray` for translating an array of `keys`.

#### observeSearch

```ts
public observeSearch(pattern: string, params?: any): Observable<object>
```

Like `observe` but using `search` to search for translations matching the given `pattern`.

This has an interesting use case when you need multiple translations in a component. For example with statuses:

```ts
// translation table:
translations = {
  STATUS_OPEN: 'open',
  STATUS_TO_DO: 'to do',
  STATUS_IN_PROGRESS: 'in progress',
  STATUS_RESOLVED: 'resolved',
  STATUS_CLOSED: 'closed',
};

class Issue {
    private statusTranslations: { [key: string]: string };
    
    constructor(private translator: Translator) {
        translator.observeSearch('STATUS_*').subscribe((statusTranslations) => {
            this.statusTranslations = statusTranslations;
        });
    }
    
    get status(): string {
        // assume statusKey is one of ['OPEN', 'TO_DO', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
        return this.statusTranslations[this.statusKey];
    }
}

```
