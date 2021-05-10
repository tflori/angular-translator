// tslint:disable:no-console
export class TranslateLogHandler {
    public error(message: string | Error): void {
        if (console && console.error) {
            console.error(message);
        }
    }

    public info(message: string): void {
    }

    public debug(message: string): void {
    }
}
