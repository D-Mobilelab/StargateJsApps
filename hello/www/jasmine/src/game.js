/**
 * Game namespace.
 * @namespace {Object} Game
 */
(function(parent, fileModule){
	var baseDir,
        gamesDir,
        cacheDir,
        tempDirectory,
        platform,
        publicInterface;


    /**
     * Init must be called after the 'deviceready' event
     * @throws Require file module expception
     * @returns Promise<Array<boolean>>
     * */
    function init(){
        if(!fileModule) throw new Error("File module required");
        baseDir = window.cordova.file.applicationStorageDirectory;
        cacheDir = window.cordova.file.cacheDirectory;
        tempDirectory = cordova.file.tempDirectory;

        /**
        * Putting games under Documents r/w. ApplicationStorage is read only
        * on android ApplicationStorage is r/w
        */
        if(isRunningOnIos()){
        	baseDir += "Documents/";
        }

        gamesDir = baseDir + "games/";
        publicInterface.GAMES_DIR = gamesDir;
        publicInterface.BASE_DIR = baseDir;

        //Create gfsdk directory
        var sdkURL = "http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js";
        var gaForGamesURL = "";
        // var gmenuURL = "http://www.giochissimo.it/gmenu/menu.html";
        // var gmenuCSS = "http://www.giochissimo.it/gmenu/frame.css";

        var gamesDirTaskExists = file.dirOrFileExists(gamesDir);
        var gfsdkExists = file.dirOrFileExists(baseDir + "gfsdk/gfsdk.min.js");
        var gmenuDirExists = file.dirOrFileExists(baseDir + "gmenu");

        //If not exists the games folder create it
        gamesDirTaskExists
            .then(function(exists){
                if(!exists){
                    return file.createDir(baseDir, "games");
                }
                return exists;
            });

        //If not exists, create the directory and download the sdk
        gfsdkExists
            .then(function(exists){
                if(!exists){
                    return file.createDir(baseDir, "gfsdk");
                }
                return exists;
            })
            .then(function(dirEntry){

                if(dirEntry.isDirectory){
                    return file.download(sdkURL, dirEntry, "gfsdk.min.js");
                }
                return dirEntry; // if it's not a directory it's a boolean: return it
            });

        /*
            gmenuDirExists
            .then(function(exists){
                if(!exists){return createDir(baseDir, "gmenu");}
                console.log("gmenu already downloaded");
                return exists;
            })
            .then(function(dirEntry){
                if(dirEntry.isDirectory){
                    return Promise.all([
                        download(gmenuURL, dirEntry, "menu.html"),
                        download(gmenuCSS, dirEntry, "frame.css")
                    ]);
                }
            });
        */

        return Promise.all([gamesDirTaskExists, gfsdkExists]);
    }

    /**
     * downloadGame
     *
     * @param {string} url - The url the html5game's zip
     * @param {object} [callbacks={}] - an object with start-end-progress callbacks
     * @param [callbacks.onProgress=function(){}] - a progress function filled with the percentage
     * @param [callbacks.onStart=function(){}] - called on on start
     * @param [callbacks.onEnd=function(){}] - called when unzipped is done
     * @returns Promise<Boolean> - true if all has gone good
     * */
    function downloadGame(url, callbacks){
        callbacks = callbacks ? callbacks : {};
        var _onProgress = callbacks.onProgress ? callbacks.onProgress : function(){};
        var _onStart = callbacks.onStart ? callbacks.onStart : function(){};
        var _onEnd = callbacks.onEnd ? callbacks.onEnd : function(){};

        /*
        * Decorate progress function with percentage and type operation
        */
        function wrapProgress(type){
            return function(progressEvent){
                var percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                _onProgress({percentage:percentage,type:type});
            }
        }


        var len = url.split("/").length;
        var saveAsName = url.split("/")[len - 1];
        var fileEntryZip;
        return resolveLocalFileSystemUrl(gamesDir)
            .then(function(dirEntry){
                _onStart({type:"download"});
                return file.download(url, dirEntry, saveAsName, wrapProgress("download"));
            })
            .then(function(fileEntry){

                //Unpack
                _onStart({type:"unzip"});
                fileEntryZip = fileEntry;
                var zipPath = fileEntry.toURL();
                return _promiseZip(zipPath, zipPath.split(".zip")[0] + "/", wrapProgress("unzip"));
            })
            .then(function(result){
                _onEnd(result);
                return result;
            })
            .then(function(){
                return file.removeFile(fileEntryZip);
            });
    }

    /**
     * playGame
     *
     * @param {String} gameName - the game path in gamesDir where to look for. Note:the game is launched in the same webview
     * @returns Promise
     * */
    function playGame(gameName){

        /*
        * TODO:
        * attach this to orientationchange in the game index.html
        * if(cr._sizeCanvas) window.cr_sizeCanvas(window.innerWidth, window.innerHeight)
        */
        return file.readDir(gamesDir + gameName)
            .then(function(entries){
                //Search for an index.html$
                return entries.files.filter(function(entry){
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.fullPath)
                });
            })
            .then(function(entry){
                var address = entry[0].toURL();

                console.log("Launching:", address, entry[0].toInternalURL());
                if(isRunningOnIos()){
                    window.location.href = address;
                }else{
                    window.navigator.app.loadUrl(address);
                }
            });
    }

    function manipulateIndex(dom){
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
    }

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
                .then(file.removeDir);
    }

    publicInterface = {
        GAMES_DIR:gamesDir,
        BASE_DIR:baseDir,
        downloadGame:downloadGame,
        playGame:playGame,
        removeGame:removeGame,
        init:init
    };

    /** definition **/
    parent.Game = publicInterface;

})(stargatePublic, stargatePublic.File);
