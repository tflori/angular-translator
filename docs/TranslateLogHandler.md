---
layout: default
title: TranslateLogHandler
permalink: /TranslateLogHandler.html
---
# TranslateLogHandler

This is a very simple class to log infos, errors and debug informations. The default provided class used just writes
errors to `console.error`. The other two functions have no operations. If you want to send errors to a logger
and or output info or debug messages you have to extend this class:

To overwrite this you can just write this in your app module:
 ```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TranslateLogHandler, TranslatorModule } from 'angular2-translator';

import { AppComponent } from './app.component';

export class AppTranslateLogHandler extends TranslateLogHandler {
  public info(message: string) {
    if (console && console.log) {
      console.log(message);
    }
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    TranslatorModule
  ],
  providers: [
    { provide: TranslateLogHandler, useClass: AppTranslateLogHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
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
