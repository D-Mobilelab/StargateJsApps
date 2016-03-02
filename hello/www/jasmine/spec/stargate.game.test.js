/**
 * Created by pasquale on 01/02/16.
 */

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
document.head.appendChild(metaTag);

function isRunningOnIos(){
    return window.device.platform.toLowerCase() == "ios";
}

function isRunningOnAndroid(){
    return window.device.platform.toLowerCase() == "android";
}
var gameObject =
{
    "id":"4de756a55ac71f45c5b7b4211b71219e",
    "title":"Fruit Slicer",
    "description":"Slice fruits, make combos & break records!",
    "publisher":{
        "title_publisher":"alexanderPorubov",
        "url_publisher":"#!\/publisher\/alexanderPorubov"
    },
    "description_short":"Slice fruits, make combos & break records!",
    "images":{
        "screenshot":[
            "http:\/\/s2.motime.com\/p\/bcontents\/absimageappscreenshot0_8\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/bc3519c2-38d3-4378-a23d-fe06396b3932\/fruit-slicer.bin?v=1455555646",
            "http:\/\/s2.motime.com\/p\/bcontents\/absimageappscreenshot0_8\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/546e2a1e-d52d-4983-973d-71babf723107\/fruit-slicer.bin?v=1455555646",
            "http:\/\/s2.motime.com\/p\/bcontents\/absimageappscreenshot0_8\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/cc67c3ba-a2d7-4b17-abb7-01f2b885b744\/fruit-slicer.bin?v=1455555646"
        ],
        "cover":{
            "ratio_1_4":"http:\/\/s2.motime.com\/p\/bcontents\/absimageapp1_4\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/c5e35302-5776-4a9d-bf4c-3501e2dce850\/fruit-slicer.bin?v=1455555646",
            "ratio_0_7":"http:\/\/s2.motime.com\/p\/bcontents\/absimageapp0_7\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/7a02027e-7998-4d86-82ac-4e035cb495db\/fruit-slicer.bin?v=1455555646",
            "ratio_1":"http:\/\/s2.motime.com\/p\/bcontents\/absimageapp1\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/bb9ce100-9250-4875-8db7-8d72628f0d51\/fruit-slicer.bin?v=1455555646",
            "ratio_2":"http:\/\/s2.motime.com\/p\/bcontents\/absimageapp2\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/4d9f5cc2-35ac-4da1-98c6-464afd7d84dd\/fruit-slicer.bin?v=1455555646",
            "ratio_1_5":"http:\/\/s2.motime.com\/p\/bcontents\/absimageapp1_5\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/9b26ea5e-874b-4137-9c12-8ed66e54cf8d\/fruit-slicer.bin?v=1455555646"
        },
        "icon":"http:\/\/s2.motime.com\/p\/bcontents\/absimageappicon\/h[HSIZE]\/w[WSIZE]\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2014\/8\/27\/16\/44\/3a87847e-b08a-4c6f-822b-8e9bd1314e23\/fruit-slicer.bin?v=1455555646"
    },
    "category":{
        "id_category":"0ea1cbfb288aee1a1cc1579f97696dc7",
        "name_category":"Beat the score",
        "cs_id":"0eea88cf-d140-461e-98eb-62735f12d75e",
        "born_date_category":"Mon, 16 Nov 2015 10:58:45 -0000",
        "inserted_date_category":"Fri, 11 Dec 2015 14:17:05 -0000",
        "source_id":"alfresco_xx_gameasy_Beat the score",
        "supplier_id":"alfresco",
        "url_cover":"http:\/\/s2.motime.com\/p\/bcontents\/absimageappraw\/h1\/w1\/xx_gameasy\/mnt\/alfresco_content_prod\/contentstore\/2016\/2\/15\/12\/53\/0576ffb9-f5ab-438d-8752-ff460752c68a\/beat-the-score.bin?v=1455555402",
        "url_category":"#!\/category\/0ea1cbfb288aee1a1cc1579f97696dc7\/Beat+the+score",
        "url_leaf_engine_subscription_category":"",
        "url_preview_big_category":"",
        "url_preview_small_category":""
    },
    "url_zoom":"#!\/games\/fruit-slicer_4de756a55ac71f45c5b7b4211b71219e",
    "url_zoom_simple":"fruit-slicer_4de756a55ac71f45c5b7b4211b71219e",
    "img_qrcode":"\/qrcode?text=%2Fsetwelcome%3Freturn_url%3D%252F%2523%2521%252Fgames%252Ffruit-slicer_HA990001689",
    "url_share":"\/share\/games\/fruit-slicer_HA990001689",
    "url_leaf_engine_subscription":"\/subscribe\/content\/HA990001689",
    "url_api_dld":"\/v01\/contents\/4de756a55ac71f45c5b7b4211b71219e\/download?formats=html5applications",
    "size":"7,17 MB",
    "alfresco_id":"HA990001689",
    "counters_matches":91,
    "counters_favourites":0,
    "cs_id":"HA990001689",
    "url_play":"\/html5gameplay\/4de756a55ac71f45c5b7b4211b71219e\/game\/fruit-slicer",
    "has_sdk":true,
    "format":"html5applications",
    "access_type":{
        "guest":false,
        "free":false,
        "premium":true
    },
    "offline_available":true,


    response_api_dld: {
        "status":200,
        "url_download":"http:\/\/www2.gameasy.com\/ww\/html5gameplay\/01\/93\/019315303f5014ee53877ca1ff9d96b3\/xx_gameasy\/game\/Juicy_dash_boungourno\/juicy_dash_index.html",
        "binary_url":"http:\/\/s2.motime.com\/p\/bcontents\/appsdownload\/xx_gameasy\/2015\/10\/22\/13\/2\/1086a078-207c-41a8-b24f-9ed1afd17176\/juicy-dash.bin?v="+Date.now(),
        "binary_md5":"e8a852d5b1cee637d5b17ce813113083",
        "message":"WEBAPP_CONTENT_DOWNLOAD_STARTED"
    }
};

