/**
 * Created by pasquale on 01/02/16.
 */
function isRunningOnIos(){
    return window.device.platform.toLowerCase() == "ios";
}

function isRunningOnAndroid(){
    return window.device.platform.toLowerCase() == "android";
}

var conf = {
    bundleGames:
    [
        "7329ebbdf49065552dac00f4f6e1be10",
        "fd9ac2e5c1aeba0b89270688569d8f6e",
        "4cf74f31e3cf4f75d33d191b78639a57"
    ]
};


var GAMES_DIR = "";

var userjson = {"data_iscr":"2016-03-11","modo_billing":null,"destinatario":"+12345678","numero":"+12345678","phone_company":"fake.xx","crediti_nonpremium":10,"crediti_nonpremium_extra":null,"data_scadenza_abb":"2016-03-18","premium_extra":null,"crediti_premium1":null,"crediti_nonpremium_rimasti":null,"points":null,"sweeps_opt_in":null,"subscription_start_date":null,"data_prossimo_rinnovo":"2016-03-18","operator":"fake.xx","mlist":null,"email":null,"privacy_agreed":false,"date_privacy_cookie_agree":null,"date_privacy_cookie_disagree":null,"data_ultimo_billing":"2016-03-11","downloads":null,"capid":null,"creativityid":null,"subscription_profile":"","chk":"","livello_utente":false,"stato_utente":1,"crediti_premium2":0,"id_operatore":0,"canDownload":true,"crediti_token_abbonamento_rimasti":10,"data_scadenza_abbonamento":"2016-03-18","data_iscr_utc":1457654400,"data_scadenza_abb_utc":1458259200,"data_prossimo_rinnovo_utc":1458259200,"data_ultimo_billing_utc":1457654400,"data_scadenza_abbonamento_utc":1458259200,"data_iscr_GMDATE":"2016-03-11T00:00:00+00:00","data_iscr_DATE":"2016-03-11T00:00:00+00:00","data_iscr_YEAR":2016,"data_iscr_HH":0,"data_iscr_MM":0,"data_iscr_SS":0,"data_iscr_MONTH":3,"data_iscr_DAY":11,"data_iscr_CDAY":11,"data_iscr_CMONTH":null,"data_iscr_postDate":"2016-03-11","data_iscr_postTime":"00:00:00","data_iscr_postSince":"10  ","data_iscr_formatted":"11  2016","data_iscr_numeric_formatted":"11\/3\/2016","data_scadenza_abb_GMDATE":"2016-03-18T00:00:00+00:00","data_scadenza_abb_DATE":"2016-03-18T00:00:00+00:00","data_scadenza_abb_YEAR":2016,"data_scadenza_abb_HH":0,"data_scadenza_abb_MM":0,"data_scadenza_abb_SS":0,"data_scadenza_abb_MONTH":3,"data_scadenza_abb_DAY":18,"data_scadenza_abb_CDAY":18,"data_scadenza_abb_CMONTH":null,"data_scadenza_abb_postDate":"2016-03-18","data_scadenza_abb_postTime":"00:00:00","data_scadenza_abb_postSince":"1  ","data_scadenza_abb_formatted":"18  2016","data_scadenza_abb_numeric_formatted":"18\/3\/2016","data_prossimo_rinnovo_GMDATE":"2016-03-18T00:00:00+00:00","data_prossimo_rinnovo_DATE":"2016-03-18T00:00:00+00:00","data_prossimo_rinnovo_YEAR":2016,"data_prossimo_rinnovo_HH":0,"data_prossimo_rinnovo_MM":0,"data_prossimo_rinnovo_SS":0,"data_prossimo_rinnovo_MONTH":3,"data_prossimo_rinnovo_DAY":18,"data_prossimo_rinnovo_CDAY":18,"data_prossimo_rinnovo_CMONTH":null,"data_prossimo_rinnovo_postDate":"2016-03-18","data_prossimo_rinnovo_postTime":"00:00:00","data_prossimo_rinnovo_postSince":"1  ","data_prossimo_rinnovo_formatted":"18  2016","data_prossimo_rinnovo_numeric_formatted":"18\/3\/2016","data_ultimo_billing_GMDATE":"2016-03-11T00:00:00+00:00","data_ultimo_billing_DATE":"2016-03-11T00:00:00+00:00","data_ultimo_billing_YEAR":2016,"data_ultimo_billing_HH":0,"data_ultimo_billing_MM":0,"data_ultimo_billing_SS":0,"data_ultimo_billing_MONTH":3,"data_ultimo_billing_DAY":11,"data_ultimo_billing_CDAY":11,"data_ultimo_billing_CMONTH":null,"data_ultimo_billing_postDate":"2016-03-11","data_ultimo_billing_postTime":"00:00:00","data_ultimo_billing_postSince":"10  ","data_ultimo_billing_formatted":"11  2016","data_ultimo_billing_numeric_formatted":"11\/3\/2016","data_scadenza_abbonamento_GMDATE":"2016-03-18T00:00:00+00:00","data_scadenza_abbonamento_DATE":"2016-03-18T00:00:00+00:00","data_scadenza_abbonamento_YEAR":2016,"data_scadenza_abbonamento_HH":0,"data_scadenza_abbonamento_MM":0,"data_scadenza_abbonamento_SS":0,"data_scadenza_abbonamento_MONTH":3,"data_scadenza_abbonamento_DAY":18,"data_scadenza_abbonamento_CDAY":18,"data_scadenza_abbonamento_CMONTH":null,"data_scadenza_abbonamento_postDate":"2016-03-18","data_scadenza_abbonamento_postTime":"00:00:00","data_scadenza_abbonamento_postSince":"1  ","data_scadenza_abbonamento_formatted":"18  2016","data_scadenza_abbonamento_numeric_formatted":"18\/3\/2016","user_billed_":true,"checkmail":0,"user":"903833c2c35a11e589cb005056b60712","msisdn":"+12345678","description_remaining_credits":"","mipuser_email":null,"fb_name":null,"auth_id":null,"nickname":"psql","avatar":"virgilio.png","subscribed":true,"logged":1,
ponyUrl:"&_PONY=13-b0c925a4c405718e7ba731340c018044000719127.000.000.0017VRNi9swEP0tq4MP22yRLH9IAV8KZVko3UKvATOWxo2ILRlZLkmX%2FPfKdja5pH%2BgrW8z8zTz5r3Bb8TY1tVTQBuQbAnNxgDhPVGxRHnUJph68NibqU8rmmgIUJtR%2BSqlrHii%2FImxxOjaDejjW48RM%2BydxVq5fgB7qlo44Mfj8drMOnvpV7FLv1GBRvsLamiaW1%2BRaByDsRHhjas%2BsJRneVGKxE49elddY7U%2FVDktKdc5SJ1q2fJCZkiZarkuCqpTkZMN0aDBYphG9MuyoFtv0Oqxnteexsg8dLqKVGEK%2Bzq4A9rq4fHb6%2FPzy%2Bvjw9uOzE9f9I5sd%2BR9%2BI5sdiSmfxqFl9K88CWzVOOK%2BH1qomZmCMbZBXRT74r5AmP4ZLrO2B9%2FgnzF432IuDvps9X3YIN3relwKS2Jd%2FOu9KNfK9KsbGX81k0XpVYFlkQk5CHGF3XqJrLDdeppAay2z08YPc%2Bxm2zwpwUxTzknCrvuZqYbbhcTfVVCKFmy6GILIKmQOedKZ1wURUt1SaOvyxHPTcjWTl23Gj3iOEYFotElZ5hKmWeoVQucpyVkIk8hizmtKMYOdUO2QhQZlYzTDRnAQ1%2BD93CKi%2F2%2Fm7%2F5bv6Vn19vhssBS8pF1CJVPAfGMBdSNZTmNC%2BagpYsJefzbw%3D%3DEND"
};

