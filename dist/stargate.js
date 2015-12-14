// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});


// Universal Module Definition - https://github.com/umdjs/umd/blob/master/templates/returnExports.js
/*global define, module */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.stargate = factory();
    }
}(this, function () {
    // Public interface
    var stargatePublic = {};
    /* global cordova */


/* globals AdMob, MoPub */

var AdManager = {

	AdMobSupport: false,
	MoPubSupport: false,
	AdPosition: {
		NO_CHANGE: 0,
		TOP_LEFT: 1,
		TOP_CENTER: 2,
		TOP_RIGHT: 3,
		LEFT: 4,
		CENTER: 5,
		RIGHT: 6,
		BOTTOM_LEFT: 7,
		BOTTOM_CENTER: 8,
		BOTTOM_RIGHT: 9,
		POS_XY: 10
	},
	AdSize: {
		SMART_BANNER: 'SMART_BANNER',
		BANNER: 'BANNER',
		MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
		FULL_BANNER: 'FULL_BANNER',
		LEADERBOARD: 'LEADERBOARD',
		SKYSCRAPER: 'SKYSCRAPER'
	},
	DefaultOptions : null,
		
	initialize: function (options, success, fail) {
		if(options)
			AdManager.DefaultOptions = options;
			
		if (AdMob) { 
			AdManager.AdMobSupport = true;
			AdManager.initAdMob(options, success, fail);
		}
		
		if (MoPub) { 
			AdManager.MoPubSupport = true;
		}	
		
		return true;
	},
	
	isAdMobSupported: function(){
		return AdManager.AdMobSupport;
	},
	
	isMoPubSupported: function(){
		return AdManager.MoPubSupport;
	},
	
	getUserAgent: function(){
		if( /(android)/i.test(navigator.userAgent) ) {
			return "android";
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
			return "ios";
		} else {
			return "other";
		}
	},
	
	/* setOptions(options, success, fail); */
	initAdMob: function(options, success, fail){
	
		var defaultOptions = {
			//bannerId: AdManager.AdMobID[userAgent].banner,
			//interstitialId: AdManager.AdMobID[userAgent].interstitial,
			adSize: 'BANNER',
			// width: integer, // valid when set adSize 'CUSTOM'
			// height: integer, // valid when set adSize 'CUSTOM'
			position: 8,
			// offsetTopBar: false, // avoid overlapped by status bar, for iOS7+
			bgColor: 'black', // color name, or '#RRGGBB'
			// x: integer, // valid when set position to 0 / POS_XY
			// y: integer, // valid when set position to 0 / POS_XY
			isTesting: false, // set to true, to receiving test ad for testing purpose
			autoShow: true // auto show interstitial ad when loaded, set to false if prepare/show
		};
		AdMob.setOptions(defaultOptions, success, fail);
		
	},
	
	/* TODO if needed */
	initMoPub: function(options, success, fail){
	
	},	
	
	registerAdEvents: function(eventManager) {
		document.addEventListener('onAdFailLoad', eventManager);
		document.addEventListener('onAdLoaded', eventManager);
		document.addEventListener('onAdPresent', eventManager);
		document.addEventListener('onAdLeaveApp', eventManager);
		document.addEventListener('onAdDismiss', eventManager);
	},
	
	manageAdEvents: function(data) {
	
		console.log('error: ' + data.error +
			', reason: ' + data.reason +
			', adNetwork:' + data.adNetwork +
			', adType:' + data.adType +
			', adEvent:' + data.adEvent); 
	},
	
	/*
	createBanner(data, success, fail);
	data could be an object (one network) or an array of network info
	each network is an object with position, autoShow, banner, full_banner, leaderboard, ecc
	data = [{network: "dfp", device: "android", position: "BOTTOM_CENTER", banner: "/1017836/320x50_Radio_Leaderboard", autoShow: true},
			{network: "mopub", device: "ios", position: "BOTTOM_CENTER", banner: "agltb3B1Yi1pbmNyDAsSBFNpdGUY8fgRDA", autoShow: true}];
	*/
	createBanner: function(data, success, fail) {
		var options = {};
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				var adId = AdManager.getAdSize().toLowerCase();					
			
				if(entry.overlap) options.overlap = entry.overlap;
				if(entry.offsetTopBar) options.offsetTopBar = entry.offsetTopBar;
				options.adSize = AdManager.getAdSize();
				if(adId) options.adId = entry[adId];
				if(entry.position) options.position = AdManager.AdPosition[entry.position];
				if(entry.width) options.width = entry.width;
				if(entry.height) options.height = entry.height;
				if(entry.autoShow) options.autoShow = entry.autoShow;
				
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					if(entry.width && entry.height){
						options.adSize = 'CUSTOM';
					}
					AdMob.createBanner(options, success, fail);
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.createBanner(options, success, fail);
				}			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", position: "BOTTOM_CENTER"},
			{network: "mopub", device: "ios", position: "BOTTOM_CENTER"}];
	data.network could be admob, mopub, dfp
	data.position could be: NO_CHANGE, TOP_LEFT, TOP_CENTER, TOP_RIGHT, LEFT, CENTER, RIGHT, BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT, POS_XY
	*/
	showBannerAtSelectedPosition: function(data) {
	
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.showBanner(entry.position);
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.showBanner(entry.position);
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", x: "", y: ""},
			{network: "mopub", device: "ios", x: "", y: ""}];
	data.network could be admob, mopub, dfp
	*/
	showBannerAtGivenXY: function(data) {
	
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.showBannerAtXY(entry.x, entry.y);
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.showBannerAtXY(entry.x, entry.y);
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android"},
			{network: "mopub", device: "ios"}];
	*/
	hideBanner: function(data) {
	
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.hideBanner();
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.hideBanner();
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android"},
			{network: "mopub", device: "ios"}];
	*/
	removeBanner: function(data) {
	
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.removeBanner();
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.removeBanner();
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", interstitial: ""},
			{network: "mopub", device: "ios", interstitial: ""}];
	*/
	prepareInterstitial: function(data, success, fail) {
	
		var options = {};
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){				
			
				if(entry.interstitial) options.adId = entry.interstitial;
				if(entry.autoShow) options.autoShow = entry.autoShow;
				
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.prepareInterstitial(options);
				}
				else if(entry.network.toLowerCase() == 'mopub'){
					MoPub.prepareInterstitial(options, success, fail);
				}
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", interstitial: ""},
			{network: "mopub", device: "ios", interstitial: ""}];
	*/
	showInterstitial: function(data) {
	
		var opt = new Array();
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.showInterstitial();
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.showInterstitial();
				}	
			
			}
		});
	},
	
	isObjEmpty: function(obj) {
		return Object.keys(obj).length === 0;
	},
	
	getAdSize: function(){
	
		var height = screen.height;
		var width = screen.width;
	
		if(width >= 728 && height >= 90 ) {
			return AdManager.AdSize.LEADERBOARD;
		} else if (width >= 468 && height >= 60 ) {
			//return AdManager.AdSize.FULL_BANNER;
			return AdManager.AdSize.BANNER;
		} else if (width >= 320 && height >= 50 ) {
			return AdManager.AdSize.BANNER;
			
		}
	}
	
	
};
/*! AdStargate.JS - v0.0.1 - 2015-XX-XX
 *
 */