function createFolder(where, name){
    return new Promise(function(resolve,reject){
        window.resolveLocalFileSystemURL(where,
            function(dirEntry){
                dirEntry.getDirectory(name, {create:true},
                    function(entry){
                        resolve(entry);
                    }, function(err){
                        reject(err);
                    }
                );
            },
            function(err){
                reject(err);
            });
    });
}

function mock_file_download_success(url, filepath, saveAsName, _onProgress){
    console.log("DOWNLOAD MOCK", url, filepath, saveAsName, _onProgress);
    var transformedObj = {
        path:filepath + saveAsName,
        internalURL:"cdv:xxx",
        isFile:true,
        isDirectory:false
    };
    return Promise.resolve(new Array(transformedObj));
}

function promResolvedWith(obj){
    return function(){
        return Promise.resolve(obj);
    }
}

function promRejectWith(obj){
    return Promise.reject(obj);
}

function fileExists(url){
    return new Promise(function(resolve){
        window.resolveLocalFileSystemURL(url, function(entry){

            resolve(entry.isFile);

        }, function(fileError){
            resolve(fileError.code !== 1);
        });
    });
}

function dirExists(url){
    return new Promise(function(resolve){
        window.resolveLocalFileSystemURL(url, function(entry){

            resolve(entry.isDirectory);

        }, function(fileError){
            resolve(fileError.code !== 1);
        });
    });
}

function readDir(url){
    return new Promise(function(resolve, reject){
        window.resolveLocalFileSystemURL(url, function(dirEntry){
                var reader = dirEntry.createReader();
                reader.readEntries(function(entries){
                    resolve(entries);
                }, reject);
        }, reject);
    });
}
var GamifiveInfo = {"label":"it_igames",
    "contentId":"4de756a55ac71f45c5b7b4211b71219e",
    "userId":"aac3121ebf5111e5a728005056b60712",
    "fbUserId":null,
    "fbAppId":"497938953670292",
    "fbConnected":false,
    "requireFbConnect":true,
    "fbExternal":false,
    "userFreemium":false,
    "challenge":{"id":null},
    "game":{"title":"Fruit Slicer"},
    "dictionary": {
        "messageOfFbChallenge":"Il mio punteggio \u00e8 %s, prova a battermi!",
        "matchLeftSingular":"hai ancora solo <span>%s<\/span> partita",
        "matchLeftPlural":"hai ancora <span>%s<\/span> partite per allenarti!",
        "matchLeftNone":"Non hai pi\u00f9 crediti! :("
    },
    "user":
    {"userId":"aac3121ebf5111e5a728005056b60712",
        "fbUserId":null,
        "fbConnected":false,
        "userFreemium":false,
        "nickname":"william_40e33",
        "avatar":{
            "src":"http:\/\/s2.motime.com\/img\/wl\/webstore_html5game\/images\/avatar\/big\/avatar_05.png?v=20150610133322",
            "name":"avatar_05.png"}
    }
};

