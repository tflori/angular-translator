# TranslateService

The TranslateService holds the core functionality for this module. It is not only for translation also
it provides functions for control structures.

## The properties

| Name            | Type                | Default              | Description |
|-----------------|---------------------|----------------------|-------------|
| lang            | string              | `config.defaultLang` | The language is stored in a private property. The setter for this property is checking if the language is provided or not. If the language is not provided it throws an error. *We suggest to write a try catch around it or check if the language is provided.* |
| languageChanged | Observable<string>  | -                    | The observer fires next when a new language get changed. If you use translate service maybe you want to update your translations on this event. |
| logHandler      | TranslateLogHandler | -                    | Holds the logHandler for other control structures. This is more or less internal - you should not use it. |

## The methods

### detectLang(navLangs:string[]):string|boolean  
Detects the preferred language by navLangs. It is an array of strings - you can give any array
of strings. It returns false if none of the languages is provided. Direct matches are preferred
over lazy matches.

Example:
```js
translateConfig.providedLangs = ['en/us', 'de/de', 'de/at'];

expect(translateService.detectLang(['de-AT'])).toBe('de/at');
```

### waitForTranslation(lang?:string):Promise<void>   
Waits for current language or given language to be loaded. Returns a promise that got be 
resolved once language got loaded.

If loader rejects the promise rejects too with the given reason.

Example:
```js
translateService.waitForTranslation().then(() => {
  this.translation = translateService.instant('TEXT');
});
```

### translate(keys:string|string[], params?:any, lang?:string):Promise<string|string[]>
Translate keys for current language or given language asynchronously. Translations can use
params for dynamization (see [Dynamize translations with params](docs/dynamize.md) for more info).

The promise always get resolved. Even if the loader rejects and especially when the translation
does not exist.

If keys is an array you get an array with the same order back.

Example:
```js
translateService.translate(['STATUS_OPEN', 'STATUS_CLOSED']).then((translations) => {
  this.translations['open'] = translations[0];
  this.translations['closed'] = translations[1];
});
```

### instant(keys:string|string[], params?:any, lang?:string):string|string[]
Basically it is the same like translate but it does not wait for translation. If you look in the code
you will see, that TranslateService::translate is using TranslateService::instant after translations
got loaded.

> We suggest to wait for translation before using it.

Example:
```js
translateService.waitForTranslation().then(() => {
  this.translations = {
    statuses: {
      open: translateService.instant('STATUS_OPEN'),
      closed: translateService.instant('STATUS_CLOSED')
    }
  }
});
```