function AdStargate() {


    // FIXME remove postmessages

    this.initialize = function(data, callbackSuccess, callbackError){
    	 var msgId = Stargate.createMessageId();
         Stargate.messages[msgId] = new Message();
         Stargate.messages[msgId].msgId = msgId;
         Stargate.messages[msgId].exec = 'stargate.initializeAd';
         if (typeof data !== 'undefined'){
             Stargate.messages[msgId].data = data;
         }
         Stargate.messages[msgId].callbackSuccess = callbackSuccess;
         Stargate.messages[msgId].callbackError = callbackError;
         Stargate.messages[msgId].send();
    };

    this.createBanner = function(data, callbackSuccess, callbackError){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.createBanner';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();

    };

    this.hideBanner = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.hideBanner';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.removeBanner = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.removeBanner';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.showBannerAtSelectedPosition = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.showBannerAtSelectedPosition';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.showBannerAtGivenXY = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.showBannerAtGivenXY';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.registerAdEvents = function(eventManager){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.registerAdEvents';
        if (typeof eventManager !== 'undefined'){
            Stargate.messages[msgId].eventManager = eventManager;
        }
        Stargate.messages[msgId].send();

    };

    this.prepareInterstitial = function(data, callbackSuccess, callbackError){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.prepareInterstitial';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    };

    this.showInterstitial = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.showInterstitial';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };
    
	this.test = function(){
		alert("it works");
	}
};
/* globals facebookConnectPlugin, deltadna, StatusBar, Connection, device */


// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// 
// move all code to stargate.js
// 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 

var app = {

    height: '',
    width: '',
    appUrl: '',
    version: '',
    country: '',
    selector: '',
    api_selector: '',
    app_prefix: '',
    hybrid_conf: {},
    crypter: {},
    msgId: '',
    busy: false,
    back: 0,
    
    /*
    isBusy: function(){
        return app.busy;
    },
    
    setBusy: function(value){
        app.busy = value;
        if (value){
            startLoading();
        } else {
            stopLoading();
        }
    },
    
    hasFeature: function(feature){
        return (typeof CONFIGS.label.features[feature] !== 'undefined' && CONFIGS.label.features[feature]);
    },

    handshake: function() {
        appframe = document.getElementById('appframe');
        appframe.contentWindow.postMessage("{'exec':'handshake'}", '*');
    },
    
    initialUrl: function(requestedUrl) {
        var uri2process = requestedUrl || CONFIGS.label.url;

        var uri = new Uri(uri2process);

        if (CONFIGS.label.qps_fw && CONFIGS.label.qps_fw instanceof Array) {
            for (var i = 0; i < CONFIGS.label.qps_fw.length; i=i+2) {
                uri.addQueryParam( CONFIGS.label.qps_fw[i], CONFIGS.label.qps_fw[i+1] );
            }
        }
        if (CONFIGS.label.qps && CONFIGS.label.qps instanceof Array) {
            for (var i = 0; i < CONFIGS.label.qps.length; i=i+2) {
                uri.addQueryParam( CONFIGS.label.qps[i], CONFIGS.label.qps[i+1] );
            }
        }
        
        if(app.version){
            uri.addQueryParam('hv', app.version);
        }
        
        return uri.toString();
    },

    url: function() {
        if (!app.appUrl){
            app.appUrl = CONFIGS.label.url;
        }
        
        return app.appUrl;
    },

    // Application Constructor
    initialize: function() {
        document.title = CONFIGS.label.title;

        cordova.getAppVersion(function (version) {
            if(version){
                 app.version = version;
                 console.log("[app] got version: "+version);
            }
        });
        
        // if i don't have network connection on startup/loading
        // i show a page of error with a retry button
        if(navigator.network.connection.type == Connection.NONE){
            navigator.splashscreen.hide();
            window.location.href = 'retry.html';
            return;
        }
		StatusBar.hide();

        // save iframe reference
        app.iframe = document.getElementById("appframe");
        
        // -- bind events listener --
        if (device.platform == "iOS") {
			app.onOrientationChange();
            window.addEventListener('orientationchange', app.onOrientationChange, false);
        }
        window.addEventListener('message', app.onMessageReceived, false);
        
        // stargate crypter implementation with forge
        app.crypter = forge.pki.privateKeyFromPem(CONFIGS.label.privateKey);
        
        if (app.hasFeature('mfp')) {
            MFP.check();
        } else {
        	app.launch(app.url());
        }      
        
        // -- newton --
        var newton_device_id;
        
        if (app.hasFeature('newton')) {

            // get device id for newton from localstorage or calculate and save
            if (window.localStorage.getItem('newton_device_id')){
                newton_device_id = window.localStorage.getItem('newton_device_id');
            } else {
                newton_device_id = device.uuid;
                window.localStorage.setItem('newton_device_id', newton_device_id);
            }
            // set the user id
            window.newton.changeUser(newton_device_id, app.notificationListener, app.cordovaError);
        }
        // -- --

        if (app.hasFeature('deltadna')) {
            deltadna.startSDK(CONFIGS.label.deltadna.environmentKey, CONFIGS.label.deltadna.collectApi, CONFIGS.label.deltadna.engageApi, app.onDeltaDNAStartedSuccess, app.onDeltaDNAStartedError, CONFIGS.label.deltadna.settings);
        }
    },
    
    launch: function(url) {
        console.log('launch: ' + url);
        app.iframe.src = app.initialUrl(url);
    },

    onOrientationChange: function() {
        // FIXME
        var dim1 = screen.width,
            dim2 = screen.height;
        
        var banner = 0, marginTop = 0;
        
        switch (window.orientation) {
            case 90:
            case -90:
                //landscape
                if (dim1 > dim2){
                    app.width = dim1;
                    app.height = dim2 - marginTop;
                } else {
                    app.width = dim2;
                    app.height = dim1 - marginTop;
                }
                break;
            case 0:
            case 180:
                //portrait
                if (dim1 > dim2){
                    app.width = dim2;
                    app.height = dim1 - marginTop;
                } else {
                    app.width = dim1;
                    app.height = dim2 - marginTop;
                }
                break;
        }
        
        
        app.iframe.style.height = (app.height) + "px";
        app.iframe.style.width = (app.width) + "px";
        
        
        
        // DISPATCH RESIZE EVENT INSIDE GAMES
        if (app.iframe.contentWindow.cr_sizeCanvas) {
            app.iframe.contentWindow.cr_sizeCanvas(window.innerWidth, window.innerHeight);
        } else {
            var event = document.createEvent("OrientationEvent");
            event.initEvent("orientationchange", false, false);
            app.iframe.contentWindow.innerHeight = window.innerHeight;
            app.iframe.contentWindow.innerWidth = window.innerWidth;
            app.iframe.contentWindow.dispatchEvent(event);
            
            
        }
        
        // iframe inside game, set main window size
        if (app.iframe.contentDocument.getElementsByTagName("iframe").length > 0) {
            document.body.style.height = (app.height) + "px";
            document.body.style.width = (app.width) + "px";
        }
        else {
            document.body.style.height = "";
            document.body.style.width = "";
        }
        
        console.log("[app] onOrientationChange");
    },
	
	notificationListener: function(notification) {
        console.log("Received notification: ", notification);

        if ( !! window.localStorage.getItem('newton_disabled') ) {
            console.log("Push disabled, ignoring notification.");
            return;
        }
        
        var notifObj = {
            "push_id": notification.push_id
        };
        if (notification.title) {
            notifObj["title"] = notification.title;
        }
        if (notification.body) {
            notifObj["body"] = notification.body;
        }
        if (notification.custom_fields) {
            if (typeof notification.custom_fields === "object") {
                notifObj["custom_fields"] = notification.custom_fields;
            } else {
                try {
                    notifObj["custom_fields"] = JSON.parse(notification.custom_fields);
                }
                catch (e) {
                    notifObj["custom_fields"] = { "error": true, "errorType": "parseError", "errorMessage": e};
                }
            }
        }

        console.log("Parsed notification: ", notifObj);

        // FIXME change url of iframe
        if (notifObj.custom_fields.url) {
            app.launch( notifObj.custom_fields.url );
            return;
        }
        if (notifObj.custom_fields.eurl) {
            var ref = window.open(notifObj.custom_fields.eurl,
                '_system', 'location=no,toolbar=no');
            app.launch( app.appUrl );
            return;
        }
	},
    */
	cordovaError: function(err) {
        if (err === null) {
            // no result callback: isn't an error
            return;
        }
		console.error("Error from Cordova: "+err);
	},
    onMessageReceived: function (event) {
        
        if ( event.origin !== CONFIGS.label.origin ) {
			console.log("postMessage received from invalid origin", event);
            return;
        }
        
        var message = {};

        try {
            message = JSON.parse(event.data);
        }
        catch (e) {
            console.log("Json error: ", event.data);
            return;
        }
        
        if (app.isBusy() && message.exec !== 'ready'){
            console.log("Message received but the app is busy, ignoring");
            return;
        }

        switch(message.exec){
            case 'system':
                window.open(message.url, "_system");
                break;

            /*
            case 'ready':
				navigator.splashscreen.hide();
                app.setBusy(false);

                if(message.country){
					app.country = message.country;
				}
				if(message.selector){
					app.selector = message.selector;
				}
				if(message.api_selector){
					app.api_selector = message.api_selector;
				}
				if(message.app_prefix){
					app.app_prefix = message.app_prefix;
				}
				if(message.hybrid_conf){
                    if (typeof message.hybrid_conf === 'object') {
                        app.hybrid_conf = message.hybrid_conf;
                    } else {
                        app.hybrid_conf = JSON.parse(decodeURIComponent(message.hybrid_conf));
                    }
				}
				if (ua.iOS()){
                    app.onOrientationChange();
                }
                if(message.msgId){
                    // Stargate ready: Handshake
                    app.sendBackToStargate('handshake', message.msgId, true, {});
                }
				IAP.initialize();
				break;
                */
            case 'stargate.facebookLogin':
                app.setBusy(true);
                app.msgId = message.msgId;

                facebookConnectPlugin.login(message.scope.split(","),
                    app.onFbLoginSuccessStargate,
                    function (error) {
                        app.setBusy(false);
                        // error.errorMessage
                        console.log("Got FB login error:", error);
                        app.sendBackToStargate('stargate.facebooklogin', app.msgId, false, {'error':error}, true);
                    }
                );
                break;
			case 'stargate.facebookShare':
                app.setBusy(true);
                app.msgId = message.msgId;

				var options = {
					method: "share",
					href: message.url
				};
				
				facebookConnectPlugin.showDialog(options, 
					function(message){
						app.sendBackToStargate('stargate.facebookShare', app.msgId, true, {'message':message}, false);
					}, 
					function(error){
						app.setBusy(false);
                        // error.errorMessage
                        console.log("Got FB share error:", error);
                        app.sendBackToStargate('stargate.facebookShare', app.msgId, false, {'error':error}, false);
					}
				);
				break;
            case 'fblogin':
            	startLoading();
                app.appUrl = message.url;
                facebookConnectPlugin.login(message.scope.split(","),
                                            app.onFbLoginSuccess,
                                            function (error) {
                                                // error.errorMessage
                                                console.log("Got FB login error:", error);
                                                stopLoading();
                                            }
                                            );
                break;
            case 'googlelogin':
            	startLoading();
				app.appUrl = message.url;
				window.plugins.googleplus.login(
					{'androidApiKey':CONFIGS.label.google_client_id},
					app.onGoogleLoginSuccess,
					function (error) {
						console.log('Got Google login error: ' + error);
						stopLoading();
					}
				);
				break;
            case 'purchase':
				startLoading();
				if (message.url){
					app.appUrl = message.url;
				}
				store.order(IAP.id);
				store.refresh();
				break;
            case 'stargate.purchase.subscription':
                app.setBusy(true);
                app.msgId = message.msgId;

                if (message.returnUrl){
                    app.appUrl = message.returnUrl;
                }
                if (typeof message.subscriptionUrl !==  'undefined'){
                	IAP.subscribeMethod = message.subscriptionUrl;
				}
                
                // TODO: callback error (to be modified inside IAP plugin),
                store.order(IAP.id);
                store.refresh();
                break;
			case 'restore':
				startLoading();
				if (message.url){
					app.appUrl = message.url;
				}
				store.refresh();
				storekit.restore();
				break;
            case 'stargate.restore':
                app.setBusy(true);
                app.msgId = message.msgId;
                
                if (message.returnUrl){
                    app.appUrl = message.returnUrl;
                }
                if (typeof message.subscriptionUrl ===  'undefined'){
                    IAP.subscribeMethod = 'stargate';
                }
                
                // TODO: callback error (to be modified inside IAP plugin),
                store.refresh();
                storekit.restore();
                break;
            case 'stargate.googleLogin':
                console.log(message);
                // BUSY
                app.setBusy(true);
                app.msgId = message.msgId;
                window.plugins.googleplus.login(
                    {'androidApiKey':CONFIGS.label.google_client_id},
                    app.onGoogleLoginSuccessStargate,
                    function (error) {
                        console.log('Got Google login error: ' + error);
                        app.sendBackToStargate('stargate.googleLogin', app.msgId, false, {'error':error});
                        app.setBusy(false);
                    }
                );
                break;
			case 'stargate.checkConnection':
                app.msgId = message.msgId;
				var networkState = navigator.connection.type;
				app.sendBackToStargate('stargate.checkConnection', app.msgId, true, {'networkState' : networkState});
                break;
			case 'stargate.getDeviceID':
                app.msgId = message.msgId;
				var deviceID = device.uuid;
				app.sendBackToStargate('stargate.getDeviceId', app.msgId, true, {'deviceID' : deviceID});
                break;
            case 'stargate.createBanner':
                app.setBusy(true);
                app.msgId = message.msgId;
				var advConf = null;
				
				if(message.data){
                    if (typeof message.data === 'object') {
                        advConf = message.data;
                    } else {
                        advConf = JSON.parse(decodeURIComponent(message.data));
                    }
				}
				
				AdManager.createBanner(advConf);
                app.setBusy(false);
                break;
            case 'stargate.hideBanner':
                app.setBusy(true);
                app.msgId = message.msgId;
				var advConf = null;
				
				if(message.data){
                    if (typeof message.data === 'object') {
                        advConf = message.data;
                    } else {
                        advConf = JSON.parse(decodeURIComponent(message.data));
                    }
				}
				
				AdManager.hideBanner(advConf);
                app.setBusy(false);
                break;
            case 'stargate.removeBanner':
                app.setBusy(true);
                app.msgId = message.msgId;
				var advConf = null;
				
				if(message.data){
                    if (typeof message.data === 'object') {
                        advConf = message.data;
                    } else {
                        advConf = JSON.parse(decodeURIComponent(message.data));
                    }
				}
				
				AdManager.removeBanner(advConf);
                app.setBusy(false);
                break;
            }
    },
    
    onFbLoginSuccess: function (userData) {
    	facebookConnectPlugin.getAccessToken(function(token) {
            app.appUrl = app.appUrl + '&apk_fb_user_token='+token;
            app.launch(app.appUrl);
        }, function(err) {
            console.log("Could not get access token: " + err);
            reboot();
        });
    },
    onGoogleLoginSuccess: function (userData) {
				
		if(window.localStorage.getItem('googleRefreshToken_'+userData.userId)){
			app.appUrl = app.appUrl + '&apk_google_user_token='+window.localStorage.getItem('googleRefreshToken_'+userData.userId);
			app.launch(app.appUrl);		
		}
		else {

			window.plugins.googleplus.token(
				{'email':userData.email,
				'androidApiKey':CONFIGS.label.google_client_id},
				function (userToken) {
					app.onGoogleTokenSuccess(userToken, userData);
				},
				function (error) {
					console.log('Got Google login error: ' + error);
					stopLoading();
				}
			);
		}
		
    },
	onGoogleTokenSuccess: function (userToken, userData) {
				
		if(userToken.oauthToken){
							
			var xmlhttp;
		
			if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp=new XMLHttpRequest();
			} else {// code for IE6, IE5
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}		
			
			// network info	
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4){
					if(xmlhttp.status === 200) {
						try {
							var serverResponse = JSON.parse(xmlhttp.responseText);							
							var refresh_token = serverResponse.refresh_token;
							
							if(refresh_token){
								window.localStorage.setItem('googleRefreshToken_'+userData.userId, refresh_token);
								app.appUrl = app.appUrl + '&apk_google_user_token='+refresh_token;
								app.launch(app.appUrl);
							}
							else {
								console.log("Could not get refresh token");
								reboot();
							}		
							
						}
						catch(e){
							// display error message
							console.log("Error app.onGoogleLoginSuccess reading the response: " + e.toString());
							reboot();
						}
					}
					else {
						console.log("Error app.onGoogleLoginSuccess", xmlhttp.statusText);
						app.launch(app.url());
					}
				}
			};
			
			var url = CONFIGS.api.googleToken;
			
			xmlhttp.open("POST",url,true);
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			var params = "client_id="+CONFIGS.label.google_client_id+"&client_secret="+CONFIGS.label.google_client_secret+"&code="+userToken.oauthToken+"&redirect_uri=&grant_type=authorization_code";
			xmlhttp.send(params);
		
		}
		else {
            console.log("Could not get google code");
            reboot();
        }
		
    },
    onFbLoginSuccessStargate: function (userData, msgId) {
		app.setBusy(false);
        facebookConnectPlugin.getAccessToken(function(token) {
            app.sendBackToStargate('stargate.facebooklogin', app.msgId, true, {'accessToken' : token});
        }, function(err) {
            app.sendBackToStargate('stargate.facebooklogin', app.msgId, false, {'error':err});
        });
    },
    onGoogleLoginSuccessStargate: function (userData) {
        console.log(userData, CONFIGS.label.google_client_id);

            app._userData = userData;
            window.plugins.googleplus.token(
                {'email':userData.email,
                 'androidApiKey':CONFIGS.label.google_client_id},
                function (userToken) {
                    app.onGoogleTokenSuccess(userToken, app._userData);
                },
                function (error) {
                    app.sendBackToStargate('stargate.googleLogin',
                                            app.msgId,
                                            false,
                                            {'error':error}
                    );
                    console.log('Got Google login error: ' + error);
                    app.setBusy(false);
                }
            );
    },
    onDeltaDNAStartedSuccess: function(){
        deltadna.registerPushCallback(
			app.onDeltaDNAPush
		); 
    },
    onDeltaDNAStartedError: function(){
        
    },
    onDeltaDNAPush: function(pushDatas){
        if(ua.Android() && pushDatas.payload && pushDatas.payload.url && !pushDatas.foreground){
			app.appUrl = pushDatas.payload.url;
			app.launch(app.appUrl);				
		}
        if(ua.iOS() && pushDatas.url){
            app.appUrl = pushDatas.url;
            app.launch(app.appUrl);
        }
    },
    sendBackToStargate:function(exec, originalMsgId, success, cbParams, keepBusy){
        /*
          Send back message to Stargate
        * @param {String} exec <action>  where action can be 'stargate.facebookLogin' for example
        * @param {String} originalMsgId
        * @param {boolean} success
        * @param {object} cbParams : an object with callback parameters
        * */
        var pm = {};
        pm.exec = exec;
        pm.originalMsgId = originalMsgId;
        pm.success = success;
        pm.callbackParams = cbParams;
        pm.timestamp = Date.now();
        
        var md = forge.md.sha1.create();
        md.update(pm.originalMsgId + pm.exec + pm.timestamp + (pm.success ? 'OK' : 'KO'), 'utf8');
        pm.signature = ''; //app.crypter.sign(md);

        //Send back but first append the signature ArrayBuffer
        app.iframe.contentWindow.postMessage(JSON.stringify(pm), '*');
		if(!keepBusy) app.setBusy(false);
    }
};

