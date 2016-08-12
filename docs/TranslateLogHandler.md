# TranslateLogHandler

This is a very simple interface to log infos, errors and debug informations. The default provided object that
implements this interface uses console.error() to log errors. The other two functions have no operations.

## Declartion

```ts
interface TranslateLogHandler {
    error(message:string):void;
    info(message:string):void;
    debug(message:string):void;
}
```

## Error messages
Currently there are just 4 error messages:

- In TranslateService
  - `"Language <lang> could not be loaded (<reason>)"` - When the TranslateLoader rejects his promise with <reason> for loading <lang>.
  - `"Parsing error for expression \"<expression>\""` - When an <expression> in a translation can not be parsed.
- In TranslatePipe
  - `"\"<translateParams>\" could not be parsed to object"` - When <translateParams> is a string and it can not be parsed to object.
- In TranslateComponent
  - `"Params have to be an object"` - When you give anything else than an object to translateParams attribute.
    
## Info messages
Currently there exists 4 info messages:

- In TranslateService
  - `"Language <lang> got detected"` - When language got detected on initialization.
  - `"Language changed to <lang>"` - When language got changed.
  - `"Language <lang> got loaded"` - When a language got loaded.
  - `"Translation for \"<key>\" in language <lang> not found"` - When a translation is missing.
  
## Debug messages
Currently there are no debug messages.
