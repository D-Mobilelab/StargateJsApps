

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
        root.Stargate = factory();
    }
}(this, function () {
    // Public interface
    var stargatePackageVersion = "0.5.4";
    var stargatePublic = {};
    
    var stargateModules = {};       
    /* globals cordova, Promise */


/**
 * Utils module
 * @module src/modules/Utils
 * @type {Object}
 */
/* globals ActiveXObject */
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
        this.isstaging = ("IS_STAGING = 1".slice(-1) === "1");

        this.styleString = "background:" + this.styles.background + ";" + "color:" + this.styles.color + ";";
        
        var argsToString = function() {
            if (arguments.length < 1) {
                return "";
            }
            var args = Array.prototype.slice.call(arguments[0]);
            var result = '';
            for (var i=0; i<args.length; i++) {
                if (typeof (args[i]) === 'object') {
                    result += " " + JSON.stringify(args[i]);
                }
                else {
                    result += " " + args[i];
                }
            }
            return result;
        };
        
        var consoleLog = window.console.log.bind(window.console, this.tag, this.styleString);
        var consoleInfo = window.console.info.bind(window.console, this.tag, this.styleString);
        var consoleError = window.console.error.bind(window.console, this.tag, this.styleString);
        var consoleWarn = window.console.warn.bind(window.console, this.tag, this.styleString);
        
        if (!this.isstaging) {
            consoleLog = function(){
                window.console.log("[D] [Stargate] "+argsToString.apply(null, arguments));
            };
            consoleInfo = function(){
                window.console.log("[I] [Stargate] "+argsToString.apply(null, arguments));
            };
            consoleError = function(){
                window.console.log("[E] [Stargate] "+argsToString.apply(null, arguments));
            };
            consoleWarn = function(){
                window.console.log("[W] [Stargate] "+argsToString.apply(null, arguments));
            };
        }
        //private and immutable
        Object.defineProperties(this, {
            "__d": {
                value: consoleLog,
                writable: false,
                enumerable:false,
                configurable:false
            },
            "__i": {
                value: consoleInfo,
                writable: false,
                enumerable:false,
                configurable:false
            },
            "__e": {
                value: consoleError,
                writable: false,
                enumerable:false,
                configurable:false
            },
            "__w": {
                value: consoleWarn,
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
        api = api.split("?")[0].slice(0);
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
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

        var responseTypeAware = 'responseType' in xhr;

        xhr.open("GET", url, true);
        if (responseTypeAware) {
            xhr.responseType = 'json';
        }

        var daRequest = new Promise(function(resolve, reject){
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4) {
                    try{
                        var result = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
                        resolve(result);
                    }catch(e){
                        reject(e);
                    }
                }
            };
        });

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
     * @param {Boolean} options.withCredentials - set with credentials before send
     * @param {Function} [_onProgress=function(){}]
     * @returns {Promise<Blob|ArrayBuffer|Error>}
     */
    function getImageRaw(options, _onProgress){
        var onProgress = _onProgress || function(){};
        return new Promise(function(resolve, reject){
            var request = new XMLHttpRequest();
            request.open ("GET", options.url, true);
            request.responseType = options.responseType || "blob";
            
            if(options.withCredentials){
               request.withCredentials = options.withCredentials; 
            }
                        
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

    /**
     * extend: this function merge two objects in a new one with the properties of both
     *
     * @param {Object} o1 -
     * @param {Object} o2 -
     * @returns {Object} a brand new object results of the merging
     * */
    function extend(o1, o2){

        var isObject = Object.prototype.toString.apply({});
        if((o1.toString() !== isObject) || (o2.toString() !== isObject)) {
            throw new Error("Cannot merge different type");
        }
        var newObject = {};
        for (var k in o1){
            if(o1.hasOwnProperty(k)){
                newObject[k] = o1[k];
            }
        }

        for (var j in o2) {
            if(o2.hasOwnProperty(k)){
                newObject[j] = o2[j];
            }
        }
        return newObject;
    }

    var exp = {
        Iterator:Iterator,
        Logger:Logger,
        composeApiString:composeApiString,
        getJSON:getJSON,
        jsonpRequest:jsonpRequest,
        getImageRaw:getImageRaw,
        extend:extend
    };

    if(stargateModules){
        stargateModules.Utils = exp;
    }else{
        window.Utils = exp;
    }

})(stargateModules);
/**
 * File module
 * @module src/modules/File
 * @type {Object}
 * @see https://github.com/apache/cordova-plugin-file
 * @requires ./Utils.js
 */
(function(_modules, Utils){

    var File = {};
    var LOG = new Utils.Logger("ALL", "[File - module]");
    File.LOG = LOG;
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    /**
     * ERROR_MAP
     * Stargate.file.ERROR_MAP
     * */
    File.ERROR_MAP = {
        1:"NOT_FOUND_ERR",
        2:"SECURITY_ERR",
        3:"ABORT_ERR",
        4:"NOT_READABLE_ERR",
        5:"ENCODING_ERR",
        6:"NO_MODIFICATION_ALLOWED_ERR",
        7:"INVALID_STATE_ERR",
        8:"SYNTAX_ERR",
        9:"INVALID_MODIFICATION_ERR",
        10:"QUOTA_EXCEEDED_ERR",
        11:"TYPE_MISMATCH_ERR",
        12:"PATH_EXISTS_ERR"
    };

    File.currentFileTransfer = null;

    /**
     * File.resolveFS
     *
     * @param {String} url - the path to load see cordova.file.*
     * @returns {Promise<Entry|FileError>}
     * */
    File.resolveFS = function(url){
        return new Promise(function(resolve, reject){
            window.resolveLocalFileSystemURL(url, resolve, reject);
        });
    };

    /**
     * File.appendToFile
     *
     * @param {String} filePath - the filepath file:// url like
     * @param {String|Blob} data - the string to write into the file
     * @param {String} [overwrite=false] - overwrite
     * @param {String} mimeType: text/plain | image/jpeg | image/png
     * @returns {Promise<String|FileError>} where string is a filepath
     */
    File.appendToFile = function(filePath, data, overwrite, mimeType){
        //Default
        overwrite = arguments[2] === undefined ? false : arguments[2];
        mimeType = arguments[3] === undefined ? "text/plain" : arguments[3];
        return File.resolveFS(filePath)
            .then(function(fileEntry){

                return new Promise(function(resolve, reject){
                    fileEntry.createWriter(function(fileWriter) {
                        if(!overwrite){
                            fileWriter.seek(fileWriter.length);
                        }

                        var blob;
                        if(!(data instanceof Blob)){
                            blob = new Blob([data], {type:mimeType});
                        }else{
                            blob = data;
                        }

                        fileWriter.write(blob);
                        fileWriter.onerror = reject;
                        fileWriter.onabort = reject;
                        fileWriter.onwriteend = function(){
                            resolve(__transform([fileEntry]));
                        };
                    }, reject);
                });

            });
    };

    /**
     * File.readFileAsHTML
     * @param {String} indexPath - the path to the file to read
     * @returns {Promise<Document|FileError>}
     */
    File.readFileAsHTML = function(indexPath){

        return File.readFile(indexPath)
            .then(function(documentAsString){
                return new window.DOMParser().parseFromString(documentAsString, "text/html");
            });
    };

    /**
     * File.readFileAsJSON
     * @param {String} indexPath - the path to the file to read
     * @returns {Promise<Object|FileError>}
     */
    File.readFileAsJSON = function(indexPath){
        return File.readFile(indexPath)
            .then(function(documentAsString){
                try{
                    return Promise.resolve(window.JSON.parse(documentAsString));
                }catch(e){
                    return Promise.reject(e);
                }
            });
    };

    /**
     *  File.removeFile
     *
     *  @param {String} filePath - file://
     *  @returns {Promise<String|FileError>}
     * */
    File.removeFile = function(filePath){
        return File.resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve,reject){
                    fileEntry.remove(function(result){
                        resolve(result === null || result === "OK");
                    }, reject);
                });
            });
    };

    /**
     *  File.removeDir
     *
     *  @param {String} dirpath - the directory entry to remove recursively
     *  @returns Promise<void|FileError>
     * */
    File.removeDir = function(dirpath){
        return File.resolveFS(dirpath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.removeRecursively(function(result){
                        resolve(result === null || result === "OK");
                    }, reject);
                });
            });
    };

    /**
     *  File._promiseZip
     *
     *  @private
     *  @param {String} zipPath - the file to unpack
     *  @param {String} outFolder - the folder where to unpack
     *  @param {Function} _onProgress - the callback called with the percentage of unzip progress
     *  @returns Promise<boolean>
     * */
    File._promiseZip = function(zipPath, outFolder, _onProgress){

        LOG.d("PROMISEZIP:", arguments);
        return new Promise(function(resolve,reject){
            window.zip.unzip(zipPath, outFolder, function(result){
                if(result === 0){
                    resolve(true);
                }else{
                    reject(result);
                }
            }, _onProgress);
        });
    };

    /**
     * File.download
     *
     * @param {String} url - the URL of the resource to download
     * @param {String} filepath - a directory entry type object where to save the file
     * @param {String} saveAsName - the name with the resource will be saved
     * @param {Function} _onProgress - a progress callback function filled with the percentage from 0 to 100
     * @returns {Promise}
     * */
    File.download = function(url, filepath, saveAsName, _onProgress){
        var self = this;
        this.ft = new window.FileTransfer();
        this.ft.onprogress = _onProgress;
        File.currentFileTransfer = self.ft;

        self.promise = new Promise(function(resolve, reject){
            self.ft.download(window.encodeURI(url), filepath + saveAsName,
                function(entry){
                    resolve(__transform([entry]));
                    self.ft = null;
                },
                function(reason){
                    reject(reason);
                    self.ft = null;
                },
                true //trustAllHosts
            );
        });
    };

    /**
     * File.createDir
     *
     * @param {String} dirPath - a file:// like path
     * @param {String} subFolderName
     * @returns {Promise<String|FileError>} - return the filepath created
     * */
    File.createDir = function(dirPath, subFolderName){
        return File.resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getDirectory(subFolderName, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    };

    /**
     *  File.fileExists
     *
     *  @param {String} url - the toURL path to check
     *  @returns {Promise<boolean|void>}
     * */
    File.fileExists = function(url){
        return new Promise(function(resolve){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isFile);

            }, function(fileError){
                resolve(fileError.code !== 1);
            });
        });
    };

    /**
     *  File.dirExists
     *
     *  @param {String} url - the toURL path to check
     *  @returns {Promise<boolean|void>}
     * */
    File.dirExists = function(url){
        return new Promise(function(resolve){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isDirectory);

            }, function(fileError){

                resolve(fileError.code != 1);
            });
        });
    };

    /**
     * File.requestFileSystem
     *
     * @param {int} TYPE - 0 == window.LocalFileSystem.TEMPORARY or 1 == window.LocalFileSystem.PERSISTENT
     * @param {int} size - The size in bytes for example 5*1024*1024 == 5MB
     * @returns {Promise}
     * */
    File.requestFileSystem = function(TYPE, size) {
        return new Promise(function (resolve, reject) {
            window.requestFileSystem(TYPE, size, resolve, reject);
        });
    };

    /**
     * File.readDir
     *
     * @param {String} dirPath - a directory path to read
     * @returns {Promise<Array>} - returns an array of Object files
     * */
    File.readDir = function(dirPath){
        return File.resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    var reader = dirEntry.createReader();
                    reader.readEntries(function(entries){
                        LOG.d("readDir:",entries);
                        resolve(__transform(entries));
                    }, reject);
                });
            });
    };

    /**
     * File.readFile
     *
     * @param {String} filePath - the file entry to readAsText
     * @returns {Promise<String|FileError>}
     */
    File.readFile = function(filePath) {

        return File.resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve, reject){
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onerror = reject;
                        reader.onabort = reject;

                        reader.onloadend = function() {
                            var textToParse = this.result;
                            resolve(textToParse);
                        };
                        reader.readAsText(file);
                        //readAsDataURL
                        //readAsBinaryString
                        //readAsArrayBuffer
                    });
                });
            });
    };

    /**
     * File.createFile
     *
     * @param {String} directory - filepath file:// like string
     * @param {String} filename - the filename including the .txt
     * @returns {Promise<FileEntry|FileError>}
     * */
    File.createFile = function(directory, filename){
        return File.resolveFS(directory)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getFile(filename, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    };

    /**
     * write a file in the specified path
     *
     * @param {String} filepath - file:// path-like
     * @param {String|Blob} content
     * @returns {Promise<Object|FileError>}
     * */
    File.write = function(filepath, content){
        return File.appendToFile(filepath, content, true);
    };

    /**
     * moveDir
     *
     * @param {String} source
     * @param {String} destination
     * @returns {Promise<FileEntry|FileError>}
     * */
    File.moveDir = function(source, destination){
        var newFolderName = destination.substring(destination.lastIndexOf('/')+1);
        var parent = destination.replace(newFolderName, "");
        
        LOG.d("moveDir:", parent, newFolderName);
        return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
            .then(function(entries){
                LOG.d("moveDir: resolved entries", entries);
                return new Promise(function(resolve, reject){
                    entries[0].moveTo(entries[1], newFolderName, resolve, reject);
                });
            });
    };

    /**
     * copyFile
     * @param {String} source
     * @param {String} destination
     * @returns {Promise<FileEntry|FileError>}
     * */
    File.copyFile = function(source, destination){
        var newFilename = destination.substring(destination.lastIndexOf('/')+1);
        var parent = destination.replace(newFilename, "");

        return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
            .then(function(entries){
                //TODO: check if are really files
                LOG.d("copyFileTo", entries);
                return new Promise(function(resolve, reject){
                    entries[0].copyTo(entries[1], newFilename, resolve, reject);
                });
            });
    };

    /**
     * copyDir
     * @param {String} source
     * @param {String} destination
     * @returns {Promise<FileEntry|FileError>}
     * */
    File.copyDir = function(source, destination){
        var newFolderName = destination.substring(destination.lastIndexOf('/')+1);
        var parent = destination.replace(newFolderName, "");

        return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
            .then(function(entries){
                LOG.d("copyDir", source, "in",destination);
                return new Promise(function(resolve, reject){
                    entries[0].copyTo(entries[1], newFolderName, resolve, reject);
                });
            });
    };


    /**
     * __transform utils function
     * @private
     * @param {Array} entries - an array of Entry type object
     * @returns {Array.<Object>} - an array of Object
     * */
    function __transform(entries){
        var arr = entries.map(function(entry){
            return {
                fullPath:entry.fullPath,
                path:entry.toURL(),
                internalURL:entry.toInternalURL(),
                isFile:entry.isFile,
                isDirectory:entry.isDirectory
            };
        });
        return (arr.length == 1) ? arr[0] : arr;
    }

    if(_modules){
        _modules.file = File;
    }else{
        window.file = File;
    }

})(stargateModules, stargateModules.Utils);
/**globals Promise, cordova **/
/**
 * Game module needs cordova-plugin-file cordova-plugin-file-transfer
 * @module src/modules/Game
 * @type {Object}
 * @requires ./Utils.js,./File.js
 */
