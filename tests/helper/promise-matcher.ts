export class PromiseMatcher {
    private static _instance:PromiseMatcher;

    private _originalPromise:any;
    private _global:any;

    constructor() {
        this._global = window || global;
        this._originalPromise = this._global.Promise;
    }

    static getInstance() {
        if (!this._instance) {
            this._instance = new PromiseMatcher();
        }
        return this._instance;
    }

    static install() {
        PromiseMatcher.getInstance()._install();
    }

    static uninstall() {
        PromiseMatcher.getInstance()._uninstall();
    }

    private _install() {
        if (this._global.Promise === JasminePromise) {
            return;
        }
        JasminePromise.NativePromise = this._originalPromise;
        this._global.Promise = JasminePromise;

        jasmine.addMatchers({
            toBeRejected: function(util, customEqualityTesters) {
                return {
                    compare: function(promise) {
                        return verifyPromise(util, customEqualityTesters, promise, 'rejected');
                    }
                }
            },
            toBeRejectedWith: function(util, customEqualityTesters) {
                return {
                    compare: function(promise, ...args) {
                        return verifyPromise(util, customEqualityTesters, promise, 'rejected', args);
                    }
                }
            },
            toBeResolved: function(util, customEqualityTesters) {
                return {
                    compare: function(promise) {
                        return verifyPromise(util, customEqualityTesters, promise, 'resolved');
                    }
                }
            },
            toBeResolvedWith: function(util, customEqualityTesters) {
                return {
                    compare: function(promise, ...args) {
                        return verifyPromise(util, customEqualityTesters, promise, 'resolved', args);
                    }
                }
            },
        });
    }

    private _uninstall() {
        this._global.Promise = this._originalPromise;
    }
}

function verifyPromise(util:any, customEqualityTesters:any, promise:any, state:string, args?:any[]) {
    var result:{pass:boolean, message:string} = {
        pass: false,
        message: ''
    };
    if (!(promise instanceof JasminePromise)) {
        throw new Error('Promse is not a JasminePromise - did you run PromiseMatcher.install()?');
    }

    result.pass = promise.state === state;

    if (result.pass) {
        if (args) {
            result.pass = util.equals(promise.args, args, customEqualityTesters);
            if (result.pass) {
                result.message = 'Expected promise not to be ' + state + ' with ' + JSON.stringify(args) + ' but it was';
            } else {
                result.message = 'Expected promise to be ' + state + ' with ' + JSON.stringify(args) + ' but it was ' + state + ' with ' + JSON.stringify(promise.args);
            }
        } else {
            result.message = 'Expected promise not to be ' + state + ' but it was';
        }
    } else {
        result.message = 'Expected promise to be ' + state + ' but it is ' + promise.state;
    }

    return result;
}

class JasminePromise {
    public static NativePromise:any;

    private _nativePromise:Promise<any>;

    public state:string = 'pending';
    public args:any[];
    public reason:string;

    constructor(resolver:any) {
        var resolve, reject;
        resolver(
            (...args: any[]) => {
                if (this.state !== 'pending') { return; }
                this.state = 'resolved';
                this.args = args;
                resolve.apply(null, args);
            },
            (reason) => {
                if (this.state !== 'pending') { return; }
                this.state = 'rejected';
                this.reason = reason;
                reject.apply(null, [reason]);
            }
        );
        this._nativePromise = new JasminePromise.NativePromise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
    }

    public then(...args:any[]) {
        this._nativePromise.then.apply(this._nativePromise, args);
    }

    public catch(...args:any[]) {
        this._nativePromise.catch.apply(this._nativePromise, args);
    }
}