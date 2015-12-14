
/* global Q */

/***
* 
* 
* 
*/

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

var getAppVersion = function() {

    var deferred = Q.defer();

    // FIXME: check if there is a fail callback

    cordova.getAppVersion(function (version) {
        log("[getAppVersionPromise] got version: "+version);
        deferred.resolve(version);
    });

    return deferred.promise;
};
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

var isStargateInitialized = false;
var isStargateOpen = false;
var initializeCallback = null;
var initializeDeferred = null;

var appVersion = '';

var country = '',
    selector = '',
    api_selector = '',
    app_prefix = '',
    hybrid_conf = {};

var onPluginReady = function () {


    // ---- start old atlantis initialize ----

    document.title = CONFIGS.label.title;
    
    StatusBar.hide();

    
    // FIXME: check how to do mfp initialization
    if (app.hasFeature('mfp')) {
        MFP.check();
    }

    
    if (app.hasFeature('deltadna')) {
        window.deltadna.startSDK(CONFIGS.label.deltadna.environmentKey, CONFIGS.label.deltadna.collectApi, CONFIGS.label.deltadna.engageApi, app.onDeltaDNAStartedSuccess, app.onDeltaDNAStartedError, CONFIGS.label.deltadna.settings);
    }

    // FIXME: stargate.ad is public ?
    if(AdStargate){
        stargatePublic.ad = new AdStargate();
    }

    navigator.splashscreen.hide();
    app.setBusy(false);

    IAP.initialize();

    document.cookie="hybrid=1; path=/";

    // initialize finished
    isStargateOpen = true;

    //FIXME: call callback when device ready arrived
    initializeCallback();
};

var onDeviceReady = function () {
    initDevice();

    // 
    var getAppVersionPromise = getAppVersion();
    var getManifestPromise = getManifest();

    Q.all([
        getAppVersionPromise,
        getManifestPromise
    ])
    .then(function(version, manifest) {
        
        appVersion = version;

        stargateConf = manifest.stargateConf;

        onPluginReady();
    })
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
    
    return initDeferred.promise;
};

stargatePublic.isInitialized = function() {
    return isStargateInitialized;
};
stargatePublic.isOpen = function() {
    return isStargateOpen;
};

stargatePublic.openUrl = function(url) {};
stargatePublic.inAppPurchase = function(productId, callbackSuccess, callbackError, createUserUrl) {};
stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {};
stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {};
stargatePublic.facebookLogin = function(scope, callbackSuccess, callbackError) {};
stargatePublic.facebookShare = function(url, callbackSuccess, callbackError) {};
stargatePublic.googleLogin = function(callbackSuccess, callbackError) {};
stargatePublic.checkConnection = function(callbackSuccess, callbackError) {};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {};



/*
var Stargate = {
    
    openUrl: function(url){
        Stargate.messages.system = new Message();
        Stargate.messages.system.exec = 'system';
        Stargate.messages.system.url = url;
        Stargate.messages.system.send();
    },
        
    inAppPurchase: function(productId, callbackSuccess, callbackError, createUserUrl){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.purchase';
        if (typeof createUserUrl !== 'undefined'){
            Stargate.messages[msgId].createUserUrl =  createUserUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },

    inAppPurchaseSubscription: function(callbackSuccess, callbackError, subscriptionUrl, returnUrl){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.purchase.subscription';
        if (typeof subscriptionUrl !== 'undefined'){
            Stargate.messages[msgId].subscriptionUrl =  subscriptionUrl;
        }
        if (typeof returnUrl !== 'undefined'){
            Stargate.messages[msgId].returnUrl =  returnUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },

    inAppRestore: function(callbackSuccess, callbackError, subscriptionUrl, returnUrl){
        var msgId = this.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.restore';
        if (typeof subscriptionUrl !== 'undefined'){
            Stargate.messages[msgId].subscriptionUrl =  subscriptionUrl;
        }
        if (typeof returnUrl !== 'undefined'){
            Stargate.messages[msgId].returnUrl =  returnUrl;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();        
    },
    
    facebookLogin: function(scope, callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.facebookLogin';
        Stargate.messages[msgId].scope = scope;
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },
    
    facebookShare: function(url, callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId(); 
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.facebookShare';
        Stargate.messages[msgId].url = url;
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },
    
    googleLogin: function(callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.googleLogin';
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },  
    
    checkConnection: function(callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.checkConnection';
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },  
    
    getDeviceID: function(callbackSuccess, callbackError){
        var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.getDeviceID';
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    },  
    
}
*/

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









