# Angular2 Translator

Angular2 Translator is a module for translating texts in a Angular2 environment.

## The Classes

[TranslateConfig](docs/TranslateConfig.md) - 
The TranslateConfig is a dependency for TranslateService. As the name suggests it gives a configuration for the TranslateService.

[TranslateService](docs/TranslateService.md) - 
The TranslateService holds the core functionality for this module. It is not only for translation also
it provides functions for control structures.

[TranslateComponent](docs/TranslateComponent.md) - 
This is a angular2 component for the selector `[translate]`

[TranslatePipe](docs/TranslatePipe.md) - 
The TranslatePipe is the easiest way for translation but it has some drawbacks.

[TranslateLoaderJson](docs/TranslateLoaderJson.md) - 
For now this is the only existing TranslateLoader.

## Further Readings

You can [Dynamize](docs/dynamize.md) translations by giving parameter that you can use inside the translations.

Configure [TranslateLogHandler](docs/TranslateLogHandler.md) to get informations about missing translations and other problems in your translations.

Create your own [TranslateLoader](docs/TranslateLoader.md) that fits your needs.
