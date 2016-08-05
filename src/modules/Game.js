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
        querify = Utils.composeApiString,
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

    /*function getRemoteMetadata(url){
        return new Promise(function(resolve, reject){            
            var xhr = new XMLHttpRequest();
            xhr.open("HEAD", url, true);

            xhr.addEventListener("loadend", function(endEvent){
                resolve(xhr.getResponseHeader("Last-Modified"));
            });
            xhr.send(null);
        });
    }*/

    function getSDK(){
        var now = new Date();
        var sdkURLFresh = querify(CONF.sdk_url, {"v":now.getTime()});
        var dixieURLFresh = querify(CONF.dixie_url, {"v":now.getTime(), "country":"xx-gameasy"});

        return Promise.all([
            fileModule.fileExists(constants.SDK_DIR + "dixie.js"),
            fileModule.fileExists(constants.SDK_DIR + "gfsdk.min.js")
        ]).then(function(results){
            var isDixieDownloaded = results[0],
                isSdkDownloaded = results[1],
                tasks = [];
            
            if(CONF.sdk_url !== "" && !isSdkDownloaded){
                LOG.d("isSdkDownloaded", isSdkDownloaded, "get SDK", sdkURLFresh);
                tasks.push(new fileModule.download(sdkURLFresh, constants.SDK_DIR, "gfsdk.min.js").promise);
            }

            if(CONF.dixie_url !== "" && !isDixieDownloaded){
                LOG.d("isDixieDownloaded", isDixieDownloaded, "get dixie", dixieURLFresh);
                tasks.push(new fileModule.download(dixieURLFresh, constants.SDK_DIR, "dixie.js").promise);
            }
            
            return Promise.all(tasks);
        }).then(function getSdkMetaData(){
            // Getting file meta data            
            return Promise.all([
                fileModule.getMetadata(constants.SDK_DIR + "dixie.js"),        
                fileModule.getMetadata(constants.SDK_DIR + "gfsdk.min.js")
            ]);
        }).then(function checkSdkDate(results){
            var sdkMetadata = results[0],
                dixieMetadata = results[1], 
                tasks = [];
            
            var lastSdkModification = new Date(sdkMetadata.modificationTime);
            var lastDixieModification = new Date(dixieMetadata.modificationTime);
            
            // lastModification day < today then download it
            if(lastSdkModification.getDate() < now.getDate()){
                LOG.d("updating sdk", sdkURLFresh, lastSdkModification);
                tasks.push(new fileModule.download(sdkURLFresh, constants.SDK_DIR, "gfsdk.min.js").promise);
            }

            if(lastDixieModification.getDate() < now.getDate()){
                LOG.d("updating dixie", dixieURLFresh, lastDixieModification);
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
            LOG.d("Get GameInfo, fly my minipony!");
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
                    /*var info = {
                        gameId:gameObject.id,
                        size:{width:"240",height:"170",ratio:"1_4"},
                        url:gameObject.images.cover.ratio_1_4,
                        type:"cover",
                        method:"xhr" //!important!
                    };*/

                    var info = {
                        gameId:gameObject.id,
                        size:{width:"500",height:"500",ratio:"1"},
                        url:gameObject.images.cover.ratio_1,
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
                    gameObject.images.cover.ratio_1 = coverResult.internalURL;
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
                downloading = false;
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
     * @returns {Promise<String>} - The promise will be filled with the gameover html {String}     
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
                    .replace("{{game_title}}", metaJson.title)
                    .replace("{{game_title}}", metaJson.title)
                    .replace("{{url_share}}", metaJson.url_share)
                    .replace("{{url_cover}}", metaJson.images.cover.ratio_1);
                    //.replace("{{startpage_url}}", constants.WWW_DIR + "index.html");
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
                    var api_string = querify(CONF.api, obj);
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
         *  GamifiveInfo:<content_id>:{<gamifive_info>},
         *  queues:{}
         * }
         * */
        // var apiGaForGames = querify(CONF.ga_for_game_url, ga_for_games_qs);
        // var getGaForGamesTask = new jsonpRequest(apiGaForGames).prom;
        
        // var tasks = Promise.all([getGaForGamesTask, readUserJson()]);

        return readUserJson().then(function(userJson){

            if(!userJson.ponyUrl){
                LOG.w("ponyUrl in user check undefined!", userJson.ponyUrl);
                throw new Error("Not premium user");
            }

            var _PONYVALUE = userJson.ponyUrl.split("&_PONY=")[1];
            LOG.d("PONYVALUE", _PONYVALUE);
            
            var gamifive_api = querify(CONF.gamifive_info_api, {
                content_id:content_id,           
                format:"jsonp"
            });

            gamifive_api += userJson.ponyUrl;

            LOG.d("gamifive_info_api", gamifive_api);
            return new jsonpRequest(gamifive_api).prom;

        }).then(function(result){
            return result.then(function(gamifive_info){
                LOG.d("gamifiveInfo:", gamifive_info);
                return updateOfflineData({content_id:content_id, gamifive_info:gamifive_info.game_info});
            });
        });
    }

    function updateOfflineData(object){
        return fileModule.readFileAsJSON(constants.BASE_DIR + "offlineData.json")
            .then(function(offlineData){
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