var CONFIGS = {

    api: {
        networkInfo: 'http://api.playme.info/xradio/network.info?apikey=%apikey%&country=it&format=json',
        dictPlayme: 'http://api.playme.info/%api_selector%/dictionary.get',
        mfpSet: '/mfpset.php?url=%url%%pony%',
        mfpGet: 'http://api.motime.com/v01/mobileFingerprint.get?apikey=%apikey%&contents_inapp=%contents_inapp%&country=%country%&expire=%expire%',
        googleToken: 'https://accounts.google.com/o/oauth2/token',
        userCreate: '%domain%/%country%/%selector%/%app_prefix%/store/usercreate/'
    },
    
    iap_android: {
        id: 'test_subscription_trial',
        alias: 'PlayMe Subscription',
        type: 'PAID_SUBSCRIPTION',
        verbosity: 'DEBUG',
        paymethod: 'gwallet'
    },
    
    iap_ios: {
        id: 'playme.subscription.monthly',
        alias: 'PlayMe Subscription',
        type: 'PAID_SUBSCRIPTION',
        verbosity: 'DEBUG',
        paymethod: 'itunes'
    }
};

CONFIGS.getText = function (str){
    console.error("CONFIGS.getText is deprecated!");
    return str;
};
/* globals store, accountmanager */

