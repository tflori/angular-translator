declare module JasminePromiseMatchers  {
    export function install():void;
    export function uninstall():void;
}

declare module jasmine {

    interface Matchers<T> {
        /**
         * Verifies that a Promise is (or has been) rejected.
         */
        toBeRejected(done?: () => void): boolean;

        /**
         * Verifies that a Promise is (or has been) rejected with the specified parameter.
         */
        toBeRejectedWith(value: any, done?: () => void): boolean;

        /**
         * Verifies that a Promise is (or has been) resolved.
         */
        toBeResolved(done?: () => void): boolean;

        /**
         * Verifies that a Promise is (or has been) resolved with the specified parameter.
         */
        toBeResolvedWith(value: any, done?: () => void): boolean;
    }
}
