# Dynamize your translation with params

On every way (Component, Pipe and Service) you can give the translation params to make it dynamic. These params
can then be used in your translations.

## Example

This is a simple example with a count to show how it works.

Your translation file for en:
```json
{ "NEW_MESSAGES": "You have {{count}} new message{{count > 1 ? 's' : ''}}" }
```

Your translation file for de:
```json
{ "NEW_MESSAGES": "Sie haben {{count}} neue Nachricht{{count > 1 ? 'en' : ''}}" }
```

In your component you can use it like this:
```js
translateService.translate('NEW_MESSAGES', {count: 42}).then((translation) => this.translation = translation);
```

In your template are two ways to use it:
```html
<h5>pipe example</h5>
<p>{{'NEW_MESSAGES'|translate:'{count:42}'}}</p>

<h5>component example</h5>
<p translate="NEW_MESSAGES" [translateParams]="{count:42}"></p>
```