var IAP = {

	id: '',
	alias: '',
	type: '',
	verbosity: '',
	paymethod: '',
    subscribeMethod: 'stargate',
	
	initialize: function () {
        if (!window.store) {
            console.log('Store not available');
            return;
        }
		
		IAP.id = (app.hybrid_conf.IAP.id) ? app.hybrid_conf.IAP.id : ((ua.Android())?CONFIGS.iap_android.id:CONFIGS.iap_ios.id);
		IAP.alias = (app.hybrid_conf.IAP.alias) ? app.hybrid_conf.IAP.alias : ((ua.Android())?CONFIGS.iap_android.alias:CONFIGS.iap_ios.alias);
		IAP.type = (app.hybrid_conf.IAP.type) ? app.hybrid_conf.IAP.type : ((ua.Android())?CONFIGS.iap_android.type:CONFIGS.iap_ios.type);
		IAP.verbosity = (app.hybrid_conf.IAP.verbosity) ? app.hybrid_conf.IAP.verbosity : ((ua.Android())?CONFIGS.iap_android.verbosity:CONFIGS.iap_ios.verbosity);
		IAP.paymethod = (app.hybrid_conf.IAP.paymethod) ? app.hybrid_conf.IAP.paymethod : ((ua.Android())?CONFIGS.iap_android.paymethod:CONFIGS.iap_ios.paymethod);		
		
        console.log('IAP initialize id: '+IAP.id);
		
		if(ua.Android()){
			IAP.getGoogleAccount();
		}
        store.verbosity = store[IAP.verbosity];
        // store.validator = ... TODO
        
        store.register({
                   id:    IAP.id,
                   alias: IAP.alias,
                   type:  store[IAP.type]
                   });
        
        store.when(IAP.alias).approved(function(p){IAP.onPurchaseApproved(p);});
        store.when(IAP.alias).verified(function(p){IAP.onPurchaseVerified(p);});
        store.when(IAP.alias).updated(function(p){IAP.onProductUpdate(p);});
		store.when(IAP.alias).owned(function(p){IAP.onProductOwned(p);});
		store.when(IAP.alias).cancelled(function(p){IAP.onCancelledProduct(p); });
		store.when(IAP.alias).error(function(err){IAP.error(JSON.stringify(err));});
        store.ready(function(){ IAP.onStoreReady();});
        store.when("order "+IAP.id).approved(function(order){IAP.onOrderApproved(order);});
    },

    getPassword: function (transactionId){
        return md5('iap.'+transactionId+'.playme').substr(0,8);
    },
	
	getGoogleAccount: function(){
		window.accountmanager.getAccounts(IAP.checkGoogleAccount, IAP.error, "com.google");	
	},
	
	checkGoogleAccount: function(result){
		
		if(result) {
			console.log('accounts');
			console.log(result);
			
			for(var i in result){
				window.localStorage.setItem('googleAccount', result[i].email);
				return result[i].email;
			}
		}	
	},
 
    onProductUpdate: function(p){
        console.log('IAP> Product updated.');
        console.log(JSON.stringify(p));
        if (p.owned) {
            console.log('Subscribed!');
        } else {
            console.log('Not Subscribed');
        }
    },
    
    onPurchaseApproved: function(p){
        console.log('IAP> Purchase approved.');
        console.log(JSON.stringify(p));
        //p.verify(); TODO before finish		
        p.finish();
    },
    onPurchaseVerified: function(p){
        console.log("subscription verified");
        //p.finish(); TODO
    },
    onStoreReady: function(){
        console.log("\\o/ STORE READY \\o/");
        /*store.ask(IAP.alias)
        .then(function(data) {
              console.log('Price: ' + data.price);
              console.log('Description: ' + data.description);
              })
        .error(function(err) {
               // Invalid product / no connection.
               console.log('ERROR: ' + err.code);
               console.log('ERROR: ' + err.message);
               });*/
    },
    
    onProductOwned: function(p){
        console.log('IAP > Product Owned.');
        if (!p.transaction.id && ua.iOS()){
            console.log('IAP > no transaction id');
            return false;
        }
        window.localStorage.setItem('product', p);
		if(ua.iOS()){
			window.localStorage.setItem('transaction_id', p.transaction.id);
		}
        
        if (ua.Android()){
            var purchase_token = p.transaction.purchaseToken + '|' + CONFIGS.label.id + '|' + IAP.id;
            console.log('Purchase Token: '+purchase_token);
            
            if(!window.localStorage.getItem('user_account')){
                IAP.createUser(p, purchase_token);
            }
            
        } else {
        
            storekit.loadReceipts(function (receipts) {
                console.log('appStoreReceipt: ' + receipts.appStoreReceipt);
                
                if (IAP.subscribeMethod == 'callback'){
                    // next generation subscription management
                    var pm = {};
                    pm.exec = 'stargate.purchase.subscription';
                    pm.originalMsgId = app.msgId;
                    pm.callbackParams = {
                        'product' : p,
                        'purchase_token': purchase_token,
                        'paymethod': IAP.paymethod,
                    };
                    pm.success = true;
                    appframe = document.getElementById('appframe');
                    appframe.contentWindow.postMessage(JSON.stringify(pm), '*');
                    return;
                }
                                  
                if(!window.localStorage.getItem('user_account')){
                    IAP.createUser(p, receipts.appStoreReceipt);
                }
            });
        }
        
    },
    
    onCancelledProduct: function(p){
		app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, {'iap_cancelled' : 1, 'return_url' : app.appUrl}, false);
        console.log('IAP > Purchase cancelled ##################################');
    },
    
    onOrderApproved: function(order){
       console.log("ORDER APPROVED "+IAP.id);
       order.finish();
    },
	
	error: function(error) {
		app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, {'iap_error' : 1, 'return_url' : app.appUrl}, false);
		console.log('error');	
	},
	
	createUser: function(product, purchaseToken){
	
		window.localStorage.setItem('user_account', ua.Android() ? (window.localStorage.getItem('googleAccount') ? window.localStorage.getItem('googleAccount') : purchaseToken+'@google.com') : product.transaction.id+'@itunes.com');
		
		var url = IAP.subscribeMethod;		
		
		if (IAP.subscribeMethod == 'stargate'){
		
			url = CONFIGS.api.userCreate;
		
			if(app.app_prefix)
				url = url.replace('%app_prefix%', app.app_prefix).replace('%selector%', app.selector);
			else
				url = url.replace('%app_prefix%/', '').replace('%selector%/', '');
			
			url = url.replace('%domain%', app.url()).replace('%country%', app.country);
		}
		
		$.ajax({
		  type: "POST",
		  url: url,
		  data: "paymethod="+IAP.paymethod+"&user_account="+window.localStorage.getItem('user_account')+"&purchase_token="+encodeURIComponent(purchaseToken)+"&return_url="+encodeURIComponent(app.url())+"&inapp_pwd="+IAP.getPassword(purchaseToken)+"&hybrid=1",
		  dataType: "json",
		  success: function(user)
		  {
			console.log(user);
			user.device_id = device.uuid;
			if(window.localStorage.getItem('transaction_id')){
				user.transaction_id = window.localStorage.getItem('transaction_id');
			}
			app.sendBackToStargate('stargate.purchase.subscription', app.msgId, true, user, false);
		  },
		  error: function(err)
		  {
			console.log("Chiamata fallita, si prega di riprovare...", err);
			var error = {"iap_error" : "1", "return_url" : app.url()};
			app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, error, false);
		  }
		});
	}
};
var md5=(function(){function e(e,t){var o=e[0],u=e[1],a=e[2],f=e[3];o=n(o,u,a,f,t[0],7,-680876936);f=n(f,o,u,a,t[1],
12,-389564586);a=n(a,f,o,u,t[2],17,606105819);u=n(u,a,f,o,t[3],22,-1044525330);o=n(o,u,a,f,t[4],7,-176418897);f=n(f,o,u,a,t[5],
12,1200080426);a=n(a,f,o,u,t[6],17,-1473231341);u=n(u,a,f,o,t[7],22,-45705983);o=n(o,u,a,f,t[8],7,1770035416);f=n(f,o,u,a,t[9],
12,-1958414417);a=n(a,f,o,u,t[10],17,-42063);u=n(u,a,f,o,t[11],22,-1990404162);o=n(o,u,a,f,t[12],7,1804603682);f=n(f,o,u,a,t[13],
12,-40341101);a=n(a,f,o,u,t[14],17,-1502002290);u=n(u,a,f,o,t[15],22,1236535329);o=r(o,u,a,f,t[1],5,-165796510);f=r(f,o,u,a,t[6],
9,-1069501632);a=r(a,f,o,u,t[11],14,643717713);u=r(u,a,f,o,t[0],20,-373897302);o=r(o,u,a,f,t[5],5,-701558691);f=r(f,o,u,a,t[10],
9,38016083);a=r(a,f,o,u,t[15],14,-660478335);u=r(u,a,f,o,t[4],20,-405537848);o=r(o,u,a,f,t[9],5,568446438);f=r(f,o,u,a,t[14],
9,-1019803690);a=r(a,f,o,u,t[3],14,-187363961);u=r(u,a,f,o,t[8],20,1163531501);o=r(o,u,a,f,t[13],5,-1444681467);f=r(f,o,u,a,t[2],
9,-51403784);a=r(a,f,o,u,t[7],14,1735328473);u=r(u,a,f,o,t[12],20,-1926607734);o=i(o,u,a,f,t[5],4,-378558);f=i(f,o,u,a,t[8],
11,-2022574463);a=i(a,f,o,u,t[11],16,1839030562);u=i(u,a,f,o,t[14],23,-35309556);o=i(o,u,a,f,t[1],4,-1530992060);f=i(f,o,u,a,t[4],
11,1272893353);a=i(a,f,o,u,t[7],16,-155497632);u=i(u,a,f,o,t[10],23,-1094730640);o=i(o,u,a,f,t[13],4,681279174);f=i(f,o,u,a,t[0],
11,-358537222);a=i(a,f,o,u,t[3],16,-722521979);u=i(u,a,f,o,t[6],23,76029189);o=i(o,u,a,f,t[9],4,-640364487);f=i(f,o,u,a,t[12],
11,-421815835);a=i(a,f,o,u,t[15],16,530742520);u=i(u,a,f,o,t[2],23,-995338651);o=s(o,u,a,f,t[0],6,-198630844);f=s(f,o,u,a,t[7],
10,1126891415);a=s(a,f,o,u,t[14],15,-1416354905);u=s(u,a,f,o,t[5],21,-57434055);o=s(o,u,a,f,t[12],6,1700485571);f=s(f,o,u,a,t[3],
10,-1894986606);a=s(a,f,o,u,t[10],15,-1051523);u=s(u,a,f,o,t[1],21,-2054922799);o=s(o,u,a,f,t[8],6,1873313359);f=s(f,o,u,a,t[15],
10,-30611744);a=s(a,f,o,u,t[6],15,-1560198380);u=s(u,a,f,o,t[13],21,1309151649);o=s(o,u,a,f,t[4],6,-145523070);f=s(f,o,u,a,t[11],
10,-1120210379);a=s(a,f,o,u,t[2],15,718787259);u=s(u,a,f,o,t[9],21,-343485551);e[0]=m(o,e[0]);e[1]=m(u,e[1]);e[2]=m(a,e[2]);e[3]=m(f,e[3])}
function t(e,t,n,r,i,s){t=m(m(t,e),m(r,s));return m(t<<i|t>>>32-i,n)}function n(e,n,r,i,s,o,u){return t(n&r|~n&i,e,n,s,o,u)}
function r(e,n,r,i,s,o,u){return t(n&i|r&~i,e,n,s,o,u)}function i(e,n,r,i,s,o,u){return t(n^r^i,e,n,s,o,u)}
function s(e,n,r,i,s,o,u){return t(r^(n|~i),e,n,s,o,u)}function o(t){var n=t.length,r=[1732584193,-271733879,-1732584194,271733878],i;
for(i=64;i<=t.length;i+=64){e(r,u(t.substring(i-64,i)))}t=t.substring(i-64);var s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
for(i=0;i<t.length;i++)s[i>>2]|=t.charCodeAt(i)<<(i%4<<3);s[i>>2]|=128<<(i%4<<3);if(i>55){e(r,s);for(i=0;i<16;i++)s[i]=0}s[14]=n*8;e(r,s);return r}
function u(e){var t=[],n;for(n=0;n<64;n+=4){t[n>>2]=e.charCodeAt(n)+(e.charCodeAt(n+1)<<8)+(e.charCodeAt(n+2)<<16)+(e.charCodeAt(n+3)<<24)}return t}
function c(e){var t="",n=0;for(;n<4;n++)t+=a[e>>n*8+4&15]+a[e>>n*8&15];return t}
function h(e){for(var t=0;t<e.length;t++)e[t]=c(e[t]);return e.join("")}
function d(e){return h(o(unescape(encodeURIComponent(e))))}
function m(e,t){return e+t&4294967295}var a="0123456789abcdef".split("");return d})();
var MFP = {};

