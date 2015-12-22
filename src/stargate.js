
/* global Q */

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
var isRunningOnCordova = function () {
    return (typeof window.cordova !== "undefined");
};
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



// global variable used by old stargate client
// @deprecated since v2
window.pubKey = '';
// @deprecated since v2
window.forge = '';

var getManifest = function() {

    var deferred = Q.defer();

    hostedwebapp.getManifest(
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

    if (typeof StatusBar === "undefined") {
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
            StatusBar.hide();
        }
        else {
            StatusBar.show();
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

    // FIXME: stargate.ad is public ?
    //if(AdStargate){
    //    stargatePublic.ad = new AdStargate();
    //}

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

        baseUrl = results[1].start_url;

        stargateConf = results[1].stargateConf;

        onPluginReady();
    })
    .fail(function (error) {
        err("onDeviceReady() error: "+error);
    });
};


stargatePublic.initialize = function(configurations, pubKey, forge, callback) {


    if (isStargateInitialized) {
        Q.defer().reject(new Error("Stargate.initialize() already called!"));
    }
    
    isStargateInitialized = true;

    initializeCallback = callback;
    initializeDeferred = Q.defer();


    if(configurations.country){
        country = configurations.country;
    }
    if(configurations.selector){
        selector = configurations.selector;
    }
    if(configurations.api_selector){
        api_selector = configurations.api_selector;
    }
    if(configurations.app_prefix){
        app_prefix = configurations.app_prefix;
    }
    if(configurations.hybrid_conf){
        if (typeof configurations.hybrid_conf === 'object') {
            hybrid_conf = configurations.hybrid_conf;
        } else {
            hybrid_conf = JSON.parse(decodeURIComponent(configurations.hybrid_conf));
        }
    }

    // finish the initialization of cordova plugin when deviceReady is received
    document.addEventListener('deviceready', onDeviceReady, false);
    
    return initializeDeferred.promise;
};

stargatePublic.isInitialized = function() {
    return isStargateInitialized;
};
stargatePublic.isOpen = function() {
    return isStargateOpen;
};

stargatePublic.openUrl = function(url) {

    // FIXME: check that inappbrowser plugin is installed otherwise retunr error

    window.open(url, "_system");
};

stargatePublic.googleLogin = function(callbackSuccess, callbackError) {

    // FIXME: implement it; get code from old stargate

    err("unimplemented");
    callbackError("unimplemented");
};
stargatePublic.checkConnection = function(callbackSuccess, callbackError) {

    // FIXME: check that network plugin is installed

    var networkState = navigator.connection.type;
    callbackSuccess({'networkState': networkState});
};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {

    // FIXME: check that device plugin is installed
    // FIXME: integrate with other stargate device handling method

    var deviceID = device.uuid;
    callbackSuccess({'deviceID': deviceID});
};



var stargateBusy = false;
var isBusy = function() { return stargateBusy; };

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








