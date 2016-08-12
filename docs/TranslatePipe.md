# TranslatePipe

The TranslatePipe is the easiest way for translation but has a major drawback. To give pipes data you need to prepare
the data before or generate a JSON-like string that can be parsed. Anyway it is more complex and will look like
logic in your view.

Another problem is the value that should be translated. If it comes from a variable it has to be translated again on 
every dirtycheck.

## Usage

Here are some examples how we can use it:
```html
<h5>Simple translation of words or phrases</h5>
<p>{{'HELLO WORLD'|translate}}</p><!-- pipes we only suggest for this simple usage -->

<h5>Translate a variable</h5>
<p>{{status|translate}}</p><!-- assume status contains 'PENDING' or 'DONE' or something translatable -->

<h5>Translate with variable</h5>
<p>{{'LAST LOGIN'|translate:logindate}}</p><!-- assume logindate contains a Date object -->

<h5>Translate with defined parameters</h5>
<p>{{'GREET'|translate:'{firstName:\''+user.firstName+'\',lastName:\''+user.lastName+'\'}'}}</p><!-- most unreadable case -->
```

## Better translate before

For the most usecases we suggest you to translate before in the component. Here are the examples again:
```ts
import {Component} from '@angular/core';
import {TranslateService} from 'angular2-translator';

@Component({
  selector: 'my-component',
  template: `
    <p>{{translatedStatus}}</p>
    
    <p>{{lastLogin}}</p>
    
    <p>{{greeting}}</p>
  `
})
export class MyComponent {
  constructor(translate: TranslateService) {
    this.status = 'PENDING';
    
    this.logindate = new Date('2016-02-11');
    
    this.user = {
      firstName: 'John',
      lastName: 'Doe'
    }
    
    TranslateService.waitForTranslation().then(() => {
      this.translatedStatus = TranslateService.instant(status);
      
      this.lastLogin = TranslateService.instant('LAST LOGIN', logindate);
      
      this.greeting = TranslateService.instant('GREET', this.user);
    });
  }
}
```