MFP.check = function(){
	
	if(CONFIGS.label.country){
		
		MFP.get(CONFIGS.label.country);
		
	}else{

		var xmlhttp;
		
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		
		// network info	
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4){
				if(xmlhttp.status === 200) {
					try {
						console.log(xmlhttp.responseText);
						var serverResponse = JSON.parse(xmlhttp.responseText);
						console.log(serverResponse);
						
						var country = serverResponse.response.realCountry;
						MFP.get(country);
					}
					catch(e){
						// display error message
						console.log("Error MFP.check reading the response: " + e.toString());
						app.launch(app.url());
					}
				}
				else {
					console.log("Error MFP.check", xmlhttp.statusText); 
					app.launch(app.url());
				}
			}
		}
		
		var url = CONFIGS.api.networkInfo;
		url = url.replace('%apikey%',CONFIGS.label.apimm_apikey);
		
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}

};
MFP.getContents = function(country,namespace,label,extData) {
	
	var contents_inapp = {};
    contents_inapp.api_country= label;
    contents_inapp.country =country;
    if (extData){
        contents_inapp.extData= extData;
    }
    contents_inapp.fpnamespace= namespace;
    
    var json_data = JSON.stringify(contents_inapp);
       
    return json_data;

};
MFP.set = function(pony,country) {
	
	var url = CONFIGS.label.url + CONFIGS.api.mfpSet;
	var appUrl = app.url();
	if(pony){
		pony = '&' + pony;
	}
	if (window.localStorage.getItem('appUrl')){
		appUrl = window.localStorage.getItem('appUrl');
	}
	url = url.replace('%pony%',pony).replace('%url%',encodeURIComponent(appUrl));
			
	console.log("MFP going to url: ", url);

	app.launch(url);
	

};
MFP.get = function(country) {

	var xmlhttp;
	var ponyUrl = '';
	
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else {// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState ===4){
			
			if(xmlhttp.status === 200) {
				try {
					
					console.log(xmlhttp.responseText);
					var serverResponse = JSON.parse(xmlhttp.responseText);
					console.log(serverResponse);
					
					if (serverResponse.content.inappInfo){
						var jsonStruct = JSON.parse(serverResponse.content.inappInfo);
		                if ((jsonStruct.extData) && (jsonStruct.extData.ponyUrl)){
							ponyUrl = jsonStruct.extData.ponyUrl;
						}
		                if ((jsonStruct.extData) && (jsonStruct.extData.return_url)){
		                	window.localStorage.setItem('appUrl', jsonStruct.extData.return_url);
		                }
		                                        
					}else{
						console.log("Empty session MFP.get");
					}
					
					MFP.set(ponyUrl,country);		
					
				}
				catch(e){
			        // display error message
			        console.log("Error MFP.get reading the response: " + e.toString());
			        app.launch(app.url());
				}
			}
			else {
				console.log("Error MFP.get", xmlhttp.statusText); 
				app.launch(app.url());
			}
		} 
	}
	
	var lang = navigator.language.split("-");
	
	var namespace = CONFIGS.label.namespace;
    var expire = "";
    var apikey = CONFIGS.label.motime_apikey;
    var label   = CONFIGS.label.label;
    var contents_inapp = MFP.getContents(country,namespace,label);
	var url = CONFIGS.api.mfpGet;
	url = url.replace('%apikey%', apikey).replace('%contents_inapp%', contents_inapp).replace('%country%', country).replace('%expire%', expire);
	
	xmlhttp.open("GET",url,true);
	xmlhttp.send();


};

