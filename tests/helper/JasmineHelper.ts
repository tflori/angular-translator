export class JasmineHelper {
    public static calls(spy: any): jasmine.Calls {
        return spy.calls;
    }
}
