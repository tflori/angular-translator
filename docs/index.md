---
layout: default
title: Introduction
permalink: /
---
# Angular2 Translator

[![Build Status](https://travis-ci.org/tflori/angular2-translator.svg?branch=master)](https://travis-ci.org/tflori/angular2-translator)
[![Coverage Status](https://coveralls.io/repos/github/tflori/angular2-translator/badge.svg?branch=master)](https://coveralls.io/github/tflori/angular2-translator?branch=master)
[![npm version](https://badge.fury.io/js/angular2-translator.svg)](https://badge.fury.io/js/angular2-translator)

Angular2 Translator is a module for translating texts in a Angular2 environment.

## The Classes

[TranslateConfig](TranslateConfig.html) - 
The TranslateConfig is a dependency for TranslateService. As the name suggests it gives a configuration for the TranslateService.

[TranslateService](TranslateService.html) - 
The TranslateService holds the core functionality for this module. It is not only for translation also
it provides functions for control structures.

[TranslateComponent](TranslateComponent.html) - 
This is a angular2 component for the selector `[translate]`

[TranslatePipe](TranslatePipe.html) - 
The TranslatePipe is the easiest way for translation but it has some drawbacks.

[TranslateLoaderJson](TranslateLoaderJson.html) - 
For now this is the only existing TranslateLoader.

## Further Readings

You can [make translations dynamic](dynamize.html) by giving parameter that can be used inside the translation.

Configure [TranslateLogHandler](TranslateLogHandler.html) to get informations about missing translations and other problems in your translations.

Create your own [TranslateLoader](TranslateLoader.html) that fits your needs.
