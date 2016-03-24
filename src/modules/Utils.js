/**
 * Logger module
 * @module src/modules/Utils
 * @type {Object}
 */
(function(stargateModules){
    /**
     * @constructor
     * @alias module:src/modules/Logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * @param {String} tag - a tag to identify a log group. it will be prepended to any log function
     * @example
     * var myLogger = new Logger("ALL", "TAG");
     * myLogger.i("Somenthing", 1); // output will be > ["TAG"], "Somenthing", 1
     * myLogger.setLevel("off") // other values OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    function Logger(label, tag){
        this.level = Logger.levels[label.toUpperCase()];
        this.tag = tag;
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
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.ERROR){
            window.console.error.apply(console, _arguments);
        }
    };

    /**
     * Info Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.i = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.WARN){
            window.console.info.apply(console, _arguments);
        }
    };

    /**
     * Warn Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.w = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.INFO){
            window.console.warn.apply(console, _arguments);
        }
    };

    /**
     * Debug Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.d = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.DEBUG){
            window.console.log.apply(console, _arguments);
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
     * makeIterator
     *
     * make an iterator object from array
     * @param {Array} array - the array you want to transform in iterator
     * @returns {Object} - an iterator like object
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
     * @param {Strinq} api
     * @param {Object} params
     * @returns {String}
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
     * @param {String} url -
     * @returns {Promise<Object|String>} the reject string is the statuscode
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
     * make a jsonp request, remember only GET
     * usage: request = new jsonpRequest(url); request.then(...)
     *
     * @param {String} url - the url with querystring but without &callback at the end or &function
     * @returns {Promise<Object|>}
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
        }else{
            return false;
        }
    }

    /**
     * getImageRaw from a specific url
     *
     * @param {Object} options - the options object
     * @param {String} options.url - http or whatever
     * @param {String} [options.responseType="blob"] - possible values arraybuffer|blob
     * @param {String} [options.mimeType="image/jpeg"] - possible values "image/png"|"image/jpeg" used only if "blob" is set as responseType
     * @param {Function} [onProgress=function(){}]
     @returns {Promise<Blob|ArrayBuffer|Error>}
     */
    function getImageRaw(options){
        var onProgress = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
        return new Promise(function(resolve, reject){
            var request = new XMLHttpRequest();
            request.open ("GET", options.url, true);
            request.responseType = options.responseType || "blob";
            request.withCredentials = true;
            function transferComplete(evt){
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

            var transferCanceled = transferFailed = reject;

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