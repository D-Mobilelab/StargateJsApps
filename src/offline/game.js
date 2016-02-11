/**
 * Game namespace.
 * @namespace {Object} stargateProtected.game
 */
(function(parent, name, fileModule){
	var baseDir,
        gamesDir,
        cacheDir,
        tempDirectory,
        publicInterface;

    /**
     * Init must be called after the 'deviceready' event
     * @returns {Promise<Array<boolean>>}
     * */
    function initialize(){
        if(!fileModule) return Promise.reject("Missing stargateProtected.file module!");

        baseDir = window.cordova.file.applicationStorageDirectory;
        cacheDir = window.cordova.file.cacheDirectory;
        tempDirectory = window.cordova.file.tempDirectory;

        /**
        * Putting games under Documents r/w. ApplicationStorage is read only
        * on android ApplicationStorage is r/w
        */
        if(isRunningOnIos()){baseDir += "Documents/";}

        publicInterface.SDK_DIR = baseDir + "gfsdk/";
        publicInterface.GAMES_DIR = baseDir + "games/";
        publicInterface.BASE_DIR = baseDir;
        publicInterface.CACHE_DIR = cacheDir;
        publicInterface.TEMP_DIR = tempDirectory;

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
                return fileModule.download(SDK_URL, publicInterface.SDK_DIR, "gfsdk.min.js");
            }else{
                return exists;
            }
        });

        return Promise.all([dirGames,getSDK]);
    }

    /**
     * download
     *
     * @param {object} gameObject - The gameObject with the url of the html5game's zip
     * @param {object} [callbacks={}] - an object with start-end-progress callbacks
     * @param [callbacks.onProgress=function(){}] - a progress function filled with the percentage
     * @param [callbacks.onStart=function(){}] - called on on start
     * @param [callbacks.onEnd=function(){}] - called when unzipped is done
     * @returns {Promise<boolean>} - true if all has gone good
     * */
    function download(gameObject, callbacks){
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

        var saveAsName = gameObject.gameID;
        _onStart({type:"download"});

        return fileModule.download(gameObject.url_dld, publicInterface.GAMES_DIR, saveAsName + ".zip", wrapProgress("download"))
            .then(function(entriesTransformed){
                //Unpack
                _onStart({type:"unzip"});
                return fileModule._promiseZip(entriesTransformed[0].path, publicInterface.GAMES_DIR + saveAsName, wrapProgress("unzip"));
            })
            .then(function(result){
                _onEnd(result);
                return result;
            })
            .then(function(){
                return fileModule.removeFile(publicInterface.GAMES_DIR + saveAsName + ".zip");
            });
    }

    /**
     * play
     *
     * @param {String} gameID - the game path in gamesDir where to look for. Note:the game is launched in the same webview
     * @returns Promise
     * */
    function play(gameID){

        /*
        * TODO:
        * attach this to orientationchange in the game index.html
        * if(cr._sizeCanvas) window.cr_sizeCanvas(window.innerWidth, window.innerHeight)
        */
        return fileModule.readDir(gamesDir + gameID)
            .then(function(entries){
                //Search for an index.html$
                return entries.files.filter(function(entry){
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.fullPath);
                });
            })
            .then(function(entry){
                var address = entry[0].toInternalURL();

                if(isRunningOnIos()){
                    window.location.href = address;
                }else{
                    window.navigator.app.loadUrl(address);
                }
            });
    }

    /*function manipulateIndex(dom){
        var scripts = dom.querySelectorAll("script");
        var scriptSDK;
        for(var i = 0; i < scripts.length;i++){
            if(scripts[i].src.indexOf("gfsdk") > -1){
                scriptSDK = scripts[i];
                break;
            }
        }
        scriptSDK.src = "../../gfsdk/gfsdk.min.js";
        return dom;
    }*/

    /*
    Somenthing like that
    to rewrite the index relativized
    readHTMLFile(indexpath)
        .then(manipulateIndex)
        .then(domToString)
        .then(function(docAsString){
            resolveLocalFileSystemUrl(gamesDir + gameName + indexName)
            .then(function(fileEntry){
                writeToFile(fileEntry, docAsString);
            });
        });
    */

    function removeGame(gameID){
        return resolveLocalFileSystemUrl(gamesDir + gameID)
                .then(fileModule.removeDir);
    }

    publicInterface = {
        GAMES_DIR:"",
        BASE_DIR:"",
        download:download,
        play:play,
        removeGame:removeGame,
        initialize:initialize
    };

    /** definition **/
    parent[name] = publicInterface;

})(stargateProtected, "game",stargateProtected.file);

/*
* game.saveGamesMeta();
* game.getGamesMeta(GAMEID);
* game.download({url_dld:"", url}, callbacks);
* game.play(GAMEID)
* game.remove(GAMEID);
* game.getList()
* game.saveUserInfo(USERINFO);
* game.getUserInfo();
* game.buildGameOverTemplate({});
* game.canPlay() check if user can play o replay the game
*/