/* global Q */

/***
* 
* 
* 
*/

// logger function
var log = function(msg, obj) {
    if (typeof obj !== 'undefined') {
        console.log("[Stargate] "+msg+" ",obj);
    } else {
        console.log("[Stargate] "+msg);
    }
    return true;
};
var err = function(msg, obj) {
    if (typeof obj !== 'undefined') {
        console.error("[Stargate] "+msg+" ",obj);
    } else {
        console.error("[Stargate] "+msg);
    }
    return false;
};


// device informations   // examples
var runningDevice = {
    available: false,    // true
    cordova: "",         // 4.1.1
    manufacturer: "",    // samsung
    model: "",           // GT-I9505
    platform: "",        // Android
    uuid: "",            // ac7245e38e3dfecb
    version: ""          // 5.0.1
};
var isRunningOnAndroid = function() {
    return runningDevice.platform == "Android";
};
var isRunningOnIos = function() {
    return runningDevice.platform == "iOS";
};
var isRunningOnCordova = function () {
    return (typeof window.cordova !== "undefined");
};
var initDevice = function() {
    if (typeof window.device === 'undefined') {
        return err("Missing cordova device plugin");
    }
    for (var key in runningDevice) {
        if (window.device.hasOwnProperty(key)) {
            runningDevice[key] = window.device[key];
        }
    }
    return true;
};



// global variable used by old stargate client
// @deprecated since v2
window.pubKey = '';
// @deprecated since v2
window.forge = '';

var getAppVersion = function() {

    var deferred = Q.defer();

    // FIXME: check if there is a fail callback

    cordova.getAppVersion(function (version) {
        log("[getAppVersionPromise] got version: "+version);
        deferred.resolve(version);
    });

    return deferred.promise;
};
var getManifest = function() {

    var deferred = Q.defer();

    hostedwebapp.getManifest(
        function(manifest){
            deferred.resolve(manifest);
        },
        function(error){
            deferred.reject(new Error(error));
            console.error(error);
        }
    );
    return deferred.promise;
};

var isStargateInitialized = false;
var isStargateOpen = false;
var initializeCallback = null;
var initializeDeferred = null;

var appVersion = '';

var country = '',
    selector = '',
    api_selector = '',
    app_prefix = '',
    hybrid_conf = {};

var onPluginReady = function () {


    // ---- start old atlantis initialize ----

    document.title = CONFIGS.label.title;
    
    StatusBar.hide();

    
    // FIXME: check how to do mfp initialization
    if (app.hasFeature('mfp')) {
        MFP.check();
    }

    
    if (app.hasFeature('deltadna')) {
        window.deltadna.startSDK(CONFIGS.label.deltadna.environmentKey, CONFIGS.label.deltadna.collectApi, CONFIGS.label.deltadna.engageApi, app.onDeltaDNAStartedSuccess, app.onDeltaDNAStartedError, CONFIGS.label.deltadna.settings);
    }

    // FIXME: stargate.ad is public ?
    if(AdStargate){
        stargatePublic.ad = new AdStargate();
    }

    navigator.splashscreen.hide();
    app.setBusy(false);

    IAP.initialize();

    document.cookie="hybrid=1; path=/";

    // initialize finished
    isStargateOpen = true;

    //FIXME: call callback when device ready arrived
    initializeCallback();
};

