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