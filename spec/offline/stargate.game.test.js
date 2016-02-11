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
            gameID:"94904060fe5d50dd6c22b927c6a7c71d",
            url_api_dld:"http://www2.giochissimo.it/pask/zip/FruitSlicer.zip",
            images: {
                screenshot: [
                    "http://s2.motime.com/p/bcontents/absimageappscreenshot1_5/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/51/51a21222-f6be-40b3-8267-fd3228ab0275/prohibition-1930.bin?v=1450266963",
                    "http://s2.motime.com/p/bcontents/absimageappscreenshot1_5/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/52/86e1c95a-cbba-4875-b528-0ecf029bf96d/prohibition-1930.bin?v=1450266963",
                    "http://s2.motime.com/p/bcontents/absimageappscreenshot1_5/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/49/2d642371-2960-435f-ac7c-b4e4923d81a1/prohibition-1930.bin?v=1450266963"
                ],
                cover: {
                    ratio_1_4:"http://s2.motime.com/p/bcontents/absimageapp1_4/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/50/42624bdc-c47f-437d-bcbb-e1a7b3d48d3f/prohibition-1930.bin?v=1450266963",
                    ratio_0_7:"http://s2.motime.com/p/bcontents/absimageapp0_7/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/51/148348cd-05e3-4378-bae8-b7648ffa9f1f/prohibition-1930.bin?v=1450266963",
                    ratio_1: "http://s2.motime.com/p/bcontents/absimageapp1/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/51/d2179a25-f07d-422c-adbc-7cb1bb001b62/prohibition-1930.bin?v=1450266963",
                    ratio_2: "http://s2.motime.com/p/bcontents/absimageapp2/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/50/080d3dce-c136-4584-8c6f-85bc8ade1539/prohibition-1930.bin?v=1450266963",
                    ratio_1_5:"http://s2.motime.com/p/bcontents/absimageapp1_5/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/52/1651accd-dc66-4177-b57c-3f65765068b2/prohibition-1930.bin?v=1450266963"
                },
                icon: "http://s2.motime.com/p/bcontents/absimageappicon/h[HSIZE]/w[WSIZE]/xx_gameasy/mnt/alfresco_content_prod/contentstore/2014/2/25/10/52/44293609-5caa-4106-b0c9-a43da15b48e1/prohibition-1930.bin?v=1450266963"
            },
            access_type: {
                guest: false,
                free: false,
                premium: true
            }
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
