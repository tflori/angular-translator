---
layout: default
title: TranslatePipe
permalink: /TranslatePipe.html
---
# TranslatePipe

The TranslatePipe is the easiest way for translation.

## Usage

Here are some examples how we can use it:

```html
<h5>Simple translation of words or phrases</h5>
<p>{% raw %}{{ 'HELLO_WORLD' | translate }}{% endraw %}</p>

<h5>Translate a variable</h5>
<p>{% raw %}{{ status | translate }}{% endraw %}</p>

<h5>Translate with variable</h5>
<p>{% raw %}{{ 'LAST_LOGIN' |translate: logindate }}{% endraw %}</p>

<h5>Translate with defined parameters</h5>
<p>{% raw %}{{ 'GREET' | translate: { firstName: user.firstName, lastName: user.lastName } }}{% endraw %}</p>
```

## Module

You can use a specific module by adding a second parameter. If this parameter is not given the provided `Translator`
will be used. You can overwrite the provided translator in the component (described in section [Modules](modules.md)).

```html
<p>{% raw %}{{ 'TITLE' | translate:{}:'admin' }}{% endraw %}</p>
```

## Better translate before

For the most use cases we suggest you to translate before in the component. Here are the examples again:

```ts
import { Component } from '@angular/core';

import { Translator } from 'angular-translator';

@Component({
    selector: 'my-component',
    template: '
<p>{% raw %}{{ translatedStatus }}{% endraw %}</p>

<p>{% raw %}{{ lastLogin }}{% endraw %}</p>

<p>{% raw %}{{ greeting }}{% endraw %}</p>'
})
export class MyComponent {
    constructor(private translator: Translator) {
        this.status = 'PENDING';
        
        this.logindate = new Date('2016-02-11');
        
        this.user = {
              firstName: 'John',
              lastName: 'Doe'
        }
        
        this.getTranslations();
        
        translator.languageChanged.subscribe(() => this.getTranslations());
    }
  
    private getTranslations() {
        TranslateService.waitForTranslation().then(() => {
            this.translatedStatus = TranslateService.instant(status);
            
            this.lastLogin = TranslateService.instant('LAST LOGIN', logindate);
            
            this.greeting = TranslateService.instant('GREET', this.user);
        });
    }
}
```