(function(fileModule, Utils, _modules){
    "use strict";

    var Logger = Utils.Logger,
        composeApiString = Utils.composeApiString,
        //Iterator = Utils.Iterator,
        //getJSON = Utils.getJSON,
        jsonpRequest = Utils.jsonpRequest,
        extend = Utils.extend;

    var baseDir,
        cacheDir,
        tempDirectory,
        constants = {},
        wwwDir,
        dataDir,
        stargatejsDir,
        CONF = {
            sdk_url:"",
            dixie_url:"",
            api:"",
            ga_for_game_url:"",
            gamifive_info_api:"",
            bundle_games:[]
        },
        downloading = false;

    var emptyOfflineData = {
        GaForGame: {},
        GamifiveInfo: {},
        queues: {}
    };

    var ga_for_games_qs = {
        print_json_response:1
    };

    var obj = {
        "content_id":"", // to fill
        "formats":"html5applications",
        "sort":"-born_date",
        "category":"b940b384ff0565b06dde433e05dc3c93",
        "publisher":"",
        "size":6,
        "offset":0,
        "label":"",
        "label_slug":"",
        "access_type":"",
        "real_customer_id":"xx_gameasy",
        "lang":"en",
        "use_cs_id":"",
        "white_label":"xx_gameasy",
        "main_domain":"http://www2.gameasy.com/ww",
        "fw":"gameasy",
        "vh":"ww.gameasy.com",
        "check_compatibility_header":0
    };

    var LOG = new Logger("ALL", "[Game - module]", {background:"black",color:"#5aa73a"});

    /**
     * @constructor
     * @alias module:src/modules/Game
     * @example
     *
     * var sgConf = modules: ["game"],
     *     modules_conf: {
     *           "game": {
     *               "bundle_games": [
     *                   "<content_id>",
     *                   "<content_id>"
     *               ]
     *           }
     *       };
     *
     * var afterSgInit = Stargate.initialize(sgConf);
     * afterSgInit
     * .then(function(){
     *      return Stargate.game.download(gameObject, {onStart:function(ev){}, onEnd:function(ev){}, onProgress:function(ev){}})
     * })
     * .then(function(gameID){
     *      Stargate.game.play(gameID);
     * });
     * */
     function Game(){}

    /**
     * Init must be called after the 'deviceready' event
     *
     * @param {Object} customConf - the configuration
     * @param {String} customConf.sdk_url
     * @param {String} customConf.dixie_url
     * @param {String} customConf.api
     * @param {String} customConf.ga_for_game_url
     * @param {String} customConf.gamifive_info_api
     * @param {Array} customConf.bundle_games
     * @returns {Promise<Array<boolean>>}
     * */
     function initialize(customConf){

        if(customConf){
            CONF = extend(CONF, customConf);
        }
        LOG.d("Initialized called with:", CONF);

        if(!fileModule){return Promise.reject("Missing file module!");}

        try{
            baseDir = window.cordova.file.applicationStorageDirectory;
            cacheDir = window.cordova.file.cacheDirectory;
            tempDirectory = window.cordova.file.tempDirectory;
            wwwDir = window.cordova.file.applicationDirectory + "www/";
            stargatejsDir = window.cordova.file.applicationDirectory + "www/js/stargate.js";
            dataDir = window.cordova.file.dataDirectory;
        }catch(reason){
            LOG.e(reason);
            return Promise.reject(reason);
        }


        /**
         * Putting games under Documents r/w. ApplicationStorage is read only
         * on android ApplicationStorage is r/w
         */
        if(window.device.platform.toLowerCase() == "ios"){baseDir += "Documents/";}
        if(window.device.platform.toLowerCase() == "android"){tempDirectory = cacheDir;}

        constants.SDK_DIR = baseDir + "scripts/";
        constants.SDK_RELATIVE_DIR = "../../scripts/";
        constants.GAMEOVER_RELATIVE_DIR = "../../gameover_template/";        
        constants.GAMES_DIR = baseDir + "games/";
        constants.BASE_DIR = baseDir;
        constants.CACHE_DIR = cacheDir;
        constants.TEMP_DIR = tempDirectory;
        constants.CORDOVAJS = wwwDir + "cordova.js";
        constants.CORDOVA_PLUGINS_JS = wwwDir + "cordova_plugins.js";
        constants.STARGATEJS = wwwDir + "js/stargate.js";
        constants.DATA_DIR = dataDir;
        constants.GAMEOVER_DIR = constants.BASE_DIR + "gameover_template/";
        constants.WWW_DIR = wwwDir;

        LOG.i("cordova JS dir to include", constants.CORDOVAJS);

        /** expose */
        _modules.game._public.BASE_DIR = constants.BASE_DIR;
        _modules.game._public.OFFLINE_INDEX = constants.WWW_DIR + "index.html";


        /**
         * Create directories
         * */
        var gamesDirTask = fileModule.createDir(constants.BASE_DIR, "games");
        var scriptsDirTask = fileModule.createDir(constants.BASE_DIR, "scripts");
        var createOfflineDataTask = fileModule.fileExists(constants.BASE_DIR + "offlineData.json")
            .then(function(exists){
                if(!exists){
                    LOG.i("creating offlineData.json");
                    return fileModule.createFile(constants.BASE_DIR, "offlineData.json")
                        .then(function(entry){
                            LOG.d("offlineData", entry);
                            return fileModule.write(entry.path, JSON.stringify(emptyOfflineData));
                        });
                }else{
                    LOG.i("offlineData.json already exists");
                    return exists;
                }
            });

        return Promise.all([
                gamesDirTask,
                scriptsDirTask,
                createOfflineDataTask
            ]).then(function(results){
                LOG.d("GamesDir, ScriptsDir, offlineData.json created", results);
                return copyAssets();
            }).then(getSDK);
    }

    function copyAssets(){
        return Promise.all([
            fileModule.dirExists(constants.BASE_DIR + "gameover_template"),
            fileModule.dirExists(constants.SDK_DIR + "plugins"),
            fileModule.fileExists(constants.SDK_DIR + "cordova.js"),
            fileModule.fileExists(constants.SDK_DIR + "cordova_plugins.js"),
            fileModule.fileExists(constants.SDK_DIR + "stargate.js"),
            fileModule.fileExists(constants.SDK_DIR + "gamesFixes.js")
        ]).then(function(results){
            var all = [];
            if(!results[0]){
                all.push(fileModule.copyDir(constants.WWW_DIR + "gameover_template", constants.BASE_DIR + "gameover_template"));
            }

            if(!results[1]){
                all.push(fileModule.copyDir(constants.WWW_DIR + "plugins", constants.SDK_DIR + "plugins"));
            }

            if(!results[2]){
                all.push(fileModule.copyFile(constants.CORDOVAJS, constants.SDK_DIR + "cordova.js"));
            }

            if(!results[3]){
                all.push(fileModule.copyFile(constants.CORDOVA_PLUGINS_JS, constants.SDK_DIR + "cordova_plugins.js"));
            }

            if(!results[4]){
                all.push(fileModule.copyFile(constants.STARGATEJS, constants.SDK_DIR + "stargate.js"));
            }

            if(!results[5]){
                all.push(fileModule.copyFile(constants.WWW_DIR + "js/gamesFixes.js", constants.SDK_DIR + "gamesFixes.js"));
            }
            return Promise.all(all);
        });
    }

    function getSDK(){

        return Promise.all([
            fileModule.fileExists(constants.SDK_DIR + "dixie.js"),
            fileModule.fileExists(constants.SDK_DIR + "gfsdk.min.js")
        ]).then(function(results){
            var isDixieDownloaded = results[0],
                isSdkDownloaded = results[1],
                tasks = [];
            
            var timestamp = String(Date.now());
            var sdkURLFresh = composeApiString(CONF.sdk_url, {"v":timestamp});
            var dixieURLFresh = composeApiString(CONF.dixie_url, {"v":timestamp,"country":"xx-gameasy"});
            
            // CHECKING VERSION? PLEASE DO IT :(
            if(CONF.sdk_url !== ""){
                LOG.d("isDixieDownloaded", isSdkDownloaded, "get SDK anyway", sdkURLFresh);
                tasks.push(new fileModule.download(sdkURLFresh, constants.SDK_DIR, "gfsdk.min.js").promise);
            }

            if(CONF.dixie_url !== ""){
                LOG.d("isDixieDownloaded", isDixieDownloaded, "get dixie anyway", dixieURLFresh);
                tasks.push(new fileModule.download(dixieURLFresh, constants.SDK_DIR, "dixie.js").promise);
            }
            return Promise.all(tasks);
        });
    }

    /**
     * download the game and unzip it
     *
     * @param {object} gameObject - The gameObject with the url of the html5game's zip
     * @param {object} [callbacks={}] - an object with start-end-progress callbacks
     * @param [callbacks.onProgress=function(){}] - a progress function filled with the percentage
     * @param [callbacks.onStart=function(){}] - called on on start
     * @param [callbacks.onEnd=function(){}] - called when unzipped is done
     * @returns {Promise<boolean|FileError|Number>} - true if all has gone good, 403 if unathorized, FileError in case can write in the folder
     * */
    Game.prototype.download = function(gameObject, callbacks){
        // Clone object for security
        var self = this;
        gameObject = JSON.parse(JSON.stringify(gameObject));
        var err;
        if(this.isDownloading()){
            err = {type:"error",description:"AlreadyDownloading"};
            callbacks.onEnd(err);
            return Promise.reject(err); 
        }
        
        if((!gameObject.hasOwnProperty("response_api_dld")) || gameObject.response_api_dld.status !== 200){
            err = {type:"error",description:"response_api_dld.status not equal 200 or undefined"};
            callbacks.onEnd(err);
            return Promise.reject(err);
        }

        var alreadyExists = this.isGameDownloaded(gameObject.id);
        // Defaults
        callbacks = callbacks ? callbacks : {};
        var _onProgress = callbacks.onProgress ? callbacks.onProgress : function(){};
        var _onStart = callbacks.onStart ? callbacks.onStart : function(){};
        var _onEnd = callbacks.onEnd ? callbacks.onEnd : function(){};

        /**
         * Decorate progress function with percentage and type operation
         */
        function wrapProgress(type){
            return function(progressEvent){
                //LOG.d(progressEvent);
                var percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                _onProgress({percentage:percentage,type:type});
            };
        }       
        
        var currentSize = gameObject.size.replace("KB", "").replace("MB", "").replace(",", ".").trim();
        var conversion = {KB:1, MB:2, GB:3, TB:5};
        // var isKB = gameObject.size.indexOf("KB") > -1 ? true : false;
        var isMB = gameObject.size.indexOf("MB") > -1 ? true : false;
        var bytes = currentSize * Math.pow(1024, isMB ? conversion.MB : conversion.KB);
        
        var saveAsName = gameObject.id;
        function start(){
            _onStart({type:"download"});
            var spaceEnough = fileModule.requestFileSystem(1, bytes);
            LOG.d("Get ga_for_game and gamifive info, fly my minipony!");
            return spaceEnough
                .then(function(result){
                    LOG.i("Space is ok, can download:", bytes, result);
                    return storeOfflineData(saveAsName);
                })
                .then(function(results){
                    LOG.d("Ga for game and gamifive info stored!", results);
                    LOG.d("Start Download:", gameObject.id, gameObject.response_api_dld.binary_url);
                    return new fileModule.download(gameObject.response_api_dld.binary_url, constants.TEMP_DIR, saveAsName + ".zip", wrapProgress("download")).promise;
                })
                .then(function(entry){
                    //Unpack
                    _onStart({type:"unzip"});
                    LOG.d("unzip:", gameObject.id, constants.TEMP_DIR + saveAsName);
                    return fileModule._promiseZip(entry.path, constants.TEMP_DIR + saveAsName, wrapProgress("unzip"));
                })
                .then(function(result){
                    //Notify on end unzip
                    LOG.d("Unzip ended", result);
                    _onEnd({type:"unzip"});

                    /** check levels of folders before index **/
                    var api_dld = gameObject.response_api_dld.url_download;
                    var folders = api_dld.substring(api_dld.lastIndexOf("game"), api_dld.length).split("/");
                    
                    var slashed = api_dld.split("/");
                    var splitted = slashed.slice(slashed.lastIndexOf("game"), slashed.length);

                    folders = [];
                    for(var i = 0; i < splitted.length;i++){
                        // not game and not ends with html
                        if(splitted[i] !== "game" && !isIndexHtml(splitted[i])){
                            folders.push(splitted[i]);
                        }
                    }
                       
                    LOG.d("Folders before index", folders);
                    // prepend the gameId
                    folders.unshift(saveAsName);
                    
                    var src = constants.TEMP_DIR + folders.join("/");
                    LOG.d("Folders on disk", src);

                    LOG.d("Copy game folder in games/", src, constants.GAMES_DIR + saveAsName);                    
                    return fileModule.moveDir(src, constants.GAMES_DIR + saveAsName);                   
                })
                .then(function(result){
                    // Remove the zip in the temp directory
                    LOG.d("Remove zip from:", constants.TEMP_DIR + saveAsName + ".zip", "last operation result", result);
                    return fileModule.removeFile(constants.TEMP_DIR + saveAsName + ".zip");
                })
                .then(function(){
                    //GET COVER IMAGE FOR THE GAME!
                    LOG.d("Save meta.json for:", gameObject.id);
                    var info = {
                        gameId:gameObject.id,
                        size:{width:"240",height:"170",ratio:"1_4"},
                        url:gameObject.images.cover.ratio_1_4,
                        type:"cover",
                        method:"xhr" //!important!
                    };

                    return downloadImage(info);

                })
                .then(function(coverResult){
                    LOG.d("Save meta.json for:", gameObject.id);
                    LOG.d("Download image result", coverResult);

                    /**
                     * Modify gameObject.images.cover.ratio_1_4
                     * it point to the cover image with cdvfile:// protocol
                     * TODO: Build a system for file caching also for webapp
                     * **/
                    gameObject.images.cover.ratio_1_4 = coverResult.internalURL;
                    return fileModule.createFile(constants.GAMES_DIR + saveAsName, "meta.json")
                        .then(function(entry){                            
                            return fileModule.write(entry.path, JSON.stringify(gameObject));
                        });
                })
                .then(function(result){
                    
                    LOG.d("result last operation:save meta.json", result);
                    LOG.d("InjectScripts in game:", gameObject.id, wwwDir);                    
                    return injectScripts(gameObject.id, [
                                constants.SDK_RELATIVE_DIR + "gamesFixes.js",
                                constants.GAMEOVER_RELATIVE_DIR + "gameover.css",
                                constants.SDK_RELATIVE_DIR + "cordova.js",
                                constants.SDK_RELATIVE_DIR + "cordova_plugins.js",
                                constants.SDK_RELATIVE_DIR + "dixie.js",
                                constants.SDK_RELATIVE_DIR + "stargate.js",
                                constants.SDK_RELATIVE_DIR + "gfsdk.min.js"
                            ]);
                }).then(function(results){
                    LOG.d("injectScripts result", results);
                    _onEnd({type:"download"});
                    downloading = false;
                    return gameObject.id;
                }).catch(function(reason){
                    LOG.e(reason, "Cleaning...game not downloaded", gameObject.id);
                    downloading = false;
                    self.remove(gameObject.id);
                    _onEnd({type:"error",description:reason});
                    throw reason;
                });
        }

        return alreadyExists.then(function(exists){
            LOG.d("Exists", exists);
            if(exists){
                downloading = false;
                return Promise.reject({12:"AlreadyExists",gameID:gameObject.id});
            }else{
                downloading = true;
                return start();
            }
        });

    };
    
    /**
     * play
     *
     * @param {String} gameID - the game path in gamesDir where to look for. Note:the game is launched in the same webview
     * @returns {Promise}
     * */
    Game.prototype.play = function(gameID){
        LOG.d("Play", gameID);
        /*
         * TODO: check if games built with Construct2 has orientation issue
         * attach this to orientationchange in the game index.html
         * if(cr._sizeCanvas) window.cr_sizeCanvas(window.innerWidth, window.innerHeight)
         */
        var gamedir = constants.GAMES_DIR + gameID;
        return fileModule.readDir(gamedir)
            .then(function(entries){

                //Search for an /index.html$/
                return entries.filter(function(entry){                    
                    return isIndexHtml(entry.path);
                });
            })
            .then(function(entry){
                LOG.d("Playing this",entry);
                var address = entry[0].internalURL + "?hybrid=1";
                if(window.device.platform.toLowerCase() == "ios"){
                    LOG.d("Play ios", address);
                    window.location.href = address;
                }else{
                    LOG.d("Play android", address);
                    //window.location.href = entry[0].path;
                    window.navigator.app.loadUrl(encodeURI(address));
                }
            });
    };

    /**
     * Returns an Array of entries that match /index\.html$/i should be only one in the game directory
     * @private
     * @param {String} gameID
     * @returns {Promise<Array|FileError>}
     * */
    function _getIndexHtmlById(gameID){
        LOG.d("_getIndexHtmlById", constants.GAMES_DIR + gameID);
        return fileModule.readDir(constants.GAMES_DIR + gameID)
            .then(function(entries){
                LOG.d("_getIndexHtmlById readDir", entries);
                return entries.filter(function(entry){                    
                    return isIndexHtml(entry.path);
                });
            });            
    }

    /**
     * removeRemoteSDK from game's dom
     *
     * @private
     * @param {Document} dom - the document object
     * @returns {Document} the cleaned document element
     * */
    function _removeRemoteSDK(dom){
        LOG.d("_removeRemoteSDK");
        var scripts = dom.querySelectorAll("script");
        var scriptTagSdk;
        for(var i = 0;i < scripts.length;i++){
            if(scripts[i].src.indexOf("gfsdk") !== -1){
                scriptTagSdk = scripts[i];
                LOG.d("_removeRemoteSDK", scriptTagSdk);
                scriptTagSdk.parentNode.removeChild(scriptTagSdk);
                break;
            }
        }
        return dom;
    }

    /**
     * _injectScriptsInDom
     *
     * @private
     * @param {Document} dom - the document where to inject scripts
     * @param {Array|String} sources - the src tag string or array of strings
     * */
    function _injectScriptsInDom(dom, sources){
        dom = _removeRemoteSDK(dom);
        var _sources = Array.isArray(sources) === false ? [sources] : sources;
        var temp, css;
        LOG.d("injectScripts", _sources);
        // Allow scripts to load from local cdvfile protocol
        // default-src * data: cdvfile://* content://* file:///*;
        var metaTag = document.createElement("meta");
        metaTag.httpEquiv = "Content-Security-Policy";
        metaTag.content = "default-src * " +
            "data: " +
            "content: " +
            "cdvfile: " +
            "file: " +
            "http: " +
            "https: " +
            "gap: " +
            "https://ssl.gstatic.com " +
            "'unsafe-inline' " +
            "'unsafe-eval';" +
            "style-src * cdvfile: http: https: 'unsafe-inline';";
        dom.head.insertBefore(metaTag, dom.getElementsByTagName("meta")[0]);

        /**
         *  Create a script element __root__
         *  in case none script in head is present
         * */
        var root = dom.createElement("script");
        root.id = "__root__";
        dom.head.insertBefore(root, dom.head.firstElementChild);

        var scriptFragment = dom.createDocumentFragment();

        for(var i = 0;i < _sources.length;i++){
            if(_sources[i].endsWith(".css")){
                LOG.d("css inject:",_sources[i]);
                css = dom.createElement("link");
                css.rel = "stylesheet";
                css.href = _sources[i];
                dom.head.insertBefore(css, dom.getElementsByTagName("link")[0]);
            }else{
                temp = dom.createElement("script");
                temp.src = _sources[i];
                scriptFragment.appendChild(temp);
                // insertAfter(temp, root);
            }
        }

        dom.head.insertBefore(scriptFragment, dom.head.getElementsByTagName("script")[0]);
        LOG.d("Cleaned dom:",dom);
        return dom;
    }

    function removeOldGmenu(dom){
        var toRemove = [];
        toRemove.push(dom.querySelector("link[href='/gmenu/frame.css']"));
        toRemove.push(dom.querySelector("iframe#menu"));
        toRemove.push(dom.querySelector("script[src='/gmenu/toggle.js']"));
        var scripts = dom.querySelectorAll("script");

        for(var i = scripts.length - 1;i >= 0; i--){
            if(scripts[i].innerHTML.indexOf("function open") !== -1){
                toRemove.push(scripts[i]);
                //scripts[i].parentNode.removeChild(scripts[i]);
                break;
            }
        }

        for(var j = 0; j < toRemove.length;j++){
            if(toRemove[j]){
                toRemove[j].parentNode.removeChild(toRemove[j]);
            }
        }

        return dom;
    }

    /**
     * injectScripts in game index
     *
     * @private
     * @param {String} gameID
     * @param {Array} sources - array of src'string
     * @returns {Promise<Object|FileError>}
     * */
    function injectScripts(gameID, sources){
        var indexPath;
        return _getIndexHtmlById(gameID)
            .then(function(entry){
                indexPath = entry[0].path;
                LOG.d("injectScripts", indexPath);
                return fileModule.readFileAsHTML(entry[0].path);
            })
            .then(function(dom){
                function appendToHead(element){ dom.head.appendChild(element);}

                var metaTags = dom.body.querySelectorAll("meta");
                var linkTags = dom.body.querySelectorAll("link");
                var styleTags = dom.body.querySelectorAll("style");
                var titleTag = dom.body.querySelectorAll("title");

                metaTags = [].slice.call(metaTags);
                linkTags = [].slice.call(linkTags);
                styleTags = [].slice.call(styleTags);
                titleTag = [].slice.call(titleTag);

                var all = metaTags
                    .concat(linkTags)
                    .concat(styleTags)
                    .concat(titleTag);

                all.map(appendToHead);
                dom.body.innerHTML = dom.body.innerHTML.trim();

                LOG.d("_injectScripts");
                LOG.d(dom);
                return _injectScriptsInDom(dom, sources);
            })
            .then(removeOldGmenu)
            .then(function(dom){
                var attrs = [].slice.call(dom.querySelector("html").attributes);
                var htmlAttributesAsString = attrs.map(function(item){
                    return item.name + '=' + '"' + item.value+'"';
                }).join(" ");

                var finalDocAsString = "<!DOCTYPE html><html " + htmlAttributesAsString + ">" + dom.documentElement.innerHTML + "</html>";
                LOG.d("Serialized dom", finalDocAsString);
                return finalDocAsString;
            })
            .then(function(htmlAsString){
                LOG.d("Write dom:", indexPath, htmlAsString);
                return fileModule.write(indexPath, htmlAsString);
            });
    }

    function isIndexHtml(theString){
        var isIndex = new RegExp(/.*\.html?$/i);
        return isIndex.test(theString);
    }

    /**
     * remove the game directory
     *
     * @public
     * @param {String} gameID - the game id to delete on filesystem
     * @returns {Promise<Array>}
     * */
    Game.prototype.remove = function(gameID){
        LOG.d("Removing game", gameID);
        var isCached = fileModule.dirExists(constants.CACHE_DIR + gameID + ".zip");
        var isInGameDir = fileModule.dirExists(constants.GAMES_DIR + gameID);
        return Promise.all([isCached, isInGameDir])
            .then(function(results){
                var finalResults = [];
                if(results[0]){
                    LOG.d("Removed in cache", results[0]);
                    finalResults.push(fileModule.removeFile(constants.CACHE_DIR + gameID + ".zip"));
                }

                if(results[1]){
                    LOG.d("Removed", results[1]);
                    finalResults.push(fileModule.removeDir(constants.GAMES_DIR + gameID));
                }

                if(finalResults.length === 0){
                    LOG.i("Nothing to remove", finalResults);
                }
                return finalResults;
            });
    };

    /**
     * isDownloading
     *
     * @public
     * @returns {boolean}
     * */
    Game.prototype.isDownloading = function(){
        return downloading;
    };

    /**
     * abortDownload
     *
     * @public
     * @returns {boolean}
     * */
    Game.prototype.abortDownload = function(){
        if(this.isDownloading()){
            LOG.d("Abort last download");
            if(fileModule.currentFileTransfer){
                fileModule.currentFileTransfer.abort();
                fileModule.currentFileTransfer = null;
            }

            return true;
        }
        LOG.w("There's not a download operation to abort");
        return false;
    };

    /**
     * list
     *
     * @public
     * @returns {Promise<Array>} - Returns an array of metainfo gameObject
     * */
    Game.prototype.list = function(){
        LOG.d("Get games list");
        return fileModule.readDir(constants.GAMES_DIR)
            .then(function(entries){
                var _entries = Array.isArray(entries) ? entries : [entries];
                return _entries.filter(function(entry){
                    //get the <id> folder. Careful: there's / at the end
                    if(entry.isDirectory){
                        return entry;
                    }
                });
            }).then(function(gameEntries){
                var metajsons = gameEntries.map(function(gameEntry){
                    return fileModule.readFileAsJSON(gameEntry.path + "meta.json");
                });

                return Promise.all(metajsons).then(function(results){
                    return results;
                });
            });
    };
    
    /**
     * buildGameOver
     * 
     * @param {Object} datas - the data score, start, duration
     * @param datas.score
     * @param datas.start
     * @param datas.duration
     * @param datas.content_id
     * @returns {Promise} - The promise will be filled with the gameover html {String}     
     */
    Game.prototype.buildGameOver = function(datas){                 
        var metaJsonPath = constants.GAMES_DIR + datas.content_id + "/meta.json";
        /** Check if content_id is here */
        if(!datas.hasOwnProperty("content_id")){ return Promise.reject("Missing content_id key!");}
        
        LOG.d("Read meta.json:", metaJsonPath);
        LOG.d("GAMEOVER_TEMPLATE path", constants.GAMEOVER_DIR + "gameover.html");
        /***
         * if needed
         * return new window.DOMParser().parseFromString(documentAsString, "text/xml").firstChild
         * **/
        return Promise.all([
            fileModule.readFileAsJSON(metaJsonPath),
            fileModule.readFile(constants.GAMEOVER_DIR + "gameover.html")
        ]).then(function(results){
                var htmlString = results[1];
                var metaJson = results[0];
                LOG.i("Meta JSON:", metaJson);
                return htmlString
                    .replace("{{score}}", datas.score)
                    .replace("{{url_share}}", metaJson.url_share)
                    .replace("{{url_cover}}", metaJson.images.cover.ratio_1_4)
                    .replace("{{startpage_url}}", constants.WWW_DIR + "index.html");
        });
    };

    /**
     * isGameDownloaded
     *
     * @param {String} gameID - the id of the game
     * @returns {Promise}
     * */
    Game.prototype.isGameDownloaded = function(gameID){
        return fileModule.dirExists(constants.GAMES_DIR + gameID);
    };

    /**
     * removeAll delete all games and recreate the games folder
     *
     * @returns {Promise}
     * */
    Game.prototype.removeAll = function(){
        return fileModule.removeDir(constants.GAMES_DIR)
            .then(function(result){
                LOG.d("All games deleted!", result);
                return fileModule.createDir(constants.BASE_DIR, "games");
            });
    };

    /**
     * downloadImage
     * Save the image in games/<gameId>/images/<type>/<size.width>x<size.height>.png
     *
     * @param {String} info -
     * @param {String} info.gameId -
     * @param {Object} info.size -
     * @param {String|Number} info.size.width -
     * @param {String|Number} info.size.height -
     * @param {String|Number} info.size.ratio - 1|2|1_5|1_4
     * @param {String} info.url - the url with the [HSIZE] and [WSIZE] in it
     * @param {String} info.type - possible values cover|screenshot|icon
     * @param {String} info.method - possible values "xhr"
     * @returns {Promise<String|FileTransferError>} where string is the cdvfile:// path
     * */
    function downloadImage(info){
        /* info = {
            gameId:"",
            size:{width:"",height:"",ratio:""},
            url:"",
            type:"cover",
            method:"xhr"
        };*/

        //GET COVER IMAGE FOR THE GAME!
        var toDld = info.url
            .replace("[WSIZE]", info.size.width)
            .replace("[HSIZE]", info.size.height)
            .split("?")[0];

        //toDld = "http://lorempixel.com/g/"+info.size.width+"/"+info.size.height+"/";
        //toDld = encodeURI(toDld);

        var gameFolder = constants.GAMES_DIR + info.gameId;
        // var imagesFolder = gameFolder + "/images/" + info.type + "/";
        var imageName = info.type + "_" + info.size.width + "x" + info.size.height + ("_"+info.size.ratio || "") + ".jpeg";
        LOG.d("request Image to", toDld, "coverImageUrl", imageName, "imagesFolder", gameFolder);
        if(info.method === "xhr"){
            return Promise.all([
                    fileModule.createFile(gameFolder, imageName),
                    Utils.getImageRaw({url:toDld})
                ]).then(function(results){
                    var entry = results[0];
                    var blob = results[1];

                    return fileModule.appendToFile(entry.path, blob, true, "image/jpeg");
                });
        }else{
            return new fileModule.download(toDld, gameFolder, imageName, function(){}).promise;
        }
    }

    /**
     * getBundleObjects
     *
     * make the jsonpRequests to get the gameObjects.
     * This method is called only if configuration key "bundle_games" is set with an array of gameIDs
     *
     * @returns {Promise<Array>} the gameObject with response_api_dld key
     * */
    Game.prototype.getBundleGameObjects = function(){
        var self = this;
        if(CONF.bundle_games.length > 0){
            LOG.d("Games bundle in configuration", CONF.bundle_games);
            var whichGameAlreadyHere = CONF.bundle_games.map(function(gameId){
                return self.isGameDownloaded(gameId);
            });

            var filteredToDownload = Promise.all(whichGameAlreadyHere)
                .then(function(results){
                    LOG.d("alreadyDownloaded",results);
                    for(var i = 0;i < results.length;i++){
                        if(results[i]) CONF.bundle_games.splice(i, 1);
                    }
                    return CONF.bundle_games;
                })
                .then(function(bundlesGamesIds){
                    return bundlesGamesIds.join(",");
                });

            var tmpBundleGameObjects;
            return filteredToDownload
                .then(function(bundleGamesIds){

                    obj.content_id = bundleGamesIds;
                    var api_string = composeApiString(CONF.api, obj);
                    LOG.d("Request bundle games meta info:", api_string);

                    return new jsonpRequest(api_string).prom;
                }).then(function(bundleGameObjects){
                    LOG.d("Games bundle response:", bundleGameObjects);
                    tmpBundleGameObjects = bundleGameObjects;
                    var jsonpRequests = bundleGameObjects.map(function(item){
                        return new jsonpRequest(item.url_api_dld).prom;
                    });
                    LOG.d("jsonpRequests",jsonpRequests);
                    return Promise.all(jsonpRequests);
                })
                .then(function(results){
                    LOG.d("RESULTS", results);

                    //extend with the response object
                    for(var i = 0;i < results.length;i++){
                        tmpBundleGameObjects[i].response_api_dld =  results[i];
                    }

                    LOG.d("GameObjects", tmpBundleGameObjects);
                    return tmpBundleGameObjects;
                })
                .catch(function(reason){
                    LOG.e("Games bundle meta fail:", reason);
                });
        }else{
            LOG.w("Bundle_games array is empty!");
            return Promise.reject("bundle_games array is empty!");
        }
    };

    /**
     * needsUpdate
     * checks if there's or not a new version for the game(it makes a call to the api)
     *
     * @param {String} gameId - the gameId
     * @param {Promise<Boolean>}
     * */
    Game.prototype.needsUpdate = function(gameId){
        var oldMd5 = "";
        return fileModule.readFileAsJSON(constants.GAMES_DIR + gameId + "/meta.json")
            .then(function(gameObject){
                oldMd5 = gameObject.response_api_dld.binary_md5;
                return Utils.getJSON(gameObject.url_api_dld);
            })
            .then(function(response){
                if(response.status === 200){
                    return response.binary_md5 !== oldMd5;
                }else{
                    throw new Error("ResponseStatus " + response.status);
                }
            });
    };

    function readUserJson(){
        LOG.i("readUserJson", constants.BASE_DIR + "user.json");
        return fileModule.readFileAsJSON(constants.BASE_DIR + "user.json");
    }

    function storeOfflineData(content_id){
        /**
         * Calls for offlineData.json
         * putting GamifiveInfo and GaForGame in this file for each game
         * {
         *  GaForGame:<content_id>:{<ga_for_game>},
         *  GamifiveInfo:<content_id>:{<gamifive_info>},
         *  queues:{}
         * }
         * */
        var apiGaForGames = composeApiString(CONF.ga_for_game_url, ga_for_games_qs);
        var getGaForGamesTask = new jsonpRequest(apiGaForGames).prom;
        
        var tasks = Promise.all([getGaForGamesTask, readUserJson()]);

        return tasks.then(function(results){
            var ga_for_game = results[0];
            var userJson = results[1];

            if(!userJson.ponyUrl){
                LOG.w("ponyUrl in user check undefined!", userJson.ponyUrl);
                throw new Error("Not premium user");
            }

            var _PONYVALUE = userJson.ponyUrl.split("&_PONY=")[1];
            LOG.d("PONYVALUE", _PONYVALUE);
            LOG.d("apiGaForGames:", apiGaForGames, "ga_for_game:", ga_for_game);
            
            var gamifive_api = composeApiString(CONF.gamifive_info_api, {
                content_id:content_id,                
                format:"jsonp"
            });

            gamifive_api += userJson.ponyUrl;

            LOG.d("gamifive_info_api", gamifive_api);
            return [new jsonpRequest(gamifive_api).prom, ga_for_game];

        }).then(function(results){
            return results[0].then(function(gamifive_info){
                LOG.d("gamifiveInfo:", gamifive_info, "ga_for_game", results[1]);
                return updateOfflineData({content_id:content_id, ga_for_game:results[1], gamifive_info:gamifive_info.game_info});
            });
        });
    }

    function updateOfflineData(object){
        return fileModule.readFileAsJSON(constants.BASE_DIR + "offlineData.json")
            .then(function(offlineData){
                offlineData.GaForGame[object.content_id] = object.ga_for_game;
                offlineData.GamifiveInfo[object.content_id] = object.gamifive_info;
                return offlineData;
            })
            .then(function(offlineDataUpdated){
                LOG.d("writing offlineData.json", offlineDataUpdated);
                return fileModule.write(constants.BASE_DIR + "offlineData.json", JSON.stringify(offlineDataUpdated));
            });
    }
    
    var _protected = {};
    _modules.game = {};

    _protected.initialize = initialize;
    _modules.game._protected = _protected;
    _modules.game._public = new Game();

})(stargateModules.file, stargateModules.Utils, stargateModules);
/**
 * Decoratos module
 * @module src/modules/Decorators
 * @type {Object} 
 */