var onDeviceReady = function () {
    initDevice();

    // 
    var getAppVersionPromise = getAppVersion();
    var getManifestPromise = getManifest();

    Q.all([
        getAppVersionPromise,
        getManifestPromise
    ])
    .then(function(version, manifest) {
        
        appVersion = version;

        stargateConf = manifest.stargateConf;

        onPluginReady();
    })
};

stargatePublic.initialize = function(configurations, pubKey, forge, callback) {


    if (isStargateInitialized) {
        Q.defer().reject(new Error("Stargate.initialize() already called!"));
    }
    
    isStargateInitialized = true;

    initializeCallback = callback;
    initializeDeferred = Q.defer();


    if(configurations.country){
        country = configurations.country;
    }
    if(configurations.selector){
        selector = configurations.selector;
    }
    if(configurations.api_selector){
        api_selector = configurations.api_selector;
    }
    if(configurations.app_prefix){
        app_prefix = configurations.app_prefix;
    }
    if(configurations.hybrid_conf){
        if (typeof configurations.hybrid_conf === 'object') {
            hybrid_conf = configurations.hybrid_conf;
        } else {
            hybrid_conf = JSON.parse(decodeURIComponent(configurations.hybrid_conf));
        }
    }

    // finish the initialization of cordova plugin when deviceReady is received
    document.addEventListener('deviceready', onDeviceReady, false);
    
    return initDeferred.promise;
};

stargatePublic.isInitialized = function() {
    return isStargateInitialized;
};
stargatePublic.isOpen = function() {
    return isStargateOpen;
};

stargatePublic.openUrl = function(url) {};
stargatePublic.inAppPurchase = function(productId, callbackSuccess, callbackError, createUserUrl) {};
stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {};
stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {};
stargatePublic.facebookLogin = function(scope, callbackSuccess, callbackError) {};
stargatePublic.facebookShare = function(url, callbackSuccess, callbackError) {};
stargatePublic.googleLogin = function(callbackSuccess, callbackError) {};
stargatePublic.checkConnection = function(callbackSuccess, callbackError) {};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {};



/*
var Stargate = {
    
    openUrl: function(url){
        Stargate.messages.system = new Message();
        Stargate.messages.system.exec = 'system';
        Stargate.messages.system.url = url;
        Stargate.messages.system.send();
    },
        
    inAppPurchase: function(productId, callbackSuccess, callbackError, createUserUrl){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.purchase';
        if (typeof createUserUrl !== 'undefined'){
            Stargate.messages[msgId].createUserUrl =  createUserUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },

    inAppPurchaseSubscription: function(callbackSuccess, callbackError, subscriptionUrl, returnUrl){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.purchase.subscription';
        if (typeof subscriptionUrl !== 'undefined'){
            Stargate.messages[msgId].subscriptionUrl =  subscriptionUrl;
        }
        if (typeof returnUrl !== 'undefined'){
            Stargate.messages[msgId].returnUrl =  returnUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },

    inAppRestore: function(callbackSuccess, callbackError, subscriptionUrl, returnUrl){
        var msgId = this.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.restore';
        if (typeof subscriptionUrl !== 'undefined'){
            Stargate.messages[msgId].subscriptionUrl =  subscriptionUrl;
        }
        if (typeof returnUrl !== 'undefined'){
            Stargate.messages[msgId].returnUrl =  returnUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();        
    },
    
    facebookLogin: function(scope, callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.facebookLogin';
        Stargate.messages[msgId].scope = scope;
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },
    
    facebookShare: function(url, callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.facebookShare';
        Stargate.messages[msgId].url = url;
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },
    
    googleLogin: function(callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.googleLogin';
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },  
    
    checkConnection: function(callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.checkConnection';
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },  
    
    getDeviceID: function(callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.getDeviceID';
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },  
    
}
*/

var stargateBusy = false;
var isBusy = function() { return stargateBusy; };

var setBusy = function(value) {
    if (value) {
        stargateBusy = true;
        startLoading();
    }
    else {
        stargateBusy = false;
        stopLoading();
    }
};

var stargateConf = {};

var hasFeature = function(feature) {
    return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
};










/*!
 * jsUri
 * https://github.com/derek-watson/jsUri
 *
 * Copyright 2013, Derek Watson
 * Released under the MIT license.
 *
 * Includes parseUri regular expressions
 * http://blog.stevenlevithan.com/archives/parseuri
 * Copyright 2007, Steven Levithan
 * Released under the MIT license.
 */

 /*globals define, module */

