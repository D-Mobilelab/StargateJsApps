/**
 * Utils module
 * @module src/modules/Utils
 * @type {Object}
 */
(function(stargateModules){
    /**
     * @class
     * @alias module:src/modules/Utils.Logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * @param {String} tag - a tag to identify a log group. it will be prepended to any log function
     * @param {Object} [styles={background:"white",color:"black"}] -
     * @param {String} styles.background - background color CSS compatibile
     * @param {String} styles.color - color text CSS compatible
     * @example
     * var myLogger = new Logger("ALL", "TAG",{background:"black",color:"blue"});
     * myLogger.i("Somenthing", 1); // output will be > ["TAG"], "Somenthing", 1
     * myLogger.setLevel("off") // other values OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    function Logger(label, tag, styles){
        this.level = Logger.levels[label.toUpperCase()];
        this.styles = styles || {background:"white",color:"black"}; //default
        this.tag = "%c " + tag + " ";

        this.styleString = "background:" + this.styles.background + ";" + "color:" + this.styles.color + ";";
        //private and immutable
        Object.defineProperties(this, {
            "__d": {
                value: window.console.log.bind(window.console, this.tag, this.styleString),
                writable: false,
                enumerable:false,
                configurable:false
            },
            "__i": {
                value: window.console.info.bind(window.console, this.tag, this.styleString),
                writable: false,
                enumerable:false,
                configurable:false
            },"__e": {
                value: window.console.error.bind(window.console, this.tag, this.styleString),
                writable: false,
                enumerable:false,
                configurable:false
            },"__w": {
                value: window.console.warn.bind(window.console, this.tag, this.styleString),
                writable: false,
                enumerable:false,
                configurable:false
            }
        });
    }

    //Logger.prototype.group
    //OFF < DEBUG < INFO < WARN < ERROR < ALL
    // 0  < 1  < 2 < 3 < 4 < 5
    Logger.levels = {
        ALL:5,
        ERROR:4,
        WARN:3,
        INFO:2,
        DEBUG:1,
        OFF:0
    };

    /**
     * Error Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.e = function(){

        if(this.level !== 0 && this.level >= Logger.levels.ERROR){
            this.__e(arguments);
        }
    };

    /**
     * Info Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.i = function(){

        if(this.level !== 0 && this.level >= Logger.levels.WARN){
            this.__i(arguments);
        }
    };

    /**
     * Warn Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.w = function(){
        if(this.level !== 0 && this.level >= Logger.levels.INFO){
            this.__w(arguments);
        }
    };

    /**
     * Debug Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.d = function(){

        if(this.level !== 0 && this.level >= Logger.levels.DEBUG){
            this.__d(arguments);
        }
    };

    /**
     * Set the level of the logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    Logger.prototype.setLevel = function(label){
        this.level = Logger.levels[label];
    };

    /**
     * Iterator
     *
     * @alias module:src/modules/Utils.Iterator
     * @example
     * var myArray = ["pippo", "pluto", "paperino"];
     * var it = Utils.Iterator(myArray);
     * it.next().value === "pippo"; //true
     * it.next().value === "pluto"; //true
     * it.next(true).value === "paperino" //false because with true you can reset it!
     * @param {Array} array - the array you want to transform in iterator
     * @returns {Object} - an iterator-like object
     * */
    function Iterator(array){
        var nextIndex = 0;

        return {
            next: function(reset){
                if(reset){nextIndex = 0;}
                return nextIndex < array.length ?
                {value: array[nextIndex++], done: false} :
                {done: true};
            }
        };
    }

    /**
     * A function to compose query string
     *
     * @alias module:src/modules/Utils.composeApiString
     * @example
     * var API = "http://jsonplaceholder.typicode.com/comments"
     * var url = composeApiString(API, {postId:1});
     * // url will be "http://jsonplaceholder.typicode.com/comments?postId=1"
     * @param {Strinq} api
     * @param {Object} params - a key value object: will be append to <api>?key=value&key2=value2
     * @returns {String} the string composed
     * */
    function composeApiString(api, params){
        api += "?";
        var qs = "";

        for(var key in params){
            qs += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
        }

        if (qs.length > 0){
            qs = qs.substring(0, qs.length-1); //chop off last "&"
        }
        return api + qs;
    }

    /**
     * getJSON
     *
     * @alias module:src/modules/Utils.getJSON
     * @param {String} url - for example http://jsonplaceholder.typicode.com/comments?postId=1
     * @returns {Promise<Object|String>} the string error is the statuscode
     * */
    function getJSON(url){
        url = encodeURI(url);
        var xhr = new window.XMLHttpRequest();
        var daRequest = new Promise(function(resolve, reject){
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4 && xhr.status < 400) {
                    resolve(xhr.response);
                }else{
                    reject(xhr.status);
                }
            };
        });
        xhr.open("GET", url, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
        xhr.send();
        return daRequest;
    }

    /**
     * Make a jsonp request, remember only GET
     * The function create a tag script and append a callback param in querystring.
     * The promise will be reject after 3s if the url fail to respond
     *
     * @class
     * @alias module:src/modules/Utils.jsonpRequest
     * @example
     * request = new jsonpRequest("http://www.someapi.com/asd?somequery=1");
     * request.then(...)
     * @param {String} url - the url with querystring but without &callback at the end or &function
     * @returns {Promise<Object|String>}
     * */
    function jsonpRequest(url){
        var self = this;
        self.timeout = 3000;
        self.called = false;
        if(window.document) {
            var ts = Date.now();
            self.scriptTag = window.document.createElement("script");
            url += "&callback=window.__jsonpHandler_" + ts;
            self.scriptTag.src = url;
            self.scriptTag.type = 'text/javascript';
            self.scriptTag.async = true;

            self.prom = new Promise(function(resolve, reject){
                var functionName = "__jsonpHandler_" + ts;
                window[functionName] = function(data){
                    self.called = true;
                    resolve(data);
                    self.scriptTag.parentElement.removeChild(self.scriptTag);
                    delete window[functionName];
                };
                //reject after a timeout
                setTimeout(function(){
                    if(!self.called){
                        reject("Timeout jsonp request " + ts);
                        self.scriptTag.parentElement.removeChild(self.scriptTag);
                        delete window[functionName];
                    }
                }, self.timeout);
            });
            // the append start the call
            window.document.getElementsByTagName("head")[0].appendChild(self.scriptTag);
            //return self.daPromise;
        }
    }

    /**
     * getImageRaw from a specific url
     *
     * @alias module:src/modules/Utils.getImageRaw
     * @param {Object} options - the options object
     * @param {String} options.url - http or whatever
     * @param {String} [options.responseType="blob"] - possible values arraybuffer|blob
     * @param {String} [options.mimeType="image/jpeg"] - possible values "image/png"|"image/jpeg" used only if "blob" is set as responseType
     * @param {Function} [_onProgress=function(){}]
     * @returns {Promise<Blob|ArrayBuffer|Error>}
     */
    function getImageRaw(options, _onProgress){
        var onProgress = _onProgress || function(){};
        return new Promise(function(resolve, reject){
            var request = new XMLHttpRequest();
            request.open ("GET", options.url, true);
            request.responseType = options.responseType || "blob";
            request.withCredentials = true;
            function transferComplete(){
                var result;
                switch(options.responseType){
                    case "blob":
                        result = new Blob([this.response], {type: options.mimeType || "image/jpeg"});
                        break;
                    case "arraybuffer":
                        result = this.response;
                        break;
                    default:
                        result = this.response;
                        resolve(result);
                        break;

                }
            }

            var transferCanceled = reject;
            var transferFailed = reject;

            request.addEventListener("progress", onProgress, false);
            request.addEventListener("load", transferComplete, false);
            request.addEventListener("error", transferFailed, false);
            request.addEventListener("abort", transferCanceled, false);

            request.send(null);
        });

    }

    var exp = {
        Iterator:Iterator,
        Logger:Logger,
        composeApiString:composeApiString,
        getJSON:getJSON,
        jsonpRequest:jsonpRequest,
        getImageRaw:getImageRaw
    };

    if(stargateModules){
        stargateModules.Utils = exp;
    }else{
        window.Utils = exp;
    }

})(stargateModules);