(function(_modules){
    
    /**
     * Decorator function: 
     * @private
     * @param {Boolean|Function} param - the require param or function. the function should return a boolean 
     * @param {Function} fn - the function to decorate     
     * @param {Object} [context=null] - the optional this-context. default to null
     * @param {String} [message="NoMessage"]
     * @param {String} [type="warn"]
     * @returns {Function} 
     */
    function requireCondition(param, afterFunction, context, message, type){ 
        return function(){
            if(typeof param === "function"){
                param = param.call(null);
            }
            if(param){
                return afterFunction.apply(context || null, arguments); 
            } else {
                message = message || "NoMessage";
                switch(type){
                    case "warn":
                        console.warn(message);
                        break;
                    case "error":
                        console.error(message);
                        break;
                    case "info":
                        console.info(message);
                        break;
                    default:
                        console.log(message);
                }                
            }
        };
    }    
    
    _modules.Decorators = {
        requireCondition:requireCondition
    };
    
})(stargateModules);

/**
 * AdManager module needs https://github.com/appfeel/admob-google-cordova
 * @module src/modules/AdManager
 * @type {Object}
 * @requires ./Utils.js,./Decorators.js
 */
(function(Utils, Decorators, _modules){

    var admobid = {};

    if(/(android)/i.test(navigator.userAgent) ) {
        admobid = { // for Android
            banner: 'ca-app-pub-6869992474017983/9375997553',
            interstitial: 'ca-app-pub-6869992474017983/1657046752'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
        admobid = { // for iOS
            banner: 'ca-app-pub-6869992474017983/4806197152',
            interstitial: 'ca-app-pub-6869992474017983/7563979554'
        };
    } else {
        admobid = { // for Windows Phone
            banner: 'ca-app-pub-6869992474017983/8878394753',
            interstitial: 'ca-app-pub-6869992474017983/1355127956'
        };
    }

    function AdManager(){
        this.LOG = new Utils.Logger("OFF", "ADMANAGER");
    }
    
    var platform;    
    var supportedPlatform = ["ios","android"];
    function checkSupport(arr, val) {
        return arr.some(function(arrVal){ return val === arrVal;});
    }
    
    AdManager.prototype.initialize = function(options){
        platform = window.device.platform.toLowerCase();
        
        if(checkSupport(supportedPlatform, platform)){
            this.AD_TYPE = window.admob.AD_TYPE;
            this.AD_SIZE = window.admob.AD_SIZE;
            this.LOG = new Utils.Logger("all","[AdManager]");
            this.LOG.i("initialize admob with", platform, options[platform]);
            this.setOptions(options[platform]);
            return Promise.resolve("OK");           
        } else {
            return Promise.reject([platform, "Unsupported"].join(" "));
        }        
    };
    
    AdManager.prototype.createBanner = function(options){
        this.LOG.i("createBanner");
        var self = this;
        options = Utils.extend(self.options, options || {});
        return new Promise(function(resolve, reject){
            window.admob.createBannerView(options, resolve, reject);
        });
    };
    
    AdManager.prototype.removeBanner = function(){
        window.admob.destroyBannerView();
        return Promise.resolve("OK");
    };
    
    AdManager.prototype.showBanner = function(){
        return new Promise(function(resolve, reject){
            window.admob.showBannerAd(true, resolve, reject);
        });
    };
    
    AdManager.prototype.showBannerAtGivenXY = function(){this.LOG.d("NotImplemented");};
    AdManager.prototype.showBannerAtSelectedPosition = function(){this.LOG.d("NotImplemented");};
    
    AdManager.prototype.hideBanner = function(){        
        return new Promise(function(resolve, reject){
            window.admob.showBannerAd(false, resolve, reject);
        });        
    };
    
    AdManager.prototype.prepareInterstitial = function(options){
        var self = this;
        return new Promise(function(resolve, reject){
            window.admob.requestInterstitialAd(Utils.extend(self.options, options || {}), resolve, reject);                        
        });
    };
    
    AdManager.prototype.showInterstitial = function(){
        return new Promise(function(resolve, reject){
            window.admob.showInterstitialAd(resolve, reject);
        });
    };
    
    AdManager.prototype.registerAdEvents = function(eventManager){
        this.LOG.d("NotImplemented", eventManager);
    };
    
    AdManager.prototype.setOptions = function(options){
        this.options = options || {};
        window.admob.setOptions(options || {});
    };

    function isCordovaPluginDefined(){
        return window.admob !== "undefined";
    }
    
    // unwrap it as soon as implemented
    for(var method in AdManager.prototype){
        if(AdManager.prototype.hasOwnProperty(method)){
            AdManager.prototype[method] = Decorators.requireCondition(isCordovaPluginDefined, 
                                AdManager.prototype[method], 
                                AdManager.prototype, 
                                "try cordova plugin add cordova-admob:plugin not installed", 
                                "warn");
        }
    }
    
    _modules.AdManager = new AdManager();

})(stargateModules.Utils, stargateModules.Decorators, stargateModules);

var webappsFixes = (function() {


	var waf = {};
	var enabled = false;

	waf.init = function() {
		if (stargateConf.hasOwnProperty('webappsfixes') && 
			typeof stargateConf.webappsfixes === 'object') {

			enabled = true;

			// execute all fixes found in conf
			for (var fixName in stargateConf.webappsfixes) {
				if (stargateConf.webappsfixes.hasOwnProperty(fixName)) {
					

					if (fixes.hasOwnProperty(fixName) && typeof fixes[fixName] === 'function') {

						log("[webappsFixes] applying fix: "+fixName);
						
						var error = fixes[fixName](stargateConf.webappsfixes[fixName]);

						if (error) {
							err("[webappsFixes] fix '"+fixName+"' failed: "+error);
						}
					}
					else {
						err("[webappsFixes] fix implementation not found for: "+fixName);
					}
				}
			}

		}

		return enabled;
	};

	// fixes function must return an empty string when result is ok and
	//  a string describing the error when there is one error
	var fixes = {};
	fixes.gamifiveSearchBox = function(conf) {
		// 

		if (! window.cordova || ! window.cordova.plugins || ! window.cordova.plugins.Keyboard) {
			return "missing ionic-plugin-keyboard";
		}

		if (conf.platforms) {
			if (isRunningOnIos() && ! conf.platforms.ios) {
				log('[webappsFixes] [gamifiveSearchBox] fix disabled on iOS');
                return;
			}
			if (isRunningOnAndroid() && ! conf.platforms.android) {
				log('[webappsFixes] [gamifiveSearchBox] fix disabled on Android');
				return;
			}
		}

		window.addEventListener(
			'native.keyboardshow',
			function(){
				setTimeout(function() {
					if (document.querySelectorAll('input:focus').length === 0) {
						log('[webappsFixes] [gamifiveSearchBox] keyboard show on null input: hiding');
						
						cordova.plugins.Keyboard.close();
					}
				},
				1);
			},
			false
		);

		log('[webappsFixes] [gamifiveSearchBox] listening on event native.keyboardshow');


		return '';
	};

	//window.addEventListener('native.keyboardshow', function(){ console.log('keyboardshow start'); if($(':focus')===null){console.log('keyboard show on null input, hiding');cordova.plugins.Keyboard.close()} console.log('keyboardshow finish') }, false)

	return waf;
})();


stargateModules.statusbar = (function(){

    var sbProtected = {};
    
    sbProtected.initialize = function(initializeConf) {
        if (typeof window.StatusBar === "undefined") {
            // missing cordova plugin
            return err("[StatusBar] missing cordova plugin");
        }
        
        
        if (!initializeConf ||
            initializeConf.constructor !== Object ||
            Object.keys(initializeConf).length === 0) {
                
            if (stargateConf.statusbar) {
                initializeConf = stargateConf.statusbar;
            } else {
                return;
            }
        }
        
        if (typeof initializeConf.hideOnUrlPattern !== "undefined" && 
            initializeConf.hideOnUrlPattern.constructor === Array) {

            var currentLocation = document.location.href;
            var hide = false;

            for (var i=0; i<initializeConf.hideOnUrlPattern.length; i++) {

                var re = new RegExp(initializeConf.hideOnUrlPattern[i]);
                
                if (re.test(currentLocation)) {
                    hide = true;
                    break;
                }
            }
            
            
            if (hide) {
                window.StatusBar.hide();
            }
            else {
                window.StatusBar.show();
            }
        }
        
        if (initializeConf.color) {
            //log("color: "+initializeConf.color);
            window.StatusBar.backgroundColorByHexString(initializeConf.color);
        }
    };
    
    sbProtected.setVisibility = function(visibility, callbackSuccess, callbackError) {
        if (typeof window.StatusBar === "undefined") {
            // missing cordova plugin
            err("[StatusBar] missing cordova plugin");
            return callbackError("missing cordova plugin");
        }

        if (visibility) {
            window.StatusBar.show();
            return callbackSuccess("statusbar shown");
        }

        window.StatusBar.hide();
        return callbackSuccess("statusbar hided");
    };
    
    return sbProtected;
})();


stargatePublic.setStatusbarVisibility = function(visibility, callbackSuccess, callbackError) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    return stargateModules.statusbar.setVisibility(visibility, callbackSuccess, callbackError);
};