(function(global) {

  var re = {
    starts_with_slashes: /^\/+/,
    ends_with_slashes: /\/+$/,
    pluses: /\+/g,
    query_separator: /[&;]/,
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  };

  /**
   * Define forEach for older js environments
   * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach#Compatibility
   */
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      for (var i = 0, len = this.length; i < len; ++i) {
        fn.call(scope || this, this[i], i, this);
      }
    };
  }

  /**
   * unescape a query param value
   * @param  {string} s encoded value
   * @return {string}   decoded value
   */
  function decode(s) {
    if (s) {
      s = decodeURIComponent(s);
      s = s.replace(re.pluses, ' ');
    }
    return s;
  }

  /**
   * Breaks a uri string down into its individual parts
   * @param  {string} str uri
   * @return {object}     parts
   */
  function parseUri(str) {
    var parser = re.uri_parser;
    var parserKeys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
    var m = parser.exec(str || '');
    var parts = {};

    parserKeys.forEach(function(key, i) {
      parts[key] = m[i] || '';
    });

    return parts;
  }

  /**
   * Breaks a query string down into an array of key/value pairs
   * @param  {string} str query
   * @return {array}      array of arrays (key/value pairs)
   */
  function parseQuery(str) {
    var i, ps, p, n, k, v;
    var pairs = [];

    if (typeof(str) === 'undefined' || str === null || str === '') {
      return pairs;
    }

    if (str.indexOf('?') === 0) {
      str = str.substring(1);
    }

    ps = str.toString().split(re.query_separator);

    for (i = 0; i < ps.length; i++) {
      p = ps[i];
      n = p.indexOf('=');

      if (n !== 0) {
        k = decodeURIComponent(p.substring(0, n));
        v = decodeURIComponent(p.substring(n + 1));
        pairs.push(n === -1 ? [p, null] : [k, v]);
      }

    }
    return pairs;
  }

  /**
   * Creates a new Uri object
   * @constructor
   * @param {string} str
   */
  function Uri(str) {
    this.uriParts = parseUri(str);
    this.queryPairs = parseQuery(this.uriParts.query);
    this.hasAuthorityPrefixUserPref = null;
  }

  /**
   * Define getter/setter methods
   */
  ['protocol', 'userInfo', 'host', 'port', 'path', 'anchor'].forEach(function(key) {
    Uri.prototype[key] = function(val) {
      if (typeof val !== 'undefined') {
        this.uriParts[key] = val;
      }
      return this.uriParts[key];
    };
  });

  /**
   * if there is no protocol, the leading // can be enabled or disabled
   * @param  {Boolean}  val
   * @return {Boolean}
   */
  Uri.prototype.hasAuthorityPrefix = function(val) {
    if (typeof val !== 'undefined') {
      this.hasAuthorityPrefixUserPref = val;
    }

    if (this.hasAuthorityPrefixUserPref === null) {
      return (this.uriParts.source.indexOf('//') !== -1);
    } else {
      return this.hasAuthorityPrefixUserPref;
    }
  };

  /**
   * Serializes the internal state of the query pairs
   * @param  {string} [val]   set a new query string
   * @return {string}         query string
   */
  Uri.prototype.query = function(val) {
    var s = '', i, param;

    if (typeof val !== 'undefined') {
      this.queryPairs = parseQuery(val);
    }

    for (i = 0; i < this.queryPairs.length; i++) {
      param = this.queryPairs[i];
      if (s.length > 0) {
        s += '&';
      }
      if (param[1] === null) {
        s += param[0];
      } else {
        s += param[0];
        s += '=';
        if (param[1]) {
          s += encodeURIComponent(param[1]);
        }
      }
    }
    return s.length > 0 ? '?' + s : s;
  };

  /**
   * returns the first query param value found for the key
   * @param  {string} key query key
   * @return {string}     first value found for key
   */
  Uri.prototype.getQueryParamValue = function (key) {
    var param, i;
    for (i = 0; i < this.queryPairs.length; i++) {
      param = this.queryPairs[i];
      if (key === param[0]) {
        return param[1];
      }
    }
  };

  /**
   * returns an array of query param values for the key
   * @param  {string} key query key
   * @return {array}      array of values
   */
  Uri.prototype.getQueryParamValues = function (key) {
    var arr = [], i, param;
    for (i = 0; i < this.queryPairs.length; i++) {
      param = this.queryPairs[i];
      if (key === param[0]) {
        arr.push(param[1]);
      }
    }
    return arr;
  };

  /**
   * removes query parameters
   * @param  {string} key     remove values for key
   * @param  {val}    [val]   remove a specific value, otherwise removes all
   * @return {Uri}            returns self for fluent chaining
   */
  Uri.prototype.deleteQueryParam = function (key, val) {
    var arr = [], i, param, keyMatchesFilter, valMatchesFilter;

    for (i = 0; i < this.queryPairs.length; i++) {

      param = this.queryPairs[i];
      keyMatchesFilter = decode(param[0]) === decode(key);
      valMatchesFilter = param[1] === val;

      if ((arguments.length === 1 && !keyMatchesFilter) || (arguments.length === 2 && (!keyMatchesFilter || !valMatchesFilter))) {
        arr.push(param);
      }
    }

    this.queryPairs = arr;

    return this;
  };

  /**
   * adds a query parameter
   * @param  {string}  key        add values for key
   * @param  {string}  val        value to add
   * @param  {integer} [index]    specific index to add the value at
   * @return {Uri}                returns self for fluent chaining
   */
  Uri.prototype.addQueryParam = function (key, val, index) {
    if (arguments.length === 3 && index !== -1) {
      index = Math.min(index, this.queryPairs.length);
      this.queryPairs.splice(index, 0, [key, val]);
    } else if (arguments.length > 0) {
      this.queryPairs.push([key, val]);
    }
    return this;
  };

  /**
   * replaces query param values
   * @param  {string} key         key to replace value for
   * @param  {string} newVal      new value
   * @param  {string} [oldVal]    replace only one specific value (otherwise replaces all)
   * @return {Uri}                returns self for fluent chaining
   */
  Uri.prototype.replaceQueryParam = function (key, newVal, oldVal) {
    var index = -1, i, param;

    if (arguments.length === 3) {
      for (i = 0; i < this.queryPairs.length; i++) {
        param = this.queryPairs[i];
        if (decode(param[0]) === decode(key) && decodeURIComponent(param[1]) === decode(oldVal)) {
          index = i;
          break;
        }
      }
      this.deleteQueryParam(key, decode(oldVal)).addQueryParam(key, newVal, index);
    } else {
      for (i = 0; i < this.queryPairs.length; i++) {
        param = this.queryPairs[i];
        if (decode(param[0]) === decode(key)) {
          index = i;
          break;
        }
      }
      this.deleteQueryParam(key);
      this.addQueryParam(key, newVal, index);
    }
    return this;
  };

  /**
   * Define fluent setter methods (setProtocol, setHasAuthorityPrefix, etc)
   */
  ['protocol', 'hasAuthorityPrefix', 'userInfo', 'host', 'port', 'path', 'query', 'anchor'].forEach(function(key) {
    var method = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
    Uri.prototype[method] = function(val) {
      this[key](val);
      return this;
    };
  });

  /**
   * Scheme name, colon and doubleslash, as required
   * @return {string} http:// or possibly just //
   */
  Uri.prototype.scheme = function() {
    var s = '';

    if (this.protocol()) {
      s += this.protocol();
      if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
        s += ':';
      }
      s += '//';
    } else {
      if (this.hasAuthorityPrefix() && this.host()) {
        s += '//';
      }
    }

    return s;
  };

  /**
   * Same as Mozilla nsIURI.prePath
   * @return {string} scheme://user:password@host:port
   * @see  https://developer.mozilla.org/en/nsIURI
   */
  Uri.prototype.origin = function() {
    var s = this.scheme();

    if (s == 'file://') {
      return s + this.uriParts.authority;
    }

    if (this.userInfo() && this.host()) {
      s += this.userInfo();
      if (this.userInfo().indexOf('@') !== this.userInfo().length - 1) {
        s += '@';
      }
    }

    if (this.host()) {
      s += this.host();
      if (this.port()) {
        s += ':' + this.port();
      }
    }

    return s;
  };

  /**
   * Adds a trailing slash to the path
   */
  Uri.prototype.addTrailingSlash = function() {
    var path = this.path() || '';

    if (path.substr(-1) !== '/') {
      this.path(path + '/');
    }

    return this;
  };

  /**
   * Serializes the internal state of the Uri object
   * @return {string}
   */
  Uri.prototype.toString = function() {
    var path, s = this.origin();

    if (this.path()) {
      path = this.path();
      if (!(re.ends_with_slashes.test(s) || re.starts_with_slashes.test(path))) {
        s += '/';
      } else {
        if (s) {
          s.replace(re.ends_with_slashes, '/');
        }
        path = path.replace(re.starts_with_slashes, '/');
      }
      s += path;
    } else {
      if (this.host() && (this.query().toString() || this.anchor())) {
        s += '/';
      }
    }
    if (this.query().toString()) {
      if (this.query().toString().indexOf('?') !== 0) {
        s += '?';
      }
      s += this.query().toString();
    }

    if (this.anchor()) {
      if (this.anchor().indexOf('#') !== 0) {
        s += '#';
      }
      s += this.anchor();
    }

    return s;
  };

  /**
   * Clone a Uri object
   * @return {Uri} duplicate copy of the Uri
   */
  Uri.prototype.clone = function() {
    return new Uri(this.toString());
  };

  /**
   * export via AMD or CommonJS, otherwise leak a global
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return Uri;
    });
  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Uri;
  } else {
    global.Uri = Uri;
  }
}(this));


var ua = {
    Android: function() {
        return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function() {
        return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    Windows: function() {
        return /IEMobile/i.test(navigator.userAgent);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

function reboot(){
    window.location.href = 'index.html';
}


var utils = {
    elementHasClass: function (element, selector) {
        var className = " " + selector + " ",
            rclass = "/[\n\t\r]/g",
            i = 0;
        if ( (" " + element.className + " ").replace(rclass, " ").indexOf(className) >= 0 ) {
            return true;
        }
        return false;
    },

    // a   url (naming it a, beacause it will be reused to store callbacks)
	// xhr placeholder to avoid using var, not to be used
	pegasus: function(a, xhr) {
	  xhr = new XMLHttpRequest();

	  // Open url
	  xhr.open('GET', a);

	  // Reuse a to store callbacks
	  a = [];

	  // onSuccess handler
	  // onError   handler
	  // cb        placeholder to avoid using var, should not be used
	  xhr.onreadystatechange = xhr.then = function(onSuccess, onError, cb) {

	    // Test if onSuccess is a function or a load event
	    if (onSuccess.call) a = [,onSuccess, onError];

	    // Test if request is complete
	    if (xhr.readyState == 4) {

	      // index will be:
	      // 0 if undefined
	      // 1 if status is between 200 and 399
	      // 2 if status is over
	      cb = a[0|xhr.status / 200];

	      // Safari doesn't support xhr.responseType = 'json'
	      // so the response is parsed
	      if (cb) {
	        try {
	          cb(JSON.parse(xhr.responseText), xhr);
	        } catch (e) {
	          cb(null, xhr);
	        }
	      }
	    }
	  };

	  // Send
	  xhr.send();

	  // Return request
	  return xhr;
	}
};

function startLoading(){
    document.getElementById("waiting").className = "on";
}
function stopLoading(){
    document.getElementById("waiting").className = "";
}
function timeoutLoading(t){
    startLoading();
    setTimeout(function(){stopLoading();}, t);
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


    // Just return a value to define the module export
    return stargatePublic;
}));


