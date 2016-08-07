import {flushMicrotasks} from "@angular/core/testing";

export class PromiseMatcher {
    public static getInstance() {
        if (!this._instance) {
            this._instance = new PromiseMatcher();
        }
        return this._instance;
    }

    public static install() {
        PromiseMatcher.getInstance()._install();
    }

    public static uninstall() {
        PromiseMatcher.getInstance()._uninstall();
    }

    private static _instance: PromiseMatcher;

    private _originalPromise: any;
    private _global: any;

    constructor() {
        this._global = window || global;
        this._originalPromise = this._global.Promise;
    }

    private _install() {
        if (this._global.Promise === JasminePromise) {
            return;
        }
        JasminePromise.NativePromise = this._originalPromise;
        JasminePromise.initialize();
        this._global.Promise = JasminePromise;

        let createCompareFn = function(util, customs, state: string, withArgs: boolean = false) {
            return function(promise, ...args) {
                if (!(promise instanceof JasminePromise)) {
                    throw new Error("Promse is not a JasminePromise - did you run PromiseMatcher.install()?");
                }
                return promise.verify(util, customs, state, withArgs ? args : null);
            };
        };

        jasmine.addMatchers({
            toBeRejected: function(util, customs) {
                return { compare: createCompareFn(util, customs, "rejected") };
            },
            toBeRejectedWith: function(util, customs) {
                return { compare: createCompareFn(util, customs, "rejected", true) };
            },
            toBeResolved: function(util, customs) {
                return { compare: createCompareFn(util, customs, "resolved") };
            },
            toBeResolvedWith: function(util, customs) {
                return { compare: createCompareFn(util, customs, "resolved", true) };
            },
        });
    }

    private _uninstall() {
        this._global.Promise = this._originalPromise;
    }
}

let i = 0;
export class JasminePromise {
    public static NativePromise: any;

    public static reject(reason) {
        return new JasminePromise((resolve, reject) => reject(reason));
    }

    public static resolve(...args) {
        return new JasminePromise((resolve) => resolve.apply(null, args));
    }

    public static initialize() {}

    public static flush() {
        try {
            flushMicrotasks();
        } catch (e) {}
    }

    public state: string = "pending";
    public args: any[];
    public id: number;

    private _nativePromise: Promise<any>;

    constructor(resolver: any) {
        this.id = i++;
        let resolve;
        let reject;
        this._nativePromise = new JasminePromise.NativePromise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        this._nativePromise.catch(() => {});

        resolver(
            (...args: any[]) => {
                if (this.state !== "pending") { return; }
                this.state = "resolved";
                this.args = args;
                resolve.apply(null, args);
            },
            (...args: any[]) => {
                if (this.state !== "pending") { return; }
                this.state = "rejected";
                this.args = args;
                reject.apply(null, args);
            }
        );
    }

    public then(...args: any[]) {
        this._nativePromise.then.apply(this._nativePromise, args);
    }

    public catch(...args: any[]) {
        this._nativePromise.catch.apply(this._nativePromise, args);
    }

    public verify(util: any, customEqualityTesters: any, state: string, args?: any[]) {
        JasminePromise.flush();

        let result: { pass: boolean, message: string } = {
            message: "",
            pass: false,
        };

        result.pass = this.state === state;

        if (result.pass) {
            if (args) {
                result.pass = util.equals(this.args, args, customEqualityTesters);
                if (result.pass) {
                    result.message = "Expected promise not to be " +
                        state + " with " +
                        JSON.stringify(args) + " but it was";
                } else {
                    result.message = "Expected promise to be " +
                        state + " with " + JSON.stringify(args) +
                        " but it was " + state + " with " + JSON.stringify(this.args);
                }
            } else {
                result.message = "Expected promise not to be " + state + " but it was";
            }
        } else {
            result.message = "Expected promise to be " + state + " but it is " + this.state;
        }

        return result;
    }
}