describe("Game module tests", function() {
    function removeFolders(names, done){
        var counter = 0;
        for(var i = 0; i < names.length;i++){
            window.resolveLocalFileSystemURL(STORAGE_DIR + names[i], function(entry){
                entry.removeRecursively(function(result){
                    counter += 1;
                    if(counter == names.length){
                        done();
                    }
                },function(){
                    done();
                });

            }, function(){
                done();
            });
        }
    }
    var game = stargateModules.game._public;
    game.initialize = stargateModules.game._protected.initialize;
    var TEST_FOLDER_DIR,
        STORAGE_DIR,
        GAMES_DIR,
        SDK_DIR,
        TEST_FOLDER_NAME = "Test";

    beforeAll(function(done){
        document.addEventListener("deviceready", function(readyEvent){
            STORAGE_DIR = cordova.file.applicationStorageDirectory;
            if(isRunningOnIos()){ STORAGE_DIR += "Documents/"; }
            GAMES_DIR = STORAGE_DIR + "gfsdk/";
            SDK_DIR = STORAGE_DIR + "games/";
            done();
        });
    });

    beforeEach(function(done) {
        done();
    });

    afterEach(function(done){
        //removeFolders(["scripts", "games"], done);
    });

    it("Game should exists", function(done) {
        expect(game).toBeDefined();
        done();
    });

    it("Game folders should exists after initialize", function(done) {
        game.initialize(GamifiveInfo.user)
            .then(function(results){
                console.log("game init results:", results[0][0], results[1][0]);
                var secondResult = results[1][0];
                var firstResult = results[0][0];
                return Promise.all([fileExists(secondResult.path),dirExists(firstResult.path)]);
            })
            .then(function(res){
                expect(res[0]).toEqual(true);
                expect(res[1]).toEqual(true);
                done();
            })
            .catch(function(err){
                console.error("game init err", err);
                done();
            });
    });

/*    it("SDK should not be downloaded if already there", function(done) {
        var SDK_URL = "http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js";
        //var originalDownload = stargateProtected.file.download;
        //var originalFileExists = stargateProtected.file.fileExists;
        //var originalDirExists = stargateProtected.file.dirExists;

        //MOCK DOWNLOAD
        //stargateProtected.file.download = mock_file_download_success;

        //spyOn(stargateProtected.file, "download");

        var firstInit = game.initialize(GamifiveInfo.user)
            .then(function(results){
                console.log(results[0][0]);
                console.log(results[1][0]);

                expect(results[1][0].path).toEqual(GAMES_DIR);
                expect(results[0][0].path).toEqual(SDK_DIR);
            }).then(function(){

                //MOCK FILE EXISTS AND DIREXISTS
                //stargateProtected.fileExists = promResolvedWith(true);
                //stargateProtected.dirExists = promResolvedWith(true);
                return game.initialize(GamifiveInfo.user);
            })
            .then(function(results){
                expect(results).toBeDefined();

                //if returns true the file/dirs already exists
                expect(results[0]).toBe(true);
                expect(results[1]).toBe(true);

                //restore original reference
                //stargateProtected.file.download = originalDownload;
                //stargateProtected.fileExists = originalFileExists;
                //stargateProtected.dirExists = originalDirExists;
                done();
            })
            .catch(function(err){
                console.error("game init err", err);
                //stargateProtected.file.download = originalDownload;
                //stargateProtected.fileExists = originalFileExists;
                //stargateProtected.dirExists = originalDirExists;
                done();
            });
    });*/

    it("Test abortDownload", function(done){

        game.initialize(GamifiveInfo.user)
            .then(function(){
                game.download(gameObject);

                setTimeout(function pippo(){
                    var res = game.abortDownload();
                    expect(res).toBe(true);
                    done();
                }, 100);
            });
    });

    it("Test abortDownload should not to abort if is not downloading", function(done){

        game.initialize(GamifiveInfo.user);

                setTimeout(function pippo(){
                    var res = game.abortDownload();
                    expect(res).toBe(false);
                    done();
                }, 500);
    });

    fit("Should play",function(done){
        game.initialize()
            .then(function(results){
                console.log("step1", results);
                return results;
            }).then(function(results){
                return game.download(gameObject);
            }).then(function(result){
                console.log(result);
                expect(result).toBeDefined();
                done();
            }).catch(function(reason){
                console.log(reason);
                done();
            });
    });

    /*it("Test download game already exists", function(done){

        game.initialize(GamifiveInfo.user)
            .then(function(results){
               console.log(results);
               return createFolder(GAMES_DIR, gameObject.id);
            })
            .then(function(result){
                return game.download(gameObject);
            })
            .catch(function(reason){
                expect(reason).toEqual({12:"AlreadyExists",gameID:gameObject.id});
                done();
            });
    });*/

    /* it("Test simple game download(save meta.json)", function(done){

        var cbks = {
            onEnd:function(e){console.log(e);},
            onStart:function(e){console.log(e);},
            onProgress:function(e){console.log(e);}
        };

        game.initialize()
            .then(function(results){
                console.log("Initialize results", results);
                return game.download(gameObject, cbks);
            })
            .then(function(results){
                console.log("AAAAAAAAAAAAAAA", results);
                done();
            });

    });*/

 //   it("Should download the game, and modify the index.html with local sdk",function(done){
 //       game.initialize()
 //           .then(function(){
 //               return game.download(gameObject, {onEnd:function(e){console.log("DONE",e.type);}});
 //           })
 //           .then(function(result){
 //               expect(result).toBeDefined();
 //               var gamePath = GAMES_DIR + gameObject.id;
 //               done();
 //           }).catch(function(reason){
 //               console.error(reason);
 //           });
 //   });
});
