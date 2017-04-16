---
layout: default
title: TranslateLogHandler
permalink: /TranslateLogHandler.html
---
# TranslateLogHandler

This is a very simple class to log infos, errors and debug informations. The default provided class that is used by 
default just writes errors to `console.error`. The other two functions have no operations. If you want to send errors
to a logger and or output info or debug messages you have to extend this class.

Missing translations messages are send to `TranslateLogHandler.info`.

To overwrite the TranslateLogHandler you can just write this in your app module:
 ```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TranslateLogHandler, TranslatorModule } from 'angular-translator';

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