var cookiejson = {"_ga":"GA1.2.1113339269.1453287779","trkdada":"fwAAAVaeSdR7HHxvAwNKAg==","prvcflag":1,"newton-session":"%229HiA%3D1v)*ErJ%22","operator":"fake.it","mipuser":"aac3121ebf5111e5a728005056b60712","_gat":1,"b_test_id":"10003220160310_ff916827ad09d6ff90896fa27af347f0"};
function writeJson(name, object){
    return stargateModules.file.createFile(GAMES_DIR, name)
        .then(function(result){
            return stargateModules.file.write(result.path,JSON.stringify(object))
        });
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

function removeFolders(paths){
        return new Promise(function(resolve, reject){
            
            var counter = 0;
            for(var i = 0; i < paths.length;i++){
                console.log("Deleting...", paths[i]);
                window.resolveLocalFileSystemURL(paths[i], function(entry){
                    entry.removeRecursively(function(result){
                        console.log("Cleaned", result);
                        counter += 1;
                        if(counter == paths.length){
                            console.log("Now i'm finished");
                            resolve(paths);
                        }
                    },reject);
                }, reject);
            }
        });        
}
describe("Game module tests", function() {
    
    var game = stargateModules.game._public;
    game.initialize = stargateModules.game._protected.initialize;
    var TEST_FOLDER_DIR,
        STORAGE_DIR,
        SDK_DIR,
        TEST_FOLDER_NAME = "Test",
        GAMEOVER_DIR;

    beforeAll(function(done){
        document.addEventListener("deviceready", function(readyEvent){
            STORAGE_DIR = cordova.file.applicationStorageDirectory;
            if(isRunningOnIos()){ STORAGE_DIR += "Documents/"; }
            SDK_DIR = STORAGE_DIR + "scripts/";
            GAMES_DIR = STORAGE_DIR + "games/";
            GAMEOVER_DIR = STORAGE_DIR + "gameover_template";
            done();
        });
    });

    beforeEach(function() {
       console.log("beforeEach");
    });

    afterEach(function(done){
        removeFolders([SDK_DIR, GAMES_DIR, GAMEOVER_DIR]).then(function(results){
            console.log("afterEach:", results);
            done();
        }).catch(function(){console.error(arguments)});
    });

    it("Game should exists", function() {
        expect(game).toBeDefined();        
    });

    it("Test abortDownload", function(done){

        game.initialize()
            .then(function(){
                game.download(gameObject);

                setTimeout(function pippo(){
                    var res = game.abortDownload();
                    expect(res).toBe(true);
                    done();
                }, 500);
            });
    });

    it("Test abortDownload should not to abort if is not downloading", function(done){

        function check(results){
                console.log(results);
                var res = game.abortDownload();
                expect(res).toBe(false);
                done();
        }
        game.initialize().then(check);
    });

    fit("Test download game already exists", function(done){

        function check(reason){
            expect(reason).toEqual({12:"AlreadyExists",gameID:gameObject.id});
            done();
        }

        game.initialize()
            .then(function(results){
               return createFolder(GAMES_DIR, gameObject.id);
            })
            .then(function(result){
                return game.download(gameObject);
            })
            .catch(check);
    });

    it("Test configuration bundle games", function(done){
        game.initialize(conf)
            .then(function(results){
                console.log(results);
                done();
            });
    });
});

function manualTest(){
    stargateModules.game._protected.initialize(conf)
        .then(console.log.bind(console))
        .then(function(){
            return stargateModules.game._public.download(gameObject);
        })
        .then(function(){
            return Promise.all([
                writeJson("cookie.json",cookiejson),
                writeJson("user.json",userjson)
            ]);
        });
}