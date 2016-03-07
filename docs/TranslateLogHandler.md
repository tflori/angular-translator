# TranslateLogHandler

This is a very simple interface to log infos, errors and debug informations.

```js
interface TranslateLogHandler {
    error(message:string):void;
    info(message:string):void;
    debug(message:string):void;
}
```
