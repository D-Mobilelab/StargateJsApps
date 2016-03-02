/**globals Promise, cordova **/
/**
 * Game module
 * @module src/modules/Game
 * @type {Object}
 * @requires ./Logger.js,./File.js
 */
(function(fileModule, Logger, _modules){
    "use strict";
    var baseDir,
        cacheDir,
        tempDirectory,
        constants = {},
        wwwDir,
        dataDir,
        stargatejsDir;

    var LOG = new Logger("ALL", "[Game - module]");

    /**
     * @constructor
     * @alias module:src/modules/Game
     * @example
     * Stargate.game.download(gameObject, {onStart:function(){},onEnd:function(){},onProgress:function(){}})
     * .then(function(results){
     *  Stargate.game.play(results[0]) // and you leave this planet
     * });
     * */
    function Game(){}

    /**
     * Init must be called after the 'deviceready' event
     * @returns {Promise<Array<boolean>>}
     * */
     function initialize(conf){
        LOG.d("Initialized called with:", conf);
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


        LOG.i("cordova JS dir to include", constants.CORDOVAJS);
        /**
         * Putting games under Documents r/w. ApplicationStorage is read only
         * on android ApplicationStorage is r/w
         */
        if(window.device.platform.toLowerCase() == "ios"){baseDir += "Documents/";}
        if(window.device.platform.toLowerCase() == "android"){tempDirectory = cacheDir;}

        constants.SDK_DIR = baseDir + "scripts/";
        constants.SDK_RELATIVE_DIR = "../../scripts/";
        constants.GAMES_DIR = baseDir + "games/";
        constants.BASE_DIR = baseDir;
        constants.CACHE_DIR = cacheDir;
        constants.TEMP_DIR = tempDirectory;
        constants.CORDOVAJS = wwwDir + "cordova.js";
        constants.CORDOVA_PLUGINS_JS = wwwDir + "cordova_plugins.js";
        constants.STARGATEJS = wwwDir + "js/stargate.js";
        constants.DATA_DIR = dataDir;

        //Object.freeze(constants);

        var SDK_URL = "http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js";

        var gamesDirTaskExists = fileModule.dirExists(constants.GAMES_DIR);
        var SDKExists = fileModule.fileExists(constants.SDK_DIR + "gfsdk.min.js");

        /**
         * Create directories
         * */
        var dirGames = gamesDirTaskExists.then(function(exists){
            if(!exists){
                return fileModule.createDir(constants.BASE_DIR, "games");
            }else{
                return exists;
            }
        });

        var getSDK = SDKExists.then(function(exists){
            if(!exists){
                LOG.d("Getting SDK from:", SDK_URL);
                return fileModule.download(SDK_URL, constants.SDK_DIR, "gfsdk.min.js");
            }else{
                LOG.d("SDK already downloaded");
                return exists;
            }
        });

        //TODO: check if scripts folder already exists
        return Promise.all([dirGames, getSDK]).then(function(results){
            LOG.d("games dir created:",results[0]);
            LOG.d("getSDK:", results[1]);
            return Promise.all([
                fileModule.copyDir(wwwDir + "plugins", constants.SDK_DIR + "plugins"),
                fileModule.copyFile(constants.CORDOVAJS, constants.SDK_DIR + "cordova.js"),
                fileModule.copyFile(constants.CORDOVA_PLUGINS_JS, constants.SDK_DIR + "cordova_plugins.js"),
                fileModule.copyFile(constants.STARGATEJS, constants.SDK_DIR + "stargate.js")
            ]);
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
        if(this.isDownloading()){ return Promise.reject(["Downloading...try later", fileModule.currentFileTransfer]);}
        var alreadyExists = fileModule.dirExists(constants.GAMES_DIR + gameObject.id);

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

        var saveAsName = gameObject.id;
        function start(){
            _onStart({type:"download"});
            LOG.d("Download:", gameObject.id, gameObject.response_api_dld.binary_url);
            return fileModule.download(gameObject.response_api_dld.binary_url, constants.TEMP_DIR, saveAsName + ".zip", wrapProgress("download"))
                .then(function(entriesTransformed){
                    //Unpack
                    _onStart({type:"unzip"});
                    LOG.d("unzip:", gameObject.id, constants.TEMP_DIR + saveAsName);
                    return fileModule._promiseZip(entriesTransformed[0].path, constants.TEMP_DIR + saveAsName, wrapProgress("unzip"));
                })
                .then(function(result){
                    //Notify on end unzip
                    LOG.d("Unzip ended", result);
                    _onEnd({type:"unzip"});

                    /** check levels of folders before index **/
                    var str = gameObject.response_api_dld.url_download;
                    var folders = str.substring(str.lastIndexOf("game"), str.length).split("/");

                    var src = "";
                    LOG.d("Get the right index folder of the game");
                    for(var i = 0; i < folders.length;i++){
                        if(isIndexHtml(folders[i])){
                            src = constants.TEMP_DIR + [saveAsName, folders[i - 1]].join("/");
                        }
                    }
                    LOG.d("Source folder in zip game",src, constants.GAMES_DIR + saveAsName);
                    return fileModule.moveDir(src, constants.GAMES_DIR + saveAsName);
                })
                .then(function(result){
                    //Remove the zip in the temp directory
                    LOG.d("Remove zip from:", constants.TEMP_DIR + saveAsName + ".zip", "last operation result", result);
                    return fileModule.removeFile(constants.TEMP_DIR + saveAsName + ".zip");
                })
                .then(function(){
                    LOG.d("Save meta.json for:", gameObject.id);
                    return fileModule.createFile(constants.GAMES_DIR + saveAsName, "meta.json")
                        .then(function(entries){
                            var info = entries[0];
                            return fileModule.write(info.path, JSON.stringify(gameObject));
                        });
                })
                .then(function(result){

                    //TODO: inject gameover css
                    LOG.d("result last operation:save meta.json", result);
                    LOG.d("InjectScripts in game:", gameObject.id, wwwDir);
                    return [
                            gameObject.id,
                            injectScripts(gameObject.id, [
                                constants.SDK_RELATIVE_DIR + "cordova.js",
                                constants.SDK_RELATIVE_DIR + "cordova_plugins.js",
                                constants.SDK_RELATIVE_DIR + "gfsdk.min.js",
                                constants.SDK_RELATIVE_DIR + "stargate.js"
                            ])
                        ];
                });
        }

        return alreadyExists.then(function(exists){
            LOG.d("Exists", exists);
            if(exists){
                return Promise.reject({12:"AlreadyExists",gameID:gameObject.id});
            }else{
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
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.path);
                });
            })
            .then(function(entry){
                LOG.d(entry);
                var address = entry[0].internalURL;
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
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.path);
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
        var temp;
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
        dom.head.appendChild(metaTag);
        for(var i = 0;i < _sources.length;i++){
            //TODO: better perfomance with document fragment?
            temp = document.createElement("script");
            temp.src = _sources[i];
            dom.head.appendChild(temp);
        }
        LOG.d("Cleaned dom:",dom);
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
                // TODO: injectLocalSDK and other scripts with one call

                LOG.d("_injectScripts"); LOG.d(dom);
                return _injectScriptsInDom(dom, sources);

            })
            .then(function(dom){
                LOG.d("Serialize dom");
                var result = new XMLSerializer().serializeToString(dom);
                var toReplace = "<html xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\"";
                result = result.replace(toReplace, "<html");
                return result;
            })
            .then(function(htmlAsString){
                LOG.d("Write dom:",indexPath,htmlAsString);
                return fileModule.write(indexPath, htmlAsString);
            });
    }

    function isIndexHtml(theString){
        var isIndex = new RegExp(/index\.html$/i);
        return isIndex.test(theString);
    }

    /**
     * remove the game directory
     *
     * @public
     * @param {string} gameID - the game id to delete on filesystem
     * @returns {Promise<boolean|FileError>}
     * */
    Game.prototype.remove = function(gameID){
        return fileModule.removeDir(constants.GAMES_DIR + gameID);
    };

    /**
     * isDownloading
     *
     * @public
     * @returns {boolean}
     * */
    Game.prototype.isDownloading = function(){
        return (fileModule.currentFileTransfer !== null || fileModule.currentFileTransfer === undefined);
    };

    /**
     * abortDownload
     *
     * @public
     * @returns {boolean}
     * */
    Game.prototype.abortDownload = function(){
        if(this.isDownloading()){
            fileModule.currentFileTransfer.abort();
            fileModule.currentFileTransfer = null;
            return true;
        }
        LOG.w("There's not a download operation to abort");
        return false;
    };

    /**
     * list
     *
     * @public
     * @returns {Array<Object>} - Returns an array of metainfo game object
     * */
    Game.prototype.list = function(){
        return fileModule.readDir(constants.GAMES_DIR)
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
    };

    Game.prototype.buildGameOver = function(datas){
        return "<div>"+datas.score+"</div>";
    };

    var _protected = {};
    _protected.initialize = initialize;
    _modules.game = {
        _protected:_protected,
        _public:new Game()
    };

})(stargateModules.file, stargateModules.Logger, stargateModules);