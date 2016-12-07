---
layout: default
title: TranslateComponent
permalink: /TranslateComponent.html
---
# TranslateComponent

This is a angular2 component for the selector `[translate]`. It is a component and has a template that is not
keeping your html code inside of the element -> **the element should be empty**.
 
## Example
```html
<p translate="LICENSE">Loading... this text will be replaced by the translated value</p>
```

## Parameters
To [dynamize](docs/dynamize.md) your translation you can add parameters in the attribute `translateParams`. Keep
in minde that it will be a string if you don't add brackets around the parameter and translation only accepts
objects.

```html
<p translate="TODAY" [translateParams]="{date: new Date()}"></p> 
```

## Variable Translation Key
You can make the key variable in two different ways.

By adding brackets:
```html
<p [translate]="'SOME_'+key"></p>
```

By using variable inside attribute:
```html
<p translate="SOME_{{key}}"></p>
```
