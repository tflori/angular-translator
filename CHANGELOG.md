# Change Log

## Version 1.0.3

* added documentation for TranslateLoader and TranslatePipe (solves #5)
* updated compatibility to angular2 rc4
* changed interpolation from with statement to call (see breaking changes)

### breaking changes

#### Changed interpolation

Before we used a with statement. That way we could use the values from params directly. The with statement is not
allowed in strict mode so we removed it. Now we set `this` to the params object: 
```js
// before
translations = { 'GREET': 'Hello {{firstName}} {{lastName}}'}
// after
translations = { 'GREET': 'Hello {{this.firstName}} {{this.lastName}}'}
```