// global variable used by old stargate client
// @deprecated since v0.1.2
window.pubKey = '';
// @deprecated since v0.1.2
window.forge = '';


var initOfflinePromise;

/**
 * Initialize offline will be resolved at the deviceready event or rejected after a timeout
 * @param {object} [options={}] - an object with offline initialization options
 * @param [options.hideSplashScreen=true] - a boolean indicating to hide or not the splash screen
 * @returns {Promise<boolean>}
 * 
 * @deprecated since v0.2.8
 * */
stargatePublic.initializeOffline = function(options){

    if(initOfflinePromise) {
        return initOfflinePromise;
    }
    
    // - start set default options -
    if (typeof options !== "object") {
        options = {};
    }
    if (! options.hasOwnProperty("hideSplashScreen")) {
        options.hideSplashScreen = true;
    }
    // -- end set default options --
    
    isStargateInitialized = true;
    initOfflinePromise = new Promise(function (initOfflineResolve) {
        document.addEventListener("deviceready", function deviceReadyOffline() {

            // device ready received so i'm sure to be hybrid
            setIsHybrid();
            
            // get device information
            initDevice();
            
            // get connection information
            initializeConnectionStatus();

            // request all asyncronous initialization to complete
            Promise.all([
                // include here all needed asyncronous initializazion
                cordova.getAppVersion.getVersionNumber(),
                getManifest()
            ])
            .then(function(results) {
                // save async initialization result

                appVersion = results[0];
                
                if (typeof results[1] !== 'object') {
                    results[1] = JSON.parse(results[1]);
                }

                stargateConf = results[1].stargateConf;
                
                if (options.hideSplashScreen) {
                    navigator.splashscreen.hide();
                    setBusy(false);                    
                }

                // initialize finished
                isStargateOpen = true;

                log("Stargate.initializeOffline() done");

                initOfflineResolve(true);

            })
            .catch(function (error) {
                err("initializeOffline() error: "+error);
            });
        });
    });
    return initOfflinePromise;
};


/**
 * Stargate application configuration getters namespace
 */
stargatePublic.conf = {};

/**
 * Get url of webapp starting page when hybrid 
 * @returns {String}
 */
