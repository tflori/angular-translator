# Dynamize your translation with params

On every way (Component, Pipe and Service) you can give the translation params to make it dynamic. These params
can then be used in your translations.

## Example

This is a simple example with a count to show how it works.

Your translation file:
```json
{ "NEW_MESSAGES": "You have {{count}} new message{{count == 1 ? '' : 's'}}" }
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

## Loading other translations

You can load other translations in your translation with double brackets. This translations can not use the params that
are passed to the translation. To use a parameter you have to define which parameters goes to the sub translation by
writing them behind a colon and comma separated.

Other translations are loaded before the content of double braces got parsed.

### Limitations
- the referred translation key can only contain `[A-Za-z0-9_.-]`
- the submitted params can only contain `[A-Za-z0-9_]`

### Example
```json
{
  "HELLO": "Hello",
  "GREET": "[[ HELLO ]] {{name}}",
  "USER_LOGGED_IN": "[[GREET:name]], your last login was on {{lastLogin}}"
}
```

## Logic in translations

In general we can not recommend to use logic inside translations. But we know that sometimes it is much easier and of
course language related.

We suggest that you only use logic for language related stuff like pluralization like we did in the example.

## Provide parameters

Parameters have to be stored in an object. That is easy when you using javascript:
```js
this.user = {name:'Thomas', lastLogin: moment('2016-03-06 22:13:31')};
translateService.translate('USER_LOGGED_IN', {name:this.user.name,lastLogin:this.user.lastLogin.fromNow()})
```

For [TranslateComponent](docs/TranslateComponent.md) there is a second attribute `translateParams`. To pass variables
you need to write in brackets:
```html
<p translate="USER_LOGGED_IN" [translateParams]="{name:user.name,lastLogin:user.lastLogin.fromNow()}"></p>
```

It begins to get really bad for pipes - that is the drawback why we suggest to use the component for complicated things:
```html
<p>{{'USER_LOGGED_IN'|translate:'{name:\'' + user.name + '\',lastLogin:\'' + user.lastLogin.fromNow() + '\'}'}}</p>
```

Because pipes only accept predefined objects or string parameters we parse this parameter if it is string. That costs
and is not readable. It also looks like logic in your view.

Both examples in the view have by logic a higher cpu usage:
1. The object needs to be generated
2. The object has to be checked if it has changed

To have it under your control we suggest to use TranslateService::translate.
