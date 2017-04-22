---
layout: default
title: Dynamic Translations
permalink: /dynamize.html
---
# Make your translations dynamic

On every way (Component, Pipe and Service) you can give the translation params to make it dynamic. These params
can then be used in your translations.

## Example

This is a simple example with a count to show how it works.

Your translation file:

```json
{ "NEW_MESSAGES": "You have {% raw %}{{ count }}{% endraw %} new message{% raw %}{{ count == 1 ? '' : 's' }}{% endraw %}" }
```

In your component you can use it like this:

```ts
translator.translate('NEW_MESSAGES', {count: 42}).then((translation) => this.translation = translation);
```

In your template are two ways to use it:

```html
<h5>pipe example</h5>
<p>{% raw %}{{ 'NEW_MESSAGES' | translate : { count: 42 } }}{% endraw %}</p>

<h5>component example</h5>
<p translate="NEW_MESSAGES" [translateParams]="{ count: 0 }"></p>
```

## Loading other translations

You can load other translations in your translation with double brackets. This translations can not use the params that
are passed to the translation. To use a parameter you have to define which parameters goes to the sub translation by
writing them behind a colon and comma separated.

Other translations are loaded before the content of double braces got parsed.

### Passing parameters

Parameters can be passed directly under the same name, with a different name and partially. To pass a variable with a 
different name you define a getter. To pass a variable with the same name you can leave the getter empty. The getter
can contain dots which means that you refer to the `object.key` and pass only key from this object.

### Limitations
- the referred translation key can only contain `[A-Za-z0-9_.-]`
- the submitted params can only contain `[A-Za-z0-9_]`

### Example

```json
{
  "HELLO": "Hello",
  "GREET": "[[ HELLO ]] {% raw %}{{name}}{% endraw %}",
  "USER_LOGGED_IN": "[[GREET:name]], your last login was on {% raw %}{{lastLogin}}{% endraw %}",
  "SALUTATION": "{% raw %}{{title ? title : (gender == 'w' ? 'Mrs.' : 'Mr.')}} {{firstName}} {{lastName}}{% endraw %}",
  "WELCOME": [
    "Welcome [[ SALUTATION : ",
      "title=user.title, gender=user.gender, firstName=user.firstName, lastName=user.lastName",
    "]]"
  ]
}
```

> In this example we use `string[]` as translation. See [TranslationLoaderJson](TranslationLoaderJson.md) for more
> details.

## Logic in translations

In general we can not recommend to use logic inside translations. But we know that sometimes it is much easier and of
course language related.

> We suggest that you only use logic for language related stuff like pluralization like we did in the example.

## Provide parameters

Parameters have to be stored in an object. That is easy when you using javascript:

```ts
this.user = { name:'Thomas', lastLogin: moment('2016-03-06 22:13:31') };
translator.translate(
  'USER_LOGGED_IN', 
  { 
    name: this.user.name,
    lastLogin: this.user.lastLogin.fromNow()
  }
);
```

For [TranslateComponent](TranslateComponent.md) there is a second attribute `translateParams`. To pass variables
you need to write in brackets:

```html
<p   translate        = "USER_LOGGED_IN"
    [translateParams] = "{ name: user.name, lastLogin: user.lastLogin.fromNow() }"></p>
```

For [TranslatePipe](TranslatePipe.md) you pass the params as first parameter:

```html
<p>{% raw %}{{ 'USER_LOGGED_IN' | translate: { name: user.name, lastLogin: user.lastLogin.fromNow() } }}{% endraw %}</p>
```

To generate objects inside the view looks some bit like logic in templates. A more reasonable way will be to create
the object inside the component and pass it to pipe or params:

```html
<p translate="USER_LOGGED_IN" [translateParams]="user"></p>
<p>{% raw %}{{ 'USER_LOGGED_IN' | translate: user }}{% endraw %}</p>
```

This works only if you define lastLogin in user as string, or use a method of moment in your translation.

```ts
this.user = { name: 'Thomas', lastLogin: moment('2016-03-06 22:13.31').format('LLL') }
```

```json
{
  "USER_LOGGED_IN": "[[ GREET : name ]], your last login was on {% raw %}{{ lastLogin.format('LLL') }}{% endraw %}"
}
```

## Performance

To pass parameters to the pipe or the component have a slightly performance drawback because the objects needs to be
checked every time if they changed.

To have it under your control we suggest to use `Translator.translate()` or `Translator.instant()`. You can
then subscribe to `Translator.languageChanged` to change your translation when the language got changed. Also you
will know when your values have changed.

## Use pipes in translations

By default you can use the pipes `CurrencyPipe`, `DatePipe`, `DecimalPipe`, `JsonPipe`, `LowerCasePipe`, `PercentPipe`,
`SlicePipe`, `TitleCasePipe` and `UpperCasePipe`. 

Custom pipes can get tricky because we can't get the annotations. And therefore we don't know the name. There are two
workarounds. First (recommended): you can add a `public static pipeName` property to your pipe. Second: you provide a 
pipe map to configuration.

Anyway you need to pass them to the configuration. Here we use both methods to ge the custom pipe working:

```ts
// the pipe
@Pipe({
  name: 'random',
  pure: true
})
export class RandomPipe implements PipeTransform {
  public static pipeName = 'random';

  transform(type: string, ...args: any[]): any {
    if (!args[0] || !args[0][value]) {
      return 'unknown';
    }

    return args[0][type][Math.floor(Math.random() * args[0][value].length)];
  }
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    TranslatorModule.forRoot({
      pipes: [ RandomPipe ],
      pipeMap: { random: RandomPipe }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Then you can also use this pipe:

{% raw %}
```json
{
    "FUN": [
        "{{ type | random: { joke: [",
            "'What\\'s the difference between snowmen and snowladies? Snowballs',",
            "'How do you make holy water? You boil the hell out of it.',",
            "'I say no to alcohol, it just doesn\\'t listen.',",
        "] } }}"
    ]
}
```
{% endraw %}

For the default pipes you can get more information in 
[the official API reference](https://angular.io/docs/ts/latest/api/#!?query=pipe)
