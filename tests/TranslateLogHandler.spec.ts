import {
    TranslateLogHandler,
} from "../index";

describe("TranslateLogHandler", () => {
    it("writes errors to console.error", () => {
        spyOn(console, "error");
        let logHandler: TranslateLogHandler = new TranslateLogHandler();

        logHandler.error("This was bad");

        expect(console.error).toHaveBeenCalledWith("This was bad");
    });

    it("does not throw when console.error is undefined", () => {
        let logHandler: TranslateLogHandler = new TranslateLogHandler();
        let error = console.error;

        delete console.error;
        let action = function action() {
            logHandler.error("This was bad");
        };

        expect(action).not.toThrow();
        console.error = error;
    });
});
