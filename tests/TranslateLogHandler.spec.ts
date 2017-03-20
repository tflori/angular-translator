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
});
