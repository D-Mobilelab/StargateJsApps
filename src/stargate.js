
/* globals Q */

/***
* 
* 
* 
*/

// current stargateVersion 
var stargateVersion = "2";

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


var isStargateRunningInsideHybrid = false;
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
    if (typeof stargateConf.statusbar === "undefined") {
        return;
    }
    if (typeof stargateConf.statusbar.hideOnUrlPattern !== "undefined" && 
        stargateConf.statusbar.hideOnUrlPattern.constructor === Array) {

        var currentLocation = document.location.href;
        var hide = false;

        for (var i=0; i<stargateConf.statusbar.hideOnUrlPattern.length; i++) {

            var re = new RegExp(stargateConf.statusbar.hideOnUrlPattern[i]);
            
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
    
    // set back cordova bridge mode to IFRAME_NAV overriding manifold settings
    if (isRunningOnIos() && (typeof window.cordova !== 'undefined') && cordova.require) {
        var exec = cordova.require('cordova/exec');
        exec.setJsToNativeBridgeMode(exec.jsToNativeModes.IFRAME_NAV);
    }
    

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

    window.Cookies.set("hybrid", "1");
    window.Cookies.set("stargateVersion", stargateVersion);

    if (!window.localStorage.getItem('hybrid')) {
        window.localStorage.setItem('hybrid', 1);
    }
    if (!window.localStorage.getItem('stargateVersion')) {
        window.localStorage.setItem('stargateVersion', stargateVersion);
    }

    // apply webapp fixes
    webappsFixes.init();

    //Game Module Init
    if (hasFeature('offline-game') && stargatePublic.game) {
        stargatePublic.game.initialize({});
    }

    // initialize finished
    isStargateOpen = true;

    log("version "+stargatePackageVersion+" ready; "+
        "loaded from server version: v"+stargateVersion+
        " running in package version: "+appVersion);

    //execute callback
    // FIXME: check callback type is function
    initializeCallback(true);

    log("Stargate.initialize() done");
    initializeDeferred.resolve(true);
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
		
		if (typeof results[1] !== 'object') {
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

/**
* Check if we are running inside hybrid environment,  
* checking current url or cookies or localStorage
*/
var isHybridEnvironment = function() {

    // check url for hybrid query param
    var uri = window.URI(document.location.href);
    if (uri.hasQuery('hybrid')) {
        return true;
    }

    if (window.Cookies.get('hybrid')) {
        return true;
    }

    if (window.localStorage.getItem('hybrid')) {
        return true;
    }
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

var stargateConf = {
    features: {}
};

var hasFeature = function(feature) {
    return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
};








