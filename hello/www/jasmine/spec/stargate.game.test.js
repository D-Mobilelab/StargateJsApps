/**
 * Created by pasquale on 01/02/16.
 */
function isRunningOnIos(){
    return window.device.platform.toLowerCase() == "ios";
}

function isRunningOnAndroid(){
    return window.device.platform.toLowerCase() == "android";
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
    return Promise.resolve(obj);
}

function promRejectWith(obj){
    return Promise.reject(obj);
}

fdescribe("Game module tests", function() {
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

    var game = stargateProtected.game;
    var initSettled,
        TEST_FOLDER_DIR,
        STORAGE_DIR,
        TEST_FOLDER_NAME = "Test";

    beforeAll(function(done){
        document.addEventListener("deviceready", function(readyEvent){
            STORAGE_DIR = cordova.file.applicationStorageDirectory;
            if(isRunningOnIos()){ STORAGE_DIR += "Documents/"; }
            done();
        });
    });

    function removeFolders(names, done){
        var counter = 0;
        for(var i = 0; i < names.length;i++){
            window.resolveLocalFileSystemURL(STORAGE_DIR + names[i], function(entry){
                entry.removeRecursively(function(result){
                    counter+=1;

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

    beforeEach(function(done) {
        done();
    });

    afterEach(function(done){
        //removeFolders(["games", "gfsdk"], done);
    });

    it("game should exists", function(done) {
        expect(game).toBeDefined();
        done();
    });

    it("game folders should exists after initialize", function(done) {
        var firstInit = game.initialize(GamifiveInfo.user)
            .then(function(results){
                console.log("game init results:", results);
                expect(results[0]).toEqual(game.GAMES_DIR);
                expect(results[1][0].path).toEqual(game.SDK_DIR+"gfsdk.min.js");
                done();
            })
            .catch(function(err){
                console.error("game init err", err);
                done();
            });
    });


    it("SDK should not be downloaded if already there", function(done) {
        var SDK_URL = "http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js";
        //var originalDownload = stargateProtected.file.download;
        //var originalFileExists = stargateProtected.file.fileExists;
        //var originalDirExists = stargateProtected.file.dirExists;

        //MOCK DOWNLOAD
        //stargateProtected.file.download = mock_file_download_success;

        //spyOn(stargateProtected.file, "download");

        var firstInit = game.initialize(GamifiveInfo.user)
            .then(function(results){
                expect(results[0]).toEqual(game.GAMES_DIR);
                expect(results[1][0].path).toEqual(game.SDK_DIR + "gfsdk.min.js");
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
    });

    it("Test game download", function(done){
        var gameObject = {
            gameID:"98r3nv9r8n3r98nv",
            url_dld:"http://www2.giochissimo.it/pask/zip/FruitSlicer.zip"
        };

        function log(){
            console.log(arguments);
        }

        game.initialize(GamifiveInfo.user)
            .then(game.download(gameObject, {onEnd:log,onStart:log,onProgress:log}))
            .then(function(results){

                done();
            }).catch(function(err){ console.error(err); done();});

    });
});