stargatePublic.conf.getWebappStartUrl = function() {
    if (!isStargateInitialized) {
        return err("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        return err("Stargate closed, wait for Stargate.initialize to complete!");
    }
    
    var webappStartUrl = URI(stargateConf.webapp_start_url)
        .addSearch("hybrid", "1")
        .addSearch("stargateVersion", getStargateVersionToLoad());
    
    return String(webappStartUrl);
};

var getStargateVersionToLoad = function() {
    if (stargateConf.stargate_version_to_load) {
        return stargateConf.stargate_version_to_load;
    }
    
    war("getStargateVersionToLoad() stargate_version_to_load must be set on manifest!");
    // return deprecated value
    return stargateVersion;
};

/**
 * Get webapp url origin
 * @returns {String}
 */
stargatePublic.conf.getWebappOrigin = function() {
    var re = /http:\/\/[\w]{3,4}\..*\.[\w]{2,}/;
    if(typeof stargateConf.webapp_start_url === "undefined"){
        log("Stargate is initialized? Please call this method after it");
        return "";
    }else{
        return re.exec(stargateConf.webapp_start_url)[0];
    }
};

var initializePromise;

/**
* 
* initialize(configurations, callback)
* @param {object} [configurations={}] - an object with configurations
* @param @deprecated [configurations.country=undefined] - MFP country @deprecated since 0.2.3
* @param @deprecated [configurations.hybrid_conf={}] - old configuration of modules, used by IAP @deprecated since 0.2.3 
* @param [configurations.modules=["mfp","iapbase","appsflyer"]] - array with one or more of: "mfp","iapbase","iap","appsflyer","game"
* @param [configurations.modules_conf={}] - an object with configurations for modules
* @param {Function} [callback=function(){}] - callback success
* @returns {Promise<boolean>} - true if we're running inside hybrid
*
* @deprecated initialize(configurations, pubKey, forge, callback)
*/
stargatePublic.initialize = function(configurations, pubKeyPar, forgePar, callback) {

    // parameters checking to support both interfaces:
    //    initialize(configurations, callback)
    //    initialize(configurations, pubKey, forge, callback)
    if (typeof pubKeyPar === 'function' &&
        typeof forgePar === 'undefined' &&
        typeof callback === 'undefined') {
        // second parameter is the callback
        callback = pubKeyPar;
    }

    if(typeof callback === 'undefined'){
        log("Callback success not setted. \n You can use 'then'");
        callback = function(){};
    }
    // check callback type is function
    // if not return a failing promise 
    if (typeof callback !== 'function') {
        war("Stargate.initialize() callback is not a function!");
        return Promise.reject(new Error("Stargate.initialize() callback is not a function!"));
    }

    isStargateRunningInsideHybrid = isHybridEnvironment();

    // if i'm already initialized just:
    //  * execute the callback
    //  * return a resolving promise
    if (isStargateInitialized) {
        war("Stargate.initialize() already called, executing callback.");
        
        if(callback){callback(isStargateRunningInsideHybrid);}

        return initializePromise;
    }
    
    if (typeof configurations !== 'object') {
        configurations = {};
    }
    
    // old configuration mechanism, used by IAP
    if(configurations.hybrid_conf){
        if (typeof configurations.hybrid_conf === 'object') {
            hybrid_conf = configurations.hybrid_conf;
        } else {
            hybrid_conf = JSON.parse(decodeURIComponent(configurations.hybrid_conf));
        }
    }
    
    if(configurations.modules){
        // save modules requested by caller,
        // initialization will be done oly for these modules
        
        // check type
        if (configurations.modules.constructor !== Array) {
            err("initialize() configurations.modules is not an array");
        }
        else {
            requested_modules = configurations.modules;
        }
    } else {
        // default modules
        requested_modules = ["mfp","iapbase","appsflyer","game"];
    }
    if(configurations.modules_conf){
        // check type
        if (typeof configurations.modules_conf !== 'object') {
            err("initialize() configurations.modules_conf is not an object");
        }
        else {
            modules_conf = configurations.modules_conf;
        }
    }
    
    // old configuration mechanism, used by MFP module
    if(configurations.country) {
        // overwrite conf
        if ("mfp" in hybrid_conf) {
            hybrid_conf.mfp.country = configurations.country;        
        }
        // define conf
        else {
            hybrid_conf.mfp = {
                "country": configurations.country
            }; 
        }
    }

    // if not running inside hybrid save the configuration then:
    //  * call the callback and return a resolving promise
    if (!isStargateRunningInsideHybrid) {

        log("version "+stargatePackageVersion+" running outside hybrid ");

        if(callback){callback(isStargateRunningInsideHybrid);}
        
        initializePromise = Promise.resolve(isStargateRunningInsideHybrid);
        isStargateInitialized = true;
        return initializePromise; 
    }

    log("initialize() starting up, configuration: ",hybrid_conf);

    initializeCallback = callback;
    
    initializePromise = new Promise(function(resolve,reject){
        
        var deviceReadyHandler = function() {
            onDeviceReady(resolve, reject);
            document.removeEventListener("deviceready",deviceReadyHandler, false);
        };
        
        // finish the initialization of cordova plugin when deviceReady is received
        document.addEventListener('deviceready', deviceReadyHandler, false);
    });
    
    isStargateInitialized = true;
    
    return initializePromise;
};

stargatePublic.isInitialized = function() {
    return isStargateInitialized;
};

stargatePublic.isOpen = function() {
    return isStargateOpen;
};

stargatePublic.isHybrid = function() {
    return isHybridEnvironment();
};

stargatePublic.openUrl = function(url) {

	if (!isStargateInitialized) {
		return err("Stargate not initialized, call Stargate.initialize first!");
    }
    // FIXME: check that inappbrowser plugin is installed otherwise return error

    window.open(url, "_system");
};

stargatePublic.googleLogin = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    // FIXME: implement it; get code from old stargate

    err("unimplemented");
    callbackError("unimplemented");
};

var connectionStatus = {
    type: "unknown",
    networkState: "unknown"
};

var onConnectionChange;
/**
 * Stargate.addListener
 * @param {String} type - possible values: "connectionchange"
 * @param {Function} _onConnectionChange
 * **/
stargatePublic.addListener = function(type, _onConnectionChange){
    //if not already registered
    if(type == "connectionchange" && (typeof _onConnectionChange === "function")){
        log("onConnectionChange registered");
        onConnectionChange = _onConnectionChange;
    }
};

function updateConnectionStatus(theEvent){
    connectionStatus.type = theEvent.type;
    connectionStatus.networkState = navigator.connection.type;
    if(typeof onConnectionChange === "function"){onConnectionChange(connectionStatus);}
}

function bindConnectionEvents(){
    document.addEventListener("offline", updateConnectionStatus, false);
    document.addEventListener("online", updateConnectionStatus, false);
}

function initializeConnectionStatus() {
    connectionStatus.networkState = navigator.connection.type;
    
    if (navigator.connection.type === "none") {
        connectionStatus.type = "offline";
    } else {
        connectionStatus.type = "online";        
    }
}

/**
 * checkConnection function returns the updated state of the client connection
 * @param {Function} [callbackSuccess=function(){}] - callback success filled with: {type:"online|offline",networkState:"wifi|3g|4g|none"}
 * @param {Function} [callbackError=function(){}] - called if stargate is not initialize or cordova plugin missing
 * @returns {Object|boolean} connection info {type:"online|offline",networkState:"wifi|3g|4g|none"}
 * */
stargatePublic.checkConnection = function() {

    var callbackSuccess = arguments.length <= 0 || arguments[0] === undefined ? function(){} : arguments[0];
    var callbackError = arguments.length <= 1 || arguments[1] === undefined ? function(){} : arguments[1];

	if (!isStargateInitialized) {
		callbackError("Stargate not initialized, call Stargate.initialize first!");
        return false;
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    if(typeof navigator.connection === "undefined" ||
        typeof navigator.connection.getInfo !== "function"){
            
        callbackError("Missing cordova plugin");
        console.warn("Cordova Network Information module missing");
        return false;
    }

    callbackSuccess(connectionStatus);
    return connectionStatus;
};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    // FIXME: check that device plugin is installed
    // FIXME: integrate with other stargate device handling method

    var deviceID = runningDevice.uuid;
    callbackSuccess({'deviceID': deviceID});
};

/**
 * loadUrl
 * @protected
 * @param {String} url - an uri string
 * */
function loadUrl(url){

    if(window.device.platform.toLowerCase() == "android"){
        window.navigator.app.loadUrl(url);
    }else if(window.device.platform.toLowerCase() == "ios" && (url.indexOf("file:///") !== -1)){
        //ios and url is a file:// protocol
        var _url = url.split("?")[0];
        log("Without qs", _url);
        window.resolveLocalFileSystemURL(_url, function(entry){
            var internalUrl = entry.toInternalURL() + "?hybrid=1";
            log("Redirect to", internalUrl);
            window.location.href = internalUrl;
        }, err);
    }else{
        window.location.href = url;
    }
}

/**
 * goToLocalIndex
 * redirect the webview to the local index.html
 * */
stargatePublic.goToLocalIndex = function(){
    if(window.cordova.file.applicationDirectory !== "undefined"){
        var qs = "?hybrid=1";
        var LOCAL_INDEX = window.cordova.file.applicationDirectory + "www/index.html";
        loadUrl(LOCAL_INDEX + qs);
    }else{
        err("Missing cordova-plugin-file. Install it with: cordova plugin add cordova-plugin-file");
    }
};

/**
 * goToWebIndex
 * redirect the webview to the online webapp
 * */
stargatePublic.goToWebIndex = function(){
    var webUrl = stargatePublic.conf.getWebappStartUrl() + "";
    log("Redirect to", webUrl);
    loadUrl(webUrl);
};

stargatePublic.getVersion = function() {
    return stargatePackageVersion;
};

/**
 * @return {object} application information;
 * 
 * this information are available only after initialize complete
 * 
 * object keys returned and meaning
 * 
 *  cordova: Cordova version,
 *  manufacturer: device manufacter,
 *  model: device model,
 *  platform: platform (Android, iOs, etc),
 *  deviceId: device id or UUID,
 *  version: platform version,
 *  packageVersion: package version,
 *  packageName: package name ie: com.stargatejs.test,
 *  packageBuild: package build number,
 *  stargate: stargate version,
 *  stargateModules: stargate modules initialized,
 *  stargateError: stargate initialization error 
 * 
 */
stargatePublic.getAppInformation = function() {
    return appInformation;
};
/* globals SpinnerDialog */

/***
* 
* 
* 
*/

// current stargateVersion used by webapp to understand
//  the version to load based on cookie or localstorage
// @deprecated since 0.2.2
var stargateVersion = "2";

var is_staging = ("IS_STAGING = 1".slice(-1) === "1");


var argsToString = function() {
    var args = Array.prototype.slice.call(arguments);
    var result = '';
    for (var i=0; i<args.length; i++) {
        if (typeof (args[i]) === 'object') {
            result += " " + JSON.stringify(args[i]);
        }
        else {
            result += " " + args[i];
        }
    }
    return result;
};

// logger function
var log = console.log.bind(window.console, "[Stargate] ");
var err = console.error.bind(window.console, "[Stargate] ");
var war = console.warn.bind(window.console, "[Stargate] ");
if (!is_staging) {
    log = function(){
        console.log("[I] [Stargate] "+argsToString.apply(null, arguments));
    };
    err = function(){
        console.log("[E] [Stargate] "+argsToString.apply(null, arguments));
    };
    war = function(){
        console.log("[W] [Stargate] "+argsToString.apply(null, arguments));
    };
}


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
// - not used, enable if needed -
//var isRunningOnCordova = function () {
//    return (typeof window.cordova !== "undefined");
//};
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

function getAppIsDebug() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.AppIsDebug) {
        return new Promise(function(resolve,reject){
            window.cordova.plugins.AppIsDebug.get(
                function(appinfo){
                    resolve(appinfo);
                },
                function(error){
                    err("getAppIsDebug(): "+error, error);
                    reject(new Error(error));
                }
            );
        });
    }
    
    err("getAppIsDebug(): plugin not available!");
    return Promise.resolve({});
}

function getManifest() {
    
    if (window.cordova.file) {
        return stargateModules.file.readFileAsJSON(window.cordova.file.applicationDirectory + "www/manifest.json");
    }
    
    if (window.hostedwebapp) {
        return new Promise(function(resolve,reject){
            window.hostedwebapp.getManifest(
                function(manifest){
                    resolve(manifest);
                },
                function(error){
                    err(error);
                    reject(new Error(error));
                }
            );
        });
    }
    
    err("getManifest() no available reading mechanism!");
    return Promise.resolve({});
}

var launchUrl = function (url) {
    log("launchUrl: "+url);
    document.location.href = url;
};


var isStargateRunningInsideHybrid = false;
var isStargateInitialized = false;
var isStargateOpen = false;
var initializeCallback = null;

/**
 * appVersion: version number of the app
 */
var appVersion = '';
/**
 * appBuild: build identifier of the app
 */
var appBuild = '';
/**
 * appPackageName: package name of the app - the reversed domain name app identifier like com.example.myawesomeapp
 */
var appPackageName = '';

/**
 * appIsDebug {Boolean} true if app is compiled in debug mode
 */
var appIsDebug = false;


/**
 * 
 * variables sent by server configuration
 * 
 */
var hybrid_conf = {},
    requested_modules = [],
    modules_conf = {};

/**
 * 
 * Application information set on initialize
 * 
 */
var appInformation = {
    cordova: null,
    manufacturer: null,
    model: null,
    platform: null,
    deviceId: null,
    version: null,
    packageVersion: null,
    packageName: null,
    packageBuild: null,
    stargate: null,
    stargateModules: null,
    stargateError: null 
};

/**
* Set on webapp that we are hybrid
* (this will be called only after device ready is received and 
*   we are sure to be inside cordova app)
*/
var setIsHybrid = function() {

    window.Cookies.set("hybrid", "1");

    if (!window.localStorage.getItem('hybrid')) {
        window.localStorage.setItem('hybrid', 1);
    }
};

/**
* Set on webapp what version we need to load
* (this will be called only after manifest is loaded on stargate)
*/
var setHybridVersion = function() {

    window.Cookies.set("stargateVersion", getStargateVersionToLoad());

    if (!window.localStorage.getItem('stargateVersion')) {
        window.localStorage.setItem('stargateVersion', getStargateVersionToLoad());
    }
};

var hideSplashAndLoaders = function() {
    
    
    if (! haveRequestedFeature("leavesplash")) {
        navigator.splashscreen.hide();
    }

    setBusy(false);
    
    if (typeof SpinnerDialog !== "undefined") {
        SpinnerDialog.hide();
    }
};

var onPluginReady = function (resolve) {
    log("onPluginReady() start");

    // FIXME: this is needed ??
    document.title = stargateConf.title;
    
    // set back cordova bridge mode to IFRAME_NAV overriding manifold settings
    if (isRunningOnIos() && (typeof window.cordova !== 'undefined') && cordova.require) {
        var exec = cordova.require('cordova/exec');
        exec.setJsToNativeBridgeMode(exec.jsToNativeModes.IFRAME_NAV);
    }
    bindConnectionEvents();
    // save stargate version to load on webapp 
    setHybridVersion();

    
    if (hasFeature("mfp") && haveRequestedFeature("mfp")) {
        var mfpModuleConf = getModuleConf("mfp");
        
        // configurations needed
        //stargateConf.motime_apikey,
	  	//stargateConf.namespace,
        //stargateConf.label,
        
        // configurations needed
        //moduleConf.country
                  
        // retrocompatibility
        var keysOnStargateConf = ["motime_apikey", "namespace", "label"];
        keysOnStargateConf.forEach(function(keyOnStargateConf) {
            // if it's available in stargateConf but not in module conf
            // copy it to module conf
            if (!mfpModuleConf.hasOwnProperty(keyOnStargateConf) &&
                stargateConf.hasOwnProperty(keyOnStargateConf)) {
                    
                mfpModuleConf[keyOnStargateConf] = stargateConf[keyOnStargateConf];
            }
        });
        
        MFP.check(mfpModuleConf);
    }
    
    if (hasFeature("deltadna")) {
        window.deltadna.startSDK(
            stargateConf.deltadna.environmentKey,
            stargateConf.deltadna.collectApi,
            stargateConf.deltadna.engageApi,
            onDeltaDNAStartedSuccess,
            onDeltaDNAStartedError,
            stargateConf.deltadna.settings
        );
    }

    // initialize all modules
    
    stargateModules.statusbar.initialize(
        getModuleConf("statusbar")
    );

    // In-app purchase initialization
    if (haveRequestedFeature("iapbase")) {
        // base legacy iap implementation
        IAP.initialize(
            getModuleConf("iapbase")
        );
        
    } else if (haveRequestedFeature("iap")) {
        // if initialize ok...
        if ( IAP.initialize( getModuleConf("iap") ) ) {
            // ...then call refresh
            // this doesn't works, so we do it when needed in iap module
            //IAP.doRefresh();
            log("Init IAP done.");
        }
    }

    // receive appsflyer conversion data event
    if (hasFeature('appsflyer') && haveRequestedFeature("appsflyer")) {
        appsflyer.init(
            getModuleConf("appsflyer")
        );
    }
    
    // apply webapp fixes
    webappsFixes.init();

    codepush.initialize();
    
    var modulePromises = [];
    
    //Game Module Init
    // if requested by caller (haveRequestedFeature)
    // if available in app (has feature)
    // if included in code (stargateModules.game)
    if (haveRequestedFeature("game") && hasFeature('game') && stargateModules.game) {
        // save initialization promise, to wait for
        modulePromises.push(
            stargateModules.game._protected.initialize(
                getModuleConf("game")
            )
        );
    }
        
    if (haveRequestedFeature("adv") && stargateModules.AdManager) {
        // save initialization promise, to wait for
        modulePromises.push(
            stargateModules.AdManager.initialize(
                getModuleConf("adv")
            )
        );
    }
    
    
    // wait for all module initializations before calling the webapp
    Promise.all(
            modulePromises
        )
        .then(function() {
            
            onStargateReady(resolve);
            
        })
        .catch(function (error) {
            err("onPluginReady() error: ",error);
            
            onStargateReady(resolve, error);
        });
};

var onStargateReady = function(resolve, error) {
    log("onStargateReady() start");
    
    hideSplashAndLoaders();
            
    // initialize finished
    isStargateOpen = true;
    
    log("version "+stargatePackageVersion+" ready; "+
        " running in package version: "+appVersion);
    
    appInformation = {
        cordova: runningDevice.cordova,
        manufacturer: runningDevice.manufacturer,
        model: runningDevice.model,
        platform: runningDevice.platform,
        deviceId: runningDevice.uuid,
        version: runningDevice.version,
        packageVersion: appVersion,
        packageName: appPackageName,
        packageBuild: appBuild,
        stargate: stargatePackageVersion
    };    
    if (requested_modules && requested_modules.constructor === Array) {
        appInformation.stargateModules = requested_modules.join(", ");
    }
    if (error && (error instanceof Error)) {
        appInformation.stargateError = error.toString();
    }
    if (window.navigator && window.navigator.connection && window.navigator.connection.type) {
        appInformation.connectionType = window.navigator.connection.type;
    }
    
    //execute callback
    initializeCallback(true);

    log("Stargate.initialize() done");
    resolve(true);
};

var onDeviceReady = function (resolve, reject) {
    log("onDeviceReady() start");

    // device ready received so i'm sure to be hybrid
    setIsHybrid();
    
    // get device information
    initDevice();
    
    // get connection information
    initializeConnectionStatus();

    // request all asyncronous initialization to complete
    Promise.all([
        // include here all needed asyncronous initializazion
        cordova.getAppVersion.getVersionNumber(),
        getManifest(),
        cordova.getAppVersion.getPackageName(),
        cordova.getAppVersion.getVersionCode(),
        getAppIsDebug()       
    ])
    .then(function(results) {
        // save async initialization result

        appVersion = results[0];
		
		if (typeof results[1] !== 'object') {
			results[1] = JSON.parse(results[1]);
		}
        
        appPackageName = results[2];
        appBuild = results[3];
        
        if (results[4] && ( typeof(results[4]) === 'object') ) {
            if (results[4].debug) {
                appIsDebug = true;             
            }
        }

        stargateConf = results[1].stargateConf;

        // execute remaining initialization
        onPluginReady(resolve, reject);
    })
    .catch(function (error) {
        err("onDeviceReady() error: "+error);
        reject("onDeviceReady() error: "+error);
    });
};

/**
* Check if we are running inside hybrid environment,  
* checking current url or cookies or localStorage
*/
var isHybridEnvironment = function() {

    // check url for hybrid query param
    var uri = window.URI(document.location.href);
    var protocol = uri.protocol();

    if (protocol === "file" || protocol === "cdvfile") {
        return true;
    }

    if (uri.hasQuery('hybrid')) {
        return true;
    }

    if (window.Cookies.get('hybrid')) {
        return true;
    }

    if (window.localStorage.getItem('hybrid')) {
        return true;
    }

    return false;
};


var setBusy = function(value) {
    if (value) {
        startLoading();
    }
    else {
        stopLoading();
    }
};

var stargateConf = {
    features: {}
};

/**
 * getModuleConf(moduleName)
 * @param {string} moduleName - name of module to return conf of
 * @returns {object} - configuration for the module sent by Stargate implementator on Stargate.initialize()
 */
var getModuleConf = function(moduleName) {
    // 1. new version -> modules_conf
    // 2. old version -> hybrid_conf
    
    if (!moduleName) {
        return err("getModuleConf() invalid module requested");
    }
    
    if (moduleName in modules_conf) {
        return modules_conf[moduleName];
    }
    
    // covert modulesname
    var mapConfLegacy = {
        "iapbase": "IAP",
        "iap": "IAP"
    };
    
    var moduleNameLegacy = moduleName;
    if (mapConfLegacy[moduleName]) {
        moduleNameLegacy = mapConfLegacy[moduleName];
    }
    
    if (hybrid_conf && moduleNameLegacy in hybrid_conf) {
        return hybrid_conf[moduleNameLegacy];
    }
    
    log("getModuleConf(): no configuration for module: "+moduleName+" ("+mapConfLegacy+")");
    return {};
};

/**
 * hasFeature(feature)
 * @param {string} feature - name of feature to check
 * @returns {boolean} - true if app have feature requested (it check inside the manifest compiled in the app) 
 */
var hasFeature = function(feature) {
    return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
};

/**
 * haveRequestedFeature(feature)
 * @param {string} feature - name of feature to check
 * @returns {boolean} - true if implementator of Stargate requested the feature (it check against the configuration.modules array sent as paramenter of Stargate.initialize())
 * 
 * possible values: "mfp","iapbase","iap","appsflyer","webappanalytics","game" 
 */
var haveRequestedFeature = function(feature) {
    if (requested_modules && requested_modules.constructor === Array) {
        return requested_modules.indexOf(feature) > -1;
    }
    return false;
};
var share = (function(){

    
	var shareProtected = {};
    
    var getOptions = function(requestedOptions) {
        var availableOptions = ["message", "subject", "files", "chooserTitle"];
        var options = {
            url: requestedOptions.url
        };
        availableOptions.forEach(function(availableOption) {
            if (availableOption in requestedOptions) {
                options[availableOption] = requestedOptions[availableOption];
            }
        });
        return options;
    };
    
	var shareWithChooser = function(requestedOptions, resolve, reject) {
        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        //var fullOptions = {
        //    message: 'share this', // not supported on some apps (Facebook, Instagram)
        //    subject: 'the subject', // fi. for email
        //    files: ['', ''], // an array of filenames either locally or remotely
        //    url: 'https://www.website.com/foo/#bar?a=b',
        //    chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
        //};
        
        var options = getOptions(requestedOptions);
        
        var onSuccess = function(result) {
            log("[share] Share completed? " + result.completed); // On Android apps mostly return false even while it's true
            log("[share] Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
            
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Sharing failed with message: " + msg);
            
            reject(msg);
        };

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    };
    
    var shareWithFacebook = function(requestedOptions, resolve, reject) {
        var onSuccess = function(result) {
            log("[share] Facebook share completed, result: ", result);
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Facebook sharing failed with message: " + msg);
            reject(msg);
        };
        
        window.plugins.socialsharing.shareViaFacebook(
            "",
            null,
            requestedOptions.url,
            onSuccess,
            onError
        );
    };
    
    var shareWithTwitter = function(requestedOptions, resolve, reject) {
        var onSuccess = function(result) {
            log("[share] Twitter share completed, result: ", result);
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Twitter sharing failed with message: " + msg);
            reject(msg);
        };
        
        var message = "";
        if ("message" in requestedOptions) {
            message = requestedOptions.message;
        }
        window.plugins.socialsharing.shareViaTwitter(
            message,
            null,
            requestedOptions.url,
            onSuccess,
            onError
        );
    };
    var shareWithWhatsapp = function(requestedOptions, resolve, reject) {
        var onSuccess = function(result) {
            log("[share] Whatsapp share completed, result: ", result);
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Whatsapp sharing failed with message: " + msg);
            reject(msg);
        };
        
        var message = "";
        if ("message" in requestedOptions) {
            message = requestedOptions.message;
        }
        
        window.plugins.socialsharing.shareViaWhatsApp(
            message,
            null,
            requestedOptions.url,
            onSuccess,
            onError
        );
    };
    
    shareProtected.canShareVia = function(via, url) {
        
        return new Promise(function(resolve){
            
            // canShareVia: 
            //   via, message, subject, fileOrFileArray, url, successCallback, errorCallback
            window.plugins.socialsharing.canShareVia(
                via,
                null,
                null,
                null,
                url,
                function(e){
                    log("[share] canShareVia "+via+" result true: ", e);
                    resolve({
                        "network": via,
                        "available": true
                    });
                },
                function(e){
                    log("[share] canShareVia "+via+" result false: ", e);
                    resolve({
                        "network": via,
                        "available": false
                    });
                }
            );
        });
    };
    
    
	shareProtected.socialShare = function(options, resolve, reject) {
        
		if (typeof options !== 'object') {
            options = {};
			war("[share] parameter options must be object!");
		}
        
        if (!options.type) {
            options.type = "chooser";
        }

        if (!window.plugins || !window.plugins.socialsharing) {

			// plugin is not installed
            err("[share] missing cordova plugin");
			return reject("missing cordova plugin");
		}
		
        if (!options.url) {
            err("[share] missing parameter url");
            return reject("missing parameter url");
        }
        
        log("[share] Sharing url: "+options.url+" on: "+options.type, options);
        
        if (options.type == "chooser") {
            return shareWithChooser(options, resolve, reject);
        }
        
        if (options.type == "facebook") {
            return shareWithFacebook(options, resolve, reject);
        }
        
        if (options.type == "twitter") {
            return shareWithTwitter(options, resolve, reject);
        }
        
        if (options.type == "whatsapp") {
            return shareWithWhatsapp(options, resolve, reject);
        }

        err("[share] type not valid");        
        return reject("type not valid");
        
	};
    
    return shareProtected;
})();


/**
 * @name Stargate#socialShare
 * @memberof Stargate
 *
 * @description share an url on a social network
 *
 * @param {object} options
 */
stargatePublic.socialShare = function(options) {
    
    if (!isStargateInitialized) {
        return Promise.reject("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        return Promise.reject("Stargate closed, wait for Stargate.initialize to complete!");
    }
    
    
    var result = new Promise(function(resolve,reject){
        
        share.socialShare(options, resolve, reject);
    });
    
    
    return result;
};

/**
 * @name Stargate#socialShareAvailable
 * @memberof Stargate
 *
 * @description return a promise with an array of available social networks
 *
 * @param {object} options
 * @param {Array} options.socials - list of social network to check
 * 
 */
stargatePublic.socialShareAvailable = function(options) {
    
    if (!isStargateInitialized) {
        return Promise.reject("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        return Promise.reject("Stargate closed, wait for Stargate.initialize to complete!");
    }
    
    if (!window.plugins || !window.plugins.socialsharing) {
        // plugin is not installed
        err("[share] missing cordova plugin");
        return Promise.reject("missing cordova plugin");
    }
    
    if (!options.socials || typeof options.socials !== "object") {
        err("[share] missing object parameter socials");
        return Promise.reject("missing object parameter socials");
    }
    
    if (!options.url) {
        err("[share] missing parameter url");
        return Promise.reject("missing parameter url");
    }
    
    
    var result = new Promise(function(resolve,reject){
        
        var socialsAvailabilityPromises = [];
    
        var knownSocialNetworks = [
            "facebook",
            "whatsapp",
            "twitter",
            "instagram"
        ];
        knownSocialNetworks.forEach(function(element) {
            // check only requested networks
            
            if (options.socials[element]) {
                
                socialsAvailabilityPromises.push(
                    
                    share.canShareVia(element, options.url)
                );
                
            }
        });
        
        Promise.all(socialsAvailabilityPromises).then(function(values) { 
            
            var availableNetworks = {};
            // values is like:
            //  [{"network": "facebook", "available": false},
            //   {"network": "twitter", "available": false}]
            values.forEach(function(element) {
                availableNetworks[element.network] = element.available;
                //log("element: ", element);
            });
            //log("values: ", values);
            //log("availableNetworks: ", availableNetworks);
            resolve(availableNetworks);
            
        }, function(reason) {
            
            err(reason);
            reject(reason);
        });
    });
    
    
    return result;
};

/* global URI, URITemplate  */

/**
 * @namespace
 * @protected
 * 
 * @description
 * MFP is used to recognize user coming from webapp.
 *
 * For example an usual flow can be:
 *  1. an user open the browser and go to our webapp;
 *  2. then he's suggested to install the app
 *  3. he's sent to the app store and install the app
 *  4. our app with Stargate integrated is opened by our user
 *  5. MFP module send an api request to the server and the user is recongized
 *  6. the previous session is restored by the MobileFingerPrint.setSession
 * 
 */
var MFP = (function(){

	// contains private module members
	var MobileFingerPrint = {};

	/**
     * @name MFP#check
     * @memberof MFP
     *
     * @description Start the MFP check to see if user has a session on the server
     * @param {object} initializeConf - configuration sent by
     * @return {boolean} - true if init ok
     *
     */
	MobileFingerPrint.check = function(initializeConf){
		
		//if (window.localStorage.getItem('mfpCheckDone')){
		//	return;
		//}

		// country defined on main stargate.js
        var neededConfs = ["motime_apikey", "namespace", "label", "country"];
        neededConfs.forEach(function(neededConf) {
            if (!initializeConf.hasOwnProperty(neededConf)) {		
                return err("[MFP] Configuration '"+neededConf+"' not defined!");
            }
            if (!initializeConf[neededConf]) {		
                return err("[MFP] Configuration: '"+neededConf+"' not valid!");
            }
        });

		MobileFingerPrint.get(initializeConf);
	};

	MobileFingerPrint.getContents = function(country, namespace, label, extData){
		var contents_inapp = {};
	    contents_inapp.api_country = label;
	    contents_inapp.country = country;
	    contents_inapp.fpnamespace = namespace;
	    if (extData){
	        contents_inapp.extData = extData;
	    }
	    
	    var json_data = JSON.stringify(contents_inapp);
	       
	    return json_data;
	};

	MobileFingerPrint.getPonyValue = function(ponyWithEqual) {
		try {
			return ponyWithEqual.split('=')[1];
		}
		catch (e) {
			err(e);
		}
		return '';
	};

	MobileFingerPrint.setSession = function(pony){

		// get appurl from configuration
		var appUrl = stargatePublic.conf.getWebappStartUrl();
		if (window.localStorage.getItem('appUrl')){
			appUrl = window.localStorage.getItem('appUrl');
		}

		var currentUrl = new URI(appUrl);

		// stargateConf.api.mfpSetUriTemplate:
		// '{protocol}://{hostname}/mfpset.php{?url}&{pony}'
		var hostname = currentUrl.hostname();
		var newUrl = URITemplate(stargateConf.api.mfpSetUriTemplate)
	  		.expand({
	  			"protocol": currentUrl.protocol(),
	  			"hostname": hostname,
	  			"url": appUrl,
	  			"domain": hostname,
	  			"_PONY": MobileFingerPrint.getPonyValue(pony)
	  	});
				
		log("[MobileFingerPrint] going to url: ", newUrl);

		launchUrl(newUrl);
	};

	MobileFingerPrint.get = function(initializeConf){
		var expire = "";

	    // stargateConf.api.mfpGetUriTemplate:
	    // "http://domain.com/path.ext{?apikey,contents_inapp,country,expire}",

		var mfpUrl = URITemplate(stargateConf.api.mfpGetUriTemplate)
	  		.expand({
	  			"apikey": initializeConf.motime_apikey,
	  			"contents_inapp": MobileFingerPrint.getContents(initializeConf.country, initializeConf.namespace, initializeConf.label),
	  			"country": initializeConf.country,
	  			"expire": expire
	  	});

        window.aja()
            .url(mfpUrl)
            .type('jsonp')
            .on('success', function(response){
                
                log("[MobileFingerPrint] get() response: ", response);

                var ponyUrl = '';

                if (response.content.inappInfo){
                    var jsonStruct = JSON.parse(response.content.inappInfo);

                    if (jsonStruct.extData) {
                    	if (jsonStruct.extData.ponyUrl) {
                    		ponyUrl = jsonStruct.extData.ponyUrl;
                    	}
                    	if (jsonStruct.extData.return_url) {
                    		window.localStorage.setItem('appUrl', jsonStruct.extData.return_url);
                    	}
                    	if (jsonStruct.extData.session_mfp) {

                    		analytics.track({
		                    	page: 'hybrid_initialize',
		                    	action: 'MFP_get',
		                    	session_mfp: jsonStruct.extData.session_mfp
		                    });
                    	}
                    }

                    
                    
                    MobileFingerPrint.setSession(ponyUrl);                
                }else{
                    log("[MobileFingerPrint] get(): Empty session");
                }
            })
            .on('error', function(error){
                err("[MobileFingerPrint] get() error: ", error);
            })
            .go();
	};


	return {
		check: MobileFingerPrint.check
	};

})();

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*jslint bitwise: true */
/*global unescape, define, module */

var md5 = (function () {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    return md5;
}());




var startLoading = function(properties) {
	if (typeof window.SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    if (typeof properties !== 'object') {
		properties = {};
	}
	
    var msg = null;
    
    if(properties.hasOwnProperty("message")){
        msg = properties.message;
    }
    window.SpinnerDialog.show(null, msg);
    return true;
};

var stopLoading = function() {
	if (typeof window.SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    window.SpinnerDialog.hide();
    return true;
};

//jshint unused:false
var changeLoadingMessage = function(newMessage) {
    if (typeof window.SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    window.SpinnerDialog.show(null, newMessage);
    return true;
};


// FIXME: used inside store.js
window.startLoading = startLoading;
window.stopLoading = stopLoading;


var IAP = {

	id: '',
	alias: '',
	type: '',
	verbosity: '',
	paymethod: '',
    subscribeMethod: '',
    returnUrl: '',
    /**
     * callbackSuccess for inapppurchase and inapprestore 
     */
    callbackSuccess: function(){log("[IAP] Undefined callbackSuccess");},
    /**
     * callbackSuccess for inapppurchase and inapprestore 
     */
    callbackError: function(){log("[IAP] Undefined callbackError");},
    callbackListingSuccess: function(){log("[IAP] Undefined callbackListingSuccess");},
    callbackListingError: function(){log("[IAP] Undefined callbackListingError");},
    /**
     * callbackPurchaseSuccess for inAppProductInfo
     */
    callbackPurchaseSuccess: function(){log("[IAP] Undefined callbackPurchaseSuccess");},
    requestedListingProductId: '',
    /**
     * true when inapppurchase is requested by the user 
     */
    inappPurchaseCalled: false,
    /**
     * true when inappproductinfo is requested by the user
     */
    inappProductInfoCalled: false,
    lastCreateUserProduct: null,
    lastCreateUserToken: null,
    
    refreshDone: false,
    lastCreateuserUrl: '',
    lastCreateuserData: '',
    createUserAttempt: 0,
    maxCreateUserAttempt: 6,
    
    refreshInProgress: false,
    productsInfo: {},
    
    /**
     * @param {object} initializeConf - configuration sent by
     * @return {boolean} - true if init ok
     */
	initialize: function (initializeConf) {
        if (!window.store) {
            err("[IAP] Store not available, missing cordova plugin.");
            return false;
        }
		
        // initialize with current url
        IAP.returnUrl = document.location.href;

        if (initializeConf.id) {
            IAP.id = initializeConf.id;
        } else {
            if (isRunningOnAndroid()) {
                IAP.id = initializeConf.id_android;
            }
            else if (isRunningOnIos()) {
                IAP.id = initializeConf.id_ios;
            }
        }
        
        if (!IAP.id) {
            err("[IAP] Configuration error, missing product id!");
            return false;
        }

        // 
        if (initializeConf.alias) {
            IAP.alias = initializeConf.alias;
        }

        //  --- type ---
        // store.FREE_SUBSCRIPTION = "free subscription";
        // store.PAID_SUBSCRIPTION = "paid subscription";
        // store.CONSUMABLE        = "consumable";
        // store.NON_CONSUMABLE    = "non consumable";
        if (initializeConf.type) {
            IAP.type = initializeConf.type;
        }
        
        if (initializeConf.api_createuser) {
            IAP.subscribeMethod = initializeConf.api_createuser;
        }

        // Available values: DEBUG, INFO, WARNING, ERROR, QUIET
        IAP.verbosity = 'INFO';

        IAP.paymethod = isRunningOnAndroid() ? 'gwallet' : 'itunes';


        log('IAP initialize id: '+IAP.id);
		
		if(isRunningOnAndroid()){
			IAP.getGoogleAccount();
		}
        window.store.verbosity = window.store[IAP.verbosity];
        // store.validator = ... TODO
        
        window.store.register({
            id:    IAP.id,
            alias: IAP.alias,
            type:  window.store[IAP.type]
        });
        
        window.store.when(IAP.alias).approved(function(p){IAP.onPurchaseApproved(p);});
        window.store.when(IAP.alias).verified(function(p){IAP.onPurchaseVerified(p);});
        window.store.when(IAP.alias).updated(function(p){IAP.onProductUpdate(p);});
		window.store.when(IAP.alias).owned(function(p){IAP.onProductOwned(p);});
		window.store.when(IAP.alias).cancelled(function(p){IAP.onCancelledProduct(p); });
		window.store.when(IAP.alias).error(function(errorPar){IAP.error(JSON.stringify(errorPar));});
        window.store.ready(function(){ IAP.onStoreReady();});
        window.store.when("order "+IAP.id).approved(function(order){IAP.onOrderApproved(order);});
        
        // When any product gets updated, refresh the HTML.
        window.store.when("product").updated(function(p){ IAP.saveProductInfo(p); });
        
        return true;
    },
    
    saveProductInfo: function(params) {
        IAP.refreshInProgress = false;
        if (typeof params !== "object") {
            err("[IAP] saveProductInfo() got invalid data");
            return;
        }
        
        if ("id" in params) {
            IAP.productsInfo[params.id] = params;
            
        } else {
            err("[IAP] saveProductInfo() got invalid data, id undefined");
            return;
        }
        
        if (IAP.requestedListingProductId === params.id) {
                
            IAP.callbackListingSuccess(params);
        }
    },
    
    doRefresh: function(force) {
        if (IAP.refreshInProgress) {
            war("[IAP] doRefresh() refresh in progress, skipping...");
        }
        if (!IAP.refreshDone || force) {
            window.store.refresh();
            IAP.refreshDone = true;
            IAP.refreshInProgress = true;
            log("[IAP] doRefresh() refreshing...");            
        }
    },

    getPassword: function (transactionId){
        return md5('iap.'+transactionId+'.playme').substr(0,8);
    },
	
	getGoogleAccount: function(){
		window.accountmanager.getAccounts(IAP.checkGoogleAccount, IAP.error, "com.google");	
	},
	
	checkGoogleAccount: function(result){
		
		if(result) {
			log('[IAP] accounts');
			log(result);
			
			for(var i in result){
				window.localStorage.setItem('googleAccount', result[i].email);
				return result[i].email;
			}
		}	
	},
 
    onProductUpdate: function(p){
        log('IAP> Product updated.');
        log(JSON.stringify(p));
        if (p.owned) {
            log('[IAP] Subscribed!');
        } else {
            log('[IAP] Not Subscribed');
        }
    },
    
    onPurchaseApproved: function(p){
        log('IAP> Purchase approved.');
        log(JSON.stringify(p));
        //p.verify(); TODO before finish		
        p.finish();
    },
    onPurchaseVerified: function(p){
        log("subscription verified ", p);
        //p.finish(); TODO
    },
    onStoreReady: function(){
        log("\\o/ STORE READY \\o/");
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
        log('[IAP] > Product Owned.');
        if (!p.transaction.id && isRunningOnIos()){
            err('[IAP] > no transaction id');
            return false;
        }
        window.localStorage.setItem('product', p);
		if(isRunningOnIos()){
			window.localStorage.setItem('transaction_id', p.transaction.id);
		}
        
        if (isRunningOnAndroid()){
            var purchase_token = p.transaction.purchaseToken + '|' + appPackageName + '|' + IAP.id;
            log('[IAP] Purchase Token: '+purchase_token);
            
            if(!window.localStorage.getItem('user_account')){
                IAP.createUser(p, purchase_token);
            }
            
        } else {
        
            window.storekit.loadReceipts(function (receipts) {
                
                if(!window.localStorage.getItem('user_account')){
                    if (!!!receipts.appStoreReceipt) {
                        log('[IAP] appStoreReceipt empty, ignoring request');
                    }
                    else {
                        log('[IAP] appStoreReceipt: ' + receipts.appStoreReceipt);
                        IAP.createUser(p, receipts.appStoreReceipt);
                    }
                }
            });
        }
        
    },
    
    onCancelledProduct: function(p){
        setBusy(false);
        IAP.callbackError({'iap_cancelled': 1, 'return_url' : IAP.returnUrl});
        log('[IAP] > Purchase cancelled ##################################', p);
    },
    
    onOrderApproved: function(order){
       log("[IAP] ORDER APPROVED "+IAP.id);
       order.finish();
    },
	
	error: function(error) {
        setBusy(false);
		err('[IAP] error: '+error);	
        
        IAP.callbackError({'iap_error': 1, 'return_url' : IAP.returnUrl});
	},
	

    
	createUser: function(product, purchaseToken){
        log('[IAP] createUser start ');
	    
        // if i'm here before user request inapp purchase/restore
        //  or in app product info
        //  i save data for calling again me when requested.
        if (!IAP.inappProductInfoCalled && !IAP.inappPurchaseCalled) {
            IAP.lastCreateUserProduct = product;
            IAP.lastCreateUserToken = purchaseToken;
            return;
        }
        
        
        if (!IAP.subscribeMethod) {
            err("[IAP] createUser configuration error: missing api url.");
            return;
        }
        
		window.localStorage.setItem('user_account', 
            isRunningOnAndroid() ? 
                (window.localStorage.getItem('googleAccount') ? 
                    window.localStorage.getItem('googleAccount')
                    : purchaseToken+'@google.com')
                : product.transaction.id+'@itunes.com');
		
        var url = IAP.subscribeMethod;		
		
        var formData = {
            "paymethod": IAP.paymethod,
            "user_account": window.localStorage.getItem('user_account'),
            "purchase_token": purchaseToken,
            "return_url": IAP.returnUrl,
            "inapp_pwd": IAP.getPassword(purchaseToken),
            "hybrid": 1
        };

        IAP.lastCreateuserUrl = url;
        IAP.lastCreateuserData = formData;

        var onCreateError = function(error) {
            if (IAP.createUserAttempt <= IAP.maxCreateUserAttempt) {
                err("[IAP] createUser failed "+IAP.createUserAttempt+
                    " times, trying again... last error: "+JSON.stringify(error)
                );

                // trying again
                createUserAjaxCall();
            }
            else {
                // no more try, fail to webapp callbackerror

                err('[IAP] createUser onCreateError: removing user_account');
                window.localStorage.removeItem('user_account');

                var stargateResponseError = {"iap_error" : "1", "return_url" : IAP.returnUrl};
                setBusy(false);
                
                if (IAP.inappPurchaseCalled) {
                    IAP.callbackError(stargateResponseError);
                } else if (IAP.inappProductInfoCalled) {
                    IAP.callbackListingError(stargateResponseError);                    
                }
            }
        };

        var onCreateSuccess = function(user) {
            log('[IAP] createUser success ', user);
            try {
                user.device_id = runningDevice.uuid;
                if(window.localStorage.getItem('transaction_id')){
                    user.transaction_id = window.localStorage.getItem('transaction_id');
                }
                setBusy(false);
                IAP.callbackSuccess(user);
                
                if (IAP.inappPurchaseCalled) {
                    IAP.callbackSuccess(user);
                } else if (IAP.inappProductInfoCalled) {
                    IAP.callbackPurchaseSuccess(user);                    
                }
            }
            catch (error) {
                onCreateError(error);
            }
        };

        var startTimeoutSeconds = 10;

        var createUserAjaxCall = function() {
            setTimeout(function() {
                    IAP.createUserAttempt = IAP.createUserAttempt + 1;

                    log('[IAP] createUser attempt: '+IAP.createUserAttempt+
                        ' with timeout: '+startTimeoutSeconds+'sec.');
                    
                    log("[IAP] POST createUser: "+IAP.lastCreateuserUrl+
                        " params: "+JSON.stringify(IAP.lastCreateuserData)+
                        " timeout: "+startTimeoutSeconds * 1000);
                    
                    window.aja()
                        .method('POST')
                        .url(IAP.lastCreateuserUrl)
                        .cache(false)
                        .timeout(startTimeoutSeconds * 1000) // milliseconds
                        .data(IAP.lastCreateuserData)
                        .on('success', function(user){
                            onCreateSuccess(user);
                        })
                        .on('error', function(error){
                            onCreateError(error);
                        })
                        .on('4xx', function(error){
                            onCreateError(error);
                        })
                        .on('5xx', function(error){
                            onCreateError(error);
                        })
                        .on('timeout', function(){
                            onCreateError("timeout");
                        })
                        .on('end', function(){
                            log("[IAP] createUser end");
                            setBusy(false);
                        })
                        .go();

                    // more timeout
                    startTimeoutSeconds = startTimeoutSeconds + 5;

                },
                10 // millisecond after it's executed (when the thread that called setTimeout() has terminated)
            );
        };

        IAP.createUserAttempt = 0;

        // start first attempt
        createUserAjaxCall();
        
	}
};



stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        callbackError("Stargate not initialized, call Stargate.initialize first!");
        return false;
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }
    
    setBusy(true);

    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;
    
    /*
    if (isRunningOnAndroid() && appIsDebug) {
        var debugTransactionAndroid = {
            "id":IAP.id,
            "alias":"Stargate Debug IAP Mock",
            "type":"paid subscription",
            "state":"owned",
            "title":"Stargate Debug IAP Mock subscription",
            "description":"Stargate Debug IAP Mock subscription",
            "price":"€2.00",
            "currency":"EUR",
            "loaded":true,
            "canPurchase":false,
            "owned":true,
            "downloading":false,
            "downloaded":false,
            "transaction":{
                "type":"android-playstore",
                "purchaseToken":"dgdecoeeoodhalncipabhmnn.AO-J1OwM_emD6KWnZBjTCG2nTF5XWvuHzLCOBPIBj9liMlqzftcDamRFnUvEasQ1neEGK7KIxlPKMV2W09T4qAVZhw_aGbPylo-5a8HVYvJGacoj9vXbvKhb495IMIq8fmywk8-Q7H5jL_0lbfSt9SMVM5V6k3Ttew",
                "receipt":"{\"packageName\":\"stargate.test.package.id\",\"productId\":\"stargate.mock.subscription.weekly\",\"purchaseTime\":1460126549804,\"purchaseState\":0,\"purchaseToken\":\"dgdecoeeoodhalncipabhmnn.AO-J1OwM_emD6KWnZBjTCG2nTF5XWvuHzLCOBPIBj9liMlqzftcDamRFnUvEasQ1neEGK7KIxlPKMV2W09T4qAVZhw_aGbPylo-5a8HVYvJGacoj9vXbvKhb495IMIq8fmywk8-Q7H5jL_0lbfSt9SMVM5V6k3Ttew\",\"autoRenewing\":false}","signature":"UciGXv48EMVdUXICxoy+hBWTiKbn4VABteQeIUVlFG0GmJ/9p/k372RhPyprqve7tnwhk+vpZYos5Fwvm/SrYjsqKMMFgTzotrePwJ9spq2hzmjhkqNTKkxdcgiuaCp8Vt7vVH9yjCtSKWwdS1UBlZLPaJunA4D2KE8TP/qYnwgZTOCBvSf3rUbEzmwRuRbYqndNyoMfIXvRP71TDBsMcHM/3UrDYEf2k2/SJKnctcGmvU2/BW/WG96T9FuiJPpotax7iQmBdN5PmfuxlZiZiUyj9mFEgzPEIAMP2HCcdX2KlNBPhKhxm4vESozVljTbrI0+OGJjQJhaWBn9+aclmA=="
            },
            "valid":true
        };
        IAP.onProductOwned(debugTransactionAndroid);
        return true;
    }
    */

    IAP.inappPurchaseCalled = true;
    
    // execute createUser if data is already available
    if (IAP.lastCreateUserProduct && IAP.lastCreateUserToken) {
        IAP.createUser(IAP.lastCreateUserProduct, IAP.lastCreateUserToken);
        
        // no need to call refresh again
        return true;
    }
    
    IAP.doRefresh();
    window.store.order(IAP.id);
    return true;
};


stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        return callbackError("Stargate closed, wait for Stargate.initialize to complete!");
    }

    // no set busy needed for restore as it's usually fast and 
    //  we cannot intercept error result, so the loader remain visible

    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;
    IAP.inappPurchaseCalled = true;
    
    IAP.doRefresh(true);
};

/**
 * Return information about a product got from store
 * 
 * @param {object} options - options object
 * @param {string} [options.productId=IAP.id] - product id about to query for information on store
 * @param {string} options.subscriptionUrl - api endpoint that will be called when IAP is completed @see createUser method
 * @param {function} options.callbackListingSuccess=function(){} - a function that will be called when information are ready
 * @param {function} options.callbackPurchaseSuccess=function(){} - a function that will be called when createUser complete (if the product is already owned)
 * @param {function} options.callbackError=function(){} - a function that will be called if an error occur 
 * 
 * @returns {boolean} - request result: true OK, false KO
 * */
stargatePublic.inAppProductInfo = function(options) {

    if (! options.productId) {
        options.productId = IAP.id;
    }
    
    if (typeof(options.callbackListingSuccess) !== "function") {
        options.callbackListingSuccess = function() {};
    }
    if (typeof(options.callbackPurchaseSuccess) !== "function") {
        options.callbackPurchaseSuccess = function() {};
    }
    if (typeof(options.callbackError) !== "function") {
        options.callbackError = function() {};
    }
    if (!options.subscriptionUrl) {
        err("[IAP] inAppProductInfo(): options.subscriptionUrl invalid");
        return false;
    }
    
    if (!isStargateInitialized) {
        options.callbackError("Stargate not initialized, call Stargate.initialize first!");
        return false;
    }
    if (!isStargateOpen) {
        options.callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }
    
    IAP.subscribeMethod = options.subscriptionUrl;
    
    IAP.requestedListingProductId = options.productId;
    IAP.callbackListingSuccess = options.callbackListingSuccess;
    IAP.callbackPurchaseSuccess = options.callbackPurchaseSuccess;
    IAP.callbackListingError = options.callbackError;
    IAP.inappProductInfoCalled = true;

    // execute callback for product information if data is already available 
    if (IAP.productsInfo[options.productId]) {
        try {
            IAP.callbackListingSuccess(IAP.productsInfo[options.productId]);
        }
        catch (error) {
            err("[IAP] inAppProductInfo(): error on callbackListingSuccess!");
        }
    }
    
    // execute createUser if data is already available
    if (IAP.lastCreateUserProduct && IAP.lastCreateUserToken) {
        IAP.createUser(IAP.lastCreateUserProduct, IAP.lastCreateUserToken);
        
        // no need to call refresh again
        return true;
    }
    
    // call refresh then, when store will call stargate, we will call client callbacks
    IAP.doRefresh(true);    
    return true;    
};

/* global facebookConnectPlugin */


stargatePublic.facebookLogin = function(scope, callbackSuccess, callbackError) {


    // FIXME: check that facebook plugin is installed
    // FIXME: check parameters

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    
    facebookConnectPlugin.login(
        scope.split(","),

        // success callback
        function (userData) {
            log("[facebook] got userdata: ", userData);
            
            facebookConnectPlugin.getAccessToken(
                function(token) {
                    callbackSuccess({'accessToken' : token});
                },
                function(err) {
                    callbackError({'error': err});
                }
            );
        },

        // error callback
        function (error) {
            err("Got FB login error:", error);
            callbackError({'error': error});
        }
    );
};

stargatePublic.facebookShare = function(url, callbackSuccess, callbackError) {

    // FIXME: check that facebook plugin is installed
    // FIXME: check parameters

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    var options = {
        method: "share",
        href: url
    };
    
    facebookConnectPlugin.showDialog(
        options, 
        
        function(message){
            callbackSuccess({'message':message});
        }, 

        function(error){

            // error.errorMessage
            err("Got FB share error:", error);
            callbackError({'error':error});
        }
    );
};

/* global deltadna */

var onDeltaDNAStartedSuccess = function() {
    deltadna.registerPushCallback(
		onDeltaDNAPush
	);
};


var onDeltaDNAStartedError = function(error) {
    err("[DeltaDNA] error: " + error);
};

var onDeltaDNAPush = function(pushDatas) {
    if(isRunningOnAndroid() && pushDatas.payload && pushDatas.payload.url && !pushDatas.foreground){
		return launchUrl(pushDatas.payload.url);
	}
    if(isRunningOnIos() && pushDatas.url){
        return launchUrl(pushDatas.url);
    }
};
var codepush = (function(){
    
	var protectedInterface = {};

    var registeredCallbacks = {};
    
    var onSyncStatus = function(status) {
        log("[CodePush] syncStatus: " + 
            protectedInterface.syncStatus[status]);
        
        if (registeredCallbacks[status] && Array === registeredCallbacks[status].constructor) {
            registeredCallbacks[status].forEach(function(cb){
                cb(status);
            });
        }
    };

    /**
     * SyncStatus.UP_TO_DATE
     * Result status - the application is up to date.
     * 
     * SyncStatus.UPDATE_INSTALLED
     * Result status - an update is available, it has been downloaded, unzipped and copied to the deployment folder.
     * After the completion of the callback invoked with SyncStatus.UPDATE_INSTALLED, the application will be reloaded with the updated code and resources.
     *   
     * SyncStatus.UPDATE_IGNORED
     * Result status - an optional update is available, but the user declined to install it. The update was not downloaded.
     * 
     * SyncStatus.ERROR
     * Result status - an error happened during the sync operation. This might be an error while communicating with the server, downloading or unziping the update.
     * The console logs should contain more information about what happened. No update has been applied in this case.
     * 
     * SyncStatus.IN_PROGRESS
     * Result status - there is an ongoing sync in progress, so this attempt to sync has been aborted.
     * 
     * SyncStatus.CHECKING_FOR_UPDATE
     * Intermediate status - the plugin is about to check for updates.
     * 
     * SyncStatus.AWAITING_USER_ACTION
     * Intermediate status - a user dialog is about to be displayed. This status will be reported only if user interaction is enabled.
     * 
     * SyncStatus.DOWNLOADING_PACKAGE
     * Intermediate status - the update packages is about to be downloaded.
     * 
     * SyncStatus.INSTALLING_UPDATE
     * Intermediate status - the update package is about to be installed.
     */
    protectedInterface.syncStatus = {
        0: "UP_TO_DATE",
        1: "UPDATE_INSTALLED",
        2: "UPDATE_IGNORED",
        3: "ERROR",
        4: "IN_PROGRESS",
        5: "CHECKING_FOR_UPDATE",
        6: "AWAITING_USER_ACTION",
        7: "DOWNLOADING_PACKAGE",
        8: "INSTALLING_UPDATE",
        AWAITING_USER_ACTION: 6,
        CHECKING_FOR_UPDATE: 5,
        DOWNLOADING_PACKAGE: 7,
        ERROR: 3,
        INSTALLING_UPDATE: 8,
        IN_PROGRESS: 4,
        UPDATE_IGNORED: 2,
        UPDATE_INSTALLED: 1,
        UP_TO_DATE: 0,
    };

    protectedInterface.registerForNotification = function(status, callback) {
        if (!status) {
            err("[CodePush] registerForNotification: undefined status requested");
            return false;
        }
        if (typeof callback !== "function") {
            err("[CodePush] registerForNotification: callback is not a function");
            return false;
        }
        if (!registeredCallbacks[status]) {
            registeredCallbacks[status] = [];
        }

        registeredCallbacks[status].push(callback);
        return true;        
    };

    var onDownloadProgress = function(downloadProgress) {
        if (downloadProgress) {
            // Update "downloading" modal with current download %
            log("[CodePush] Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes);
        }
    };

    protectedInterface.initialize = function() {
        if (typeof window.codePush === "undefined") {
            err("[CodePush] missing cordova plugin!");
            return false;
        }

        protectedInterface.syncStatus = window.SyncStatus;

        // Silently check for the update, but
        // display a custom downloading UI
        // via the SyncStatus and DowloadProgress callbacks
        window.codePush.sync(onSyncStatus, null, onDownloadProgress);
    };

    return protectedInterface;
})();



var appsflyer = (function(){

	var af = {};
	var cb;
	
	/*
		https://support.appsflyer.com/hc/en-us/articles/207032126-AppsFlyer-SDK-Integration-Android
		https://support.appsflyer.com/hc/en-us/articles/207032096-Accessing-AppsFlyer-Attribution-Conversion-Data-from-the-SDK-Deferred-Deeplinking-
		{
		"af_status": "Non-organic",
		"media_source": "tapjoy_int",
		"campaign": "July4-Campaign",
		"agency": "starcomm",
		"af_siteid": null,
		"af_sub1": "subtext1",
		"af_sub2": null,
		"af_sub3": null,
		"af_sub4": null,
		"af_sub5": null,
		"freehand-param": "somevalue",
		"click_time": "2014-05-23 20:11:31",
		"install_time": "2014-05-23 20:12:16.751"
		}
	*/
	var conversionData = {};

	af.init = function() {

		if (!window.plugins || !window.plugins.appsFlyer) {

			// plugin is not installed

			return err("[appsflyer] missing cordova plugin");
		}

		if (typeof stargateConf.appstore_appid === "undefined") {
			return err("[appsflyer] missing manifest configuration: appstore_appid");
		}
		if (typeof stargateConf.appsflyer_devkey === "undefined") {
			return err("[appsflyer] missing manifest configuration: appsflyer_devkey");
	    }

	    //
	    // apInitArgs[0] => AppsFlyer Developer Key
	    // apInitArgs[1] => iOS App Store Id
	    //
		var apInitArgs = [stargateConf.appsflyer_devkey];
	    
	    if (isRunningOnIos()) {
	        apInitArgs.push(stargateConf.appstore_appid);
	    }

	    document.addEventListener('onInstallConversionDataLoaded', function(e){
		    conversionData = e.detail;
		    
		    if (typeof cb !== 'function') {
				return log("[appsflyer] callback not set!");
			}

			// send it
			try {
				cb(conversionData);
				log("[appsflyer] parameters sent to webapp callback: "+JSON.stringify(conversionData));
			}
			catch (error) {
				err("[appsflyer] callback error: "+error, error);
			}

		}, false);

		window.plugins.appsFlyer.initSdk(apInitArgs);
	};

	/**
     * @name analytics#setCallback
     * @memberof analytics
     *
     * @description Save webapp callback to be called when appsflyer data
     *
     * @param {function} callback
     */
	af.setCallback = function(callback) {
		cb = callback;
	};

	return af;

})();

/**
 * @name Stargate#setConversionDataCallback
 * @memberof Stargate
 *
 * @description Save webapp conversion data callback to be called when converion data from AppsFlyer are received.
 *              You may need to save the data you receive, becouse you'll only got that data the first time the app
 *              is run after installation.
 *              Please call this before Stargate.initialize()
 *
 * @param {function} callback
 */
stargatePublic.setConversionDataCallback = function(callback) {

	appsflyer.setCallback(callback);
};



/**
 * @namespace
 * @protected
 *
 * @description
 * Analytics is a module to track events sending it to a webapp callback.
 * It's used internally in Stargate to track events like MFP get.
 * Before using it you need to set the callback calling {@link Stargate#setAnalyticsCallback}
 * 
 */
var analytics = (function(){

	var cb;
	var ana = {};

	/**
     * @name analytics#track
     * @memberof analytics
     *
     * @description Send an event to webapp analytics callback if it's defined
     *
     * @param {object} event
     */
	ana.track = function(trackedEvent) {

		if (typeof cb !== 'function') {
			return log("[analytics] callback not set!");
		}

		// send it
		try {
			cb(trackedEvent);
		}
		catch (error) {
			err("[analytics] callback error: "+error, error);
		}
	};

	/**
     * @name analytics#setCallback
     * @memberof analytics
     *
     * @description Save webapp analytics callback to be called when an event is tracked
     *
     * @param {function} callback
     */
	ana.setCallback = function(callback) {
		cb = callback;
	};

	return ana;
})();


/**
 * @name Stargate#setAnalyticsCallback
 * @memberof Stargate
 *
 * @description Save webapp analytics callback to be called when an event inside Stargaed need to be tracked
 *
 * @param {function} callback
 */
stargatePublic.setAnalyticsCallback = function(callback) {

	analytics.setCallback(callback);
};

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
	//initMoPub: function(options, success, fail){
	//
	//},	
	
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
		var opt = [];
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
	
		var opt = [];
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
	
		var opt = [];
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
	
		var opt = [];
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
	
		var opt = [];
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
		var opt = [];
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
	
		var opt = [];
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
    stargatePublic.game = stargateModules.game._public;
    stargatePublic.file = stargateModules.file;    stargatePublic.AdManager = stargateModules.AdManager;    // Just return a value to define the module export
    return stargatePublic;
}));


