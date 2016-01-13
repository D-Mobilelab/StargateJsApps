
/* globals Q */

/***
* 
* 
* 
*/

// current stargateVersion 
var stargateVersion = 2;

// logger function
var log = function(msg, obj) {
    if (typeof obj !== 'undefined') {
        console.log("[Stargate] "+msg+" ",obj);
    } else {
        console.log("[Stargate] "+msg);
    }
    return true;
};
var err = function(msg, obj) {
    if (typeof obj !== 'undefined') {
        console.error("[Stargate] "+msg+" ",obj);
    } else {
        console.error("[Stargate] "+msg);
    }
    return false;
};


// device informations   // examples
var runningDevice = {
    available: false,    // true
    cordova: "",         // 4.1.1
    manufacturer: "",    // samsung
    model: "",           // GT-I9505
    platform: "",        // Android
    uuid: "",            // ac7245e38e3dfecb
    version: ""          // 5.0.1
};
var isRunningOnAndroid = function() {
    return runningDevice.platform == "Android";
};
var isRunningOnIos = function() {
    return runningDevice.platform == "iOS";
};
// - not used, enable if needed -
//var isRunningOnCordova = function () {
//    return (typeof window.cordova !== "undefined");
//};
var initDevice = function() {
    if (typeof window.device === 'undefined') {
        return err("Missing cordova device plugin");
    }
    for (var key in runningDevice) {
        if (window.device.hasOwnProperty(key)) {
            runningDevice[key] = window.device[key];
        }
    }
    return true;
};



var getManifest = function() {

    var deferred = Q.defer();

    window.hostedwebapp.getManifest(
        function(manifest){
            deferred.resolve(manifest);
        },
        function(error){
            deferred.reject(new Error(error));
            console.error(error);
        }
    );
    return deferred.promise;
};

var launchUrl = function (url) {
    log("launchUrl: "+url);
    document.location.href = url;
};

var isStargateInitialized = false;
var isStargateOpen = false;
var initializeCallback = null;
var initializeDeferred = null;

var appVersion = '';

/**
 * 
 * variables sent by server configuration
 * 
 */
var country = '',
    selector = '',
    api_selector = '',
    app_prefix = '',
    hybrid_conf = {};

/**
 * 
 * this is got from manifest
 * 
 */
var baseUrl;

var updateStatusBar = function() {

    if (typeof window.StatusBar === "undefined") {
        // missing cordova plugin
        return err("[StatusBar] missing cordova plugin");
    }
    if (typeof stargateConf.stausbar === "undefined") {
        return;
    }
    if (typeof stargateConf.stausbar.hideOnUrlPattern !== "undefined" && 
        stargateConf.stausbar.hideOnUrlPattern.constructor === Array) {

        var currentLocation = document.location.href;
        var hide = false;

        for (var i=0; i<stargateConf.stausbar.hideOnUrlPattern.length; i++) {

            var re = new RegExp(stargateConf.stausbar.hideOnUrlPattern[i]);
            
            if (re.test(currentLocation)) {
                hide = true;
                break;
            }
        }

        if (hide) {
            window.StatusBar.hide();
        }
        else {
            window.StatusBar.show();
        }
    }
};

var onPluginReady = function () {
    
    // FIXME: this is needed ??
    document.title = stargateConf.title;
    

    updateStatusBar();

    
    if (hasFeature('mfp')) {
        MFP.check();
    }

    
    if (hasFeature('deltadna')) {
        window.deltadna.startSDK(
            stargateConf.deltadna.environmentKey,
            stargateConf.deltadna.collectApi,
            stargateConf.deltadna.engageApi,

            onDeltaDNAStartedSuccess,
            onDeltaDNAStartedError,

            stargateConf.deltadna.settings
        );
    }


    navigator.splashscreen.hide();
    setBusy(false);

    IAP.initialize();

    document.cookie="hybrid=1; path=/";
    document.cookie="stargateVersion="+stargateVersion+"; path=/";

    if (window.localStorage.getItem('hybrid') !== null) {
        window.localStorage.setItem('hybrid', 1);
    }
    if (window.localStorage.getItem('stargateVersion') !== null) {
        window.localStorage.setItem('stargateVersion', stargateVersion);
    }

    // initialize finished
    isStargateOpen = true;

    //execute callback
    initializeCallback();

    initializeDeferred.resolve("Stargate.initialize() done");
};

var onDeviceReady = function () {
    initDevice();

    Q.all([
        // include here all needed initializazion
        cordova.getAppVersion.getVersionNumber(),
        getManifest()
    ])
    .then(function(results) {
        
        appVersion = results[0];
		
		if (!(typeof results[1] === 'object')) {
        	results[1] = JSON.parse(results[1]);
        }

        baseUrl = results[1].start_url;

        stargateConf = results[1].stargateConf;

        onPluginReady();
    })
    .fail(function (error) {
        err("onDeviceReady() error: "+error);
    });
};



var stargateBusy = false;

// - not used, enable if needed -
//var isBusy = function() { return stargateBusy; };

var setBusy = function(value) {
    if (value) {
        stargateBusy = true;
        startLoading();
    }
    else {
        stargateBusy = false;
        stopLoading();
    }
};

var stargateConf = {};

var hasFeature = function(feature) {
    return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
};








