/**global Promise, cordova, _modules **/
/**
 * Logger module
 * @module src/modules/Logger
 * @type {Object}
 * @example var myLogger = new Logger("ALL", "TAG");
 * myLogger.i("Somenthing", 1); // output will be "TAG" "Somenthing" 1
 * myLogger.setLevel("off") // other values OFF|DEBUG|INFO|WARN|ERROR|ALL
 */
(function(_modules){

    /**
     * @constructor
     * @alias module:src/modules/Logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * @param {String} tag - a tag to identify a log group. it will be prepended to any log function
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
     * A module representing a Logger class
     * @exports Logger
     */
    if (_modules) {
        _modules.Logger = Logger;
    } else {
        window.Logger = Logger;
    }
})(_modules);
/**
 * File module
 * @module src/modules/File
 * @type {Object}
 * @see cordova.file
 * @requires ./Logger.js
 */
(function(_modules, Logger){

    var File = {};
    var LOG;
    File.LOG = LOG = new Logger("ALL", "[File - module]");
    /**
     * ERROR_MAP
     * File.ERROR_MAP
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
     * stargateProtected.file.resolveFS
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
     * @param {String} data - the string to write into the file
     * @param {string} [overwrite=false] - overwrite
     * @returns {Promise<String|FileError>} where string is a filepath
     */
    File.appendToFile = function(filePath, data, overwrite){
        //Default
        overwrite = arguments[2] === undefined ? false : arguments[2];
        return File.resolveFS(filePath)
            .then(function(fileEntry){

                return new Promise(function(resolve, reject){
                    fileEntry.createWriter(function(fileWriter) {
                        if(!overwrite){
                            fileWriter.seek(fileWriter.length);
                        }
                        var blob = new Blob([data], {type:'text/plain'});
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
     * @returns {Promise<DOM|FileError>}
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
     *  @param {String} filePath -
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
        // one download at time for now
        var ft = new window.FileTransfer();
        ft.onprogress = _onProgress;
        File.currentFileTransfer = ft;

        return new Promise(function(resolve, reject){
            ft.download(window.encodeURI(url), filepath + saveAsName,
                function(entry){
                    resolve(__transform([entry]));
                    File.currentFileTransfer = null;
                },
                function(reason){
                    reject(reason);
                    File.currentFileTransfer = null;
                },
                true
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
                        resolve(__transform(entries));
                    }, reject);
                });
            });
    };

    /**
     * File.readFile
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
     * @returns {Promise.<FileEntry|FileError>}
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

    File.write = function(filepath, content){
        return File.appendToFile(filepath, content, true);
    };

    /**
     * __transform utils function
     * @private
     * @param {Array} entries - an array of Entry type object
     * @returns {Array.<Object>} - an array of Object
     * */
    function __transform(entries){
        return entries.map(function(entry){
            return {
                path:entry.toURL(),
                internalURL:entry.toInternalURL(),
                isFile:entry.isFile,
                isDirectory:entry.isDirectory
            };
        });
    }
    _modules.file = File;
    return File;

})(_modules, _modules.Logger);
/**globals Promise, cordova, _modules **/
/**
 * Game module
 * @module src/modules/Game
 * @type {Object}
 * @requires ./Logger.js, ./File.js,
 */
(function(fileModule, Logger, _modules){
    var baseDir,
        cacheDir,
        tempDirectory,
        publicInterface = {},
        cordovajsDir;

    var LOG = new Logger("ALL", "[Game - module]");

    /**
     * Init must be called after the 'deviceready' event
     * @returns {Promise<Array<boolean>>}
     * */
    function initialize(conf){
        LOG.d("Initialized called", conf);
        if(!fileModule){return Promise.reject("Missing file module!");}

        try{
            baseDir = window.cordova.file.applicationStorageDirectory;
            cacheDir = window.cordova.file.cacheDirectory;
            tempDirectory = window.cordova.file.tempDirectory;
            cordovajsDir = window.cordova.file.applicationDirectory + "www/cordova.js";
        }catch(reason){
            LOG.e(reason);
            return Promise.reject(reason);
        }


        LOG.i("cordova JS dir to include", cordovajsDir);
        /**
         * Putting games under Documents r/w. ApplicationStorage is read only
         * on android ApplicationStorage is r/w
         */
        if(window.device.platform.toLowerCase() == "ios"){baseDir += "Documents/";}

        publicInterface.SDK_DIR = _modules.game.SDK_DIR = baseDir + "gfsdk/";
        publicInterface.GAMES_DIR = _modules.game.GAMES_DIR = baseDir + "games/";
        publicInterface.BASE_DIR = _modules.game.BASE_DIR = baseDir;
        publicInterface.CACHE_DIR = cacheDir;
        publicInterface.TEMP_DIR = tempDirectory;
        publicInterface.CORDOVAJS_DIR = cordovajsDir;

        var SDK_URL = "http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js";

        var gamesDirTaskExists = fileModule.dirExists(publicInterface.GAMES_DIR);
        var SDKExists = fileModule.fileExists(publicInterface.SDK_DIR + "gfsdk.min.js");

        /**
         * Create directories
         * */
        var dirGames = gamesDirTaskExists.then(function(exists){
            if(!exists){
                return fileModule.createDir(publicInterface.BASE_DIR, "games");
            }else{
                return exists;
            }
        });

        var getSDK = SDKExists.then(function(exists){
            if(!exists){
                LOG.d("Getting SDK from:", SDK_URL);
                return fileModule.download(SDK_URL, publicInterface.SDK_DIR, "gfsdk.min.js");
            }else{
                LOG.d("SDK already downloaded");
                return exists;
            }
        });
        return Promise.all([dirGames,getSDK]);
    }

    /**
     * download the game and unzip it
     *
     * @param {object} gameObject - The gameObject with the url of the html5game's zip
     * @param {object} [callbacks={}] - an object with start-end-progress callbacks
     * @param [callbacks.onProgress=function(){}] - a progress function filled with the percentage
     * @param [callbacks.onStart=function(){}] - called on on start
     * @param [callbacks.onEnd=function(){}] - called when unzipped is done
     * @returns {Promise<boolean|FileError|403>} - true if all has gone good, 403 if unathorized, FileError in case can write in the folder
     * */
    function download(gameObject, callbacks){
        if(isDownloading()){ return Promise.reject(["Downloading...try later", fileModule.currentFileTransfer]);}
        var alreadyExists = fileModule.dirExists(publicInterface.GAMES_DIR + gameObject.id);

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
                var percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                _onProgress({percentage:percentage,type:type});
            };
        }

        var saveAsName = gameObject.id;
        function start(){
            var meta = _predownloadGet(gameObject.url_api_dld);
            _onStart({type:"download"});
            return meta.then(function(response){
                    //change with response.url_binary
                    LOG.d("Download:", gameObject.id);
                    return fileModule.download(response.url_binary, publicInterface.TEMP_DIR, saveAsName + ".zip", wrapProgress("download"));
                }).then(function(entriesTransformed){

                    //Unpack
                    _onStart({type:"unzip"});
                    LOG.d("unzip:", gameObject.id);
                    return fileModule._promiseZip(entriesTransformed[0].path, publicInterface.GAMES_DIR + saveAsName, wrapProgress("unzip"));
                })
                .then(function(result){

                    //Notify on end unzip
                    LOG.d("Unzip ended", result);
                    _onEnd({type:"unzip"});
                    return result;
                })
                .then(function(result){

                    //Remove the zip in the temp directory
                    LOG.d("Remove zip from:", publicInterface.TEMP_DIR + saveAsName + ".zip", "last operation result", result);
                    return fileModule.removeFile(publicInterface.TEMP_DIR + saveAsName + ".zip");
                })
                .then(function(result){

                    //Notify onEnd download
                    LOG.d("Download end");
                    _onEnd({type:"download"});
                    return result;
                })
                .then(function(){
                    LOG.d("save meta.json for:", gameObject.id);
                    return fileModule.createFile(publicInterface.GAMES_DIR + saveAsName, "meta.json")
                        .then(function(entries){
                            var info = entries[0];
                            return fileModule.write(info.path, JSON.stringify(gameObject));
                        });
                })
                .then(function(result){
                    //TODO: inject stargate?
                    LOG.d("result last operation:save meta.json", result);
                    LOG.d("InjectScripts in game:", gameObject.id, cordovajsDir);
                    return injectScripts(gameObject.id, [
                        "cdvfile://localhost/bundle/www/cordova.js",
                        "cdvfile://localhost/persistent/gfsdk/gfsdk.min.js"
                        //, "cdvfile://localhost/bundle/www/js/stargate.js"
                        ]);
                });
        }

        return alreadyExists.then(function(exists){
            if(!exists){
                return start();
            }else{
                return Promise.reject({12:"AlreadyExists",gameID:gameObject.id});
            }
        });

    }

    /**
     * Retrieve the url_binary
     *
     * @param {string} url_api_dld - the url_api_dld of the game object
     * @returns {Promise<Object|Object>}
     * */
    function _predownloadGet(url_api_dld){
        // TODO: change with a real call
        var response = {
            "status": 200,
            "url_binary":url_api_dld,
            "url_download": url_api_dld,
            "message": "WEBAPP_CONTENT_DOWNLOAD_STARTED",
            "md5":"1232qwf23t",
            "size":5678
        };
        return Promise.resolve(response);
        /*
        return new Promise(function(resolve, reject){
            LOG.d("Getting game metadata from:", url_api_dld);
            window.aja()
                .method('GET')
                .url(url_api_dld)
                .on('success', function(response){
                    resolve(response);
                })
                .on('error', function(error){
                    //change with reject when lapis are on!
                    reject(error);
                }).go();
        });
         */
    }

    /**
     * play
     *
     * @param {String} gameID - the game path in gamesDir where to look for. Note:the game is launched in the same webview
     * @returns Promise
     * */
    function play(gameID){
        LOG.d("Play", gameID);
        /*
         * TODO: check if games built with Construct2 has orientation issue
         * attach this to orientationchange in the game index.html
         * if(cr._sizeCanvas) window.cr_sizeCanvas(window.innerWidth, window.innerHeight)
         */
        var gamedir = publicInterface.GAMES_DIR + gameID;
        return fileModule.readDir(gamedir)
            .then(function(entries){
                //Search for an /index.html$/
                return entries.filter(function(entry){
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.path);
                });
            })
            .then(function(entry){
                var address = entry[0].internalURL;
                if(window.device.platform.toLowerCase() == "ios"){
                    window.location.href = address;
                }else{
                    window.navigator.app.loadUrl(address);
                }
            });
    }

    /**
     * Returns an Array of entries that match /index\.html$/i should be only one in the game directory
     * @private
     * @param {String} gameID
     * @returns {Promise<Array|FileError>}
     * */
    function _getIndexHtmlById(gameID){
        return fileModule.readDir(publicInterface.GAMES_DIR + gameID)
            .then(function(entries){
                return entries.filter(function(entry){
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.path);
                });
            });
    }

    /**
     * removeRemoteSDK from game's dom
     *
     * @private
     * @param {DocumentElement} dom - the document object
     * @returns {DocumentElement} the cleaned document element
     * */
    function _removeRemoteSDK(dom){

        var scripts = dom.querySelectorAll("script");
        var scriptTagSdk;
        for(var i = 0;i < scripts.length;i++){
            if(scripts[i].src.indexOf("gfsdk") !== -1){
                scriptTagSdk = scripts[i];
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
     * @param {DocumentElement} dom - the document where to inject scripts
     * @param {Array|String} sources - the src tag string or array of strings
     * */
    function _injectScriptsInDom(dom, sources){
        var cleanedDom = _removeRemoteSDK(dom);
        var _sources = Array.isArray(sources) === false ? [sources] : sources;
        var temp;
        LOG.d("injectScripts", _sources);
        for(var i = 0;i < _sources.length;i++){
            //TODO: better perfomance with document fragment?
            temp = document.createElement("script");
            temp.src = _sources[i];
            cleanedDom.head.appendChild(temp);
        }
        return cleanedDom;
    }

    /**
     * injectScripts in game index
     *
     * @private
     * @param {String} gameID
     * @param {Array} sources - array of src'string
     * @returns {Promise<|FileError>}
     * */
    function injectScripts(gameID, sources){
        var indexPath;
        return _getIndexHtmlById(gameID)
            .then(function(entry){
                indexPath = entry[0].path;
                return fileModule.readFileAsHTML(entry[0].path);
            })
            .then(function(dom){
                // TODO: injectLocalSDK and other scripts with one call

                LOG.d("_injectScripts"); LOG.d(dom);
                return _injectScriptsInDom(dom, sources);

            })
            .then(function(dom){
                LOG.d("Serialize dom");
                var result = new XMLSerializer().serializeToString(dom);
                var toReplace = "<html xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\">";
                result = result.replace(toReplace, "<html>");
                return result;
            })
            .then(function(htmlAsString){
                LOG.d("Write dom:",indexPath);
                return fileModule.write(indexPath, htmlAsString);
            });
    }

    /**
     * remove
     *
     * @public
     * @param {string} gameID - the game id to delete on filesystem
     * @returns {Promise<boolean|FileError>}
     * */
    function remove(gameID){
        return fileModule.removeDir(publicInterface.GAMES_DIR + gameID);
    }

    /**
     * isDownloading
     *
     * @public
     * @returns {boolean}
     * */
    function isDownloading(){
        return (fileModule.currentFileTransfer !== null || fileModule.currentFileTransfer === undefined);
    }

    /**
     * abortDownload
     *
     * @public
     * @returns {boolean}
     * */
    function abortDownload(){
        if(isDownloading()){
            fileModule.currentFileTransfer.abort();
            fileModule.currentFileTransfer = null;
            return true;
        }
        LOG.w("There's not a download operation to abort");
        return false;
    }

    /**
     * list
     *
     * @public
     * @returns {Array<Object>} - Returns an array of metainfo game object
     * */
    function list(){
        return fileModule.readDir(publicInterface.GAMES_DIR)
            .then(function(entries){
                return entries.map(function(entry){
                    //get the ids careful: there's / at the end
                    return entry.path;
                });
            }).then(function(ids){

                var jsons = ids.map(function(id){
                    return fileModule.readFileAsJSON(id + "meta.json");
                });

                return Promise.all(jsons).then(function(results){
                    return results;
                });
            });
    }

    /** definition **/
    _modules.game = {
        download:download,
        play:play,
        remove:remove,
        list:list,
        abortDownload:abortDownload,
        isDownloading:isDownloading,
        initialize:initialize,
        GAMES_DIR:"",
        SDK_DIR:"",
        BASE_DIR:"",
        LOG:LOG
    };
})(_modules.file, _modules.Logger, _modules);