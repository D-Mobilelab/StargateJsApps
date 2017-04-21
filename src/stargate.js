/* globals SpinnerDialog */

/***
* 
* 
* 
*/

// current stargateVersion used by webapp to understand
//  the version to load based on cookie or localstorage
// @deprecated since 0.2.2
var stargateVersion = "2";


/**
 * when is_staging is true we log with parameters, 
 * when is false we log with only one parameter
 *   because cordova.console on android doesn't support more than 
 *   one paramenter and in release version we only can see console
 *   logs with cordova console plugin.
 */ 
var is_staging = 0;


var argsToString = function() {
    var args = Array.prototype.slice.call(arguments);
    var result = '';
    for (var i=0; i<args.length; i++) {
        if (typeof (args[i]) === 'object') {
            result += " " + JSON.stringify(args[i]);
        }
        else {
            result += " " + args[i];
        }
    }
    return result;
};

// logger function
var log = console.log.bind(window.console, "[Stargate] ");
var err = console.error.bind(window.console, "[Stargate] ");
var war = console.warn.bind(window.console, "[Stargate] ");
if (!is_staging) {
    log = function(){
        console.log("[I] [Stargate] "+argsToString.apply(null, arguments));
    };
    err = function(){
        console.log("[E] [Stargate] "+argsToString.apply(null, arguments));
    };
    war = function(){
        console.log("[W] [Stargate] "+argsToString.apply(null, arguments));
    };
}


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

function getAppIsDebug() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.AppIsDebug) {
        return new Promise(function(resolve,reject){
            window.cordova.plugins.AppIsDebug.get(
                function(appinfo){
                    resolve(appinfo);
                },
                function(error){
                    err("getAppIsDebug(): "+error, error);
                    reject(new Error(error));
                }
            );
        });
    }
    
    err("getAppIsDebug(): plugin not available!");
    return Promise.resolve({});
}

function getManifest() {
    
    if (window.cordova.file) {
        return stargateModules.file.readFileAsJSON(window.cordova.file.applicationDirectory + "www/manifest.json");
    }
    
    if (window.hostedwebapp) {
        return new Promise(function(resolve,reject){
            window.hostedwebapp.getManifest(
                function(manifest){
                    resolve(manifest);
                },
                function(error){
                    err(error);
                    reject(new Error(error));
                }
            );
        });
    }
    
    err("getManifest() no available reading mechanism!");
    return Promise.resolve({});
}

var launchUrl = function (url) {
    log("launchUrl: "+url);
    document.location.href = url;
};


var isStargateRunningInsideHybrid = false;
var isStargateInitialized = false;
var isStargateOpen = false;
var initializeCallback = null;

/**
 * appVersion: version number of the app
 */
var appVersion = '';
/**
 * appBuild: build identifier of the app
 */
var appBuild = '';
/**
 * appPackageName: package name of the app - the reversed domain name app identifier like com.example.myawesomeapp
 */
var appPackageName = '';

/**
 * appIsDebug {Boolean} true if app is compiled in debug mode
 */
var appIsDebug = false;

/**
 * InApp Purchase module type:
 *  1 => use cordova plugin https://github.com/j3k0/cordova-plugin-purchase
 *  2 => use cordova plugin https://github.com/AlexDisler/cordova-plugin-inapppurchase
 */
var stargateIapType = 0;

var STARGATEIAPTYPES = {
    /**
     * use cordova plugin https://github.com/j3k0/cordova-plugin-purchase
     */
    "full": 1,

    /**
     * use cordova plugin https://github.com/AlexDisler/cordova-plugin-inapppurchase
     */
    "light": 2,
    
    1: "full",
    2: "light"
};

/**
 * 
 * variables sent by server configuration
 * 
 */
var hybrid_conf = {},
    requested_modules = [],
    modules_conf = {};

/**
 * 
 * Application information set on initialize
 * 
 */
var appInformation = {
    cordova: null,
    manufacturer: null,
    model: null,
    platform: null,
    deviceId: null,
    version: null,
    packageVersion: null,
    packageName: null,
    packageBuild: null,
    stargate: null,
    stargateModules: null,
    stargateError: null,
    features: null
};

/**
* Set on webapp that we are hybrid
* (this will be called only after device ready is received and 
*   we are sure to be inside cordova app)
*/
var setIsHybrid = function() {   

    window.Cookies.set("hybrid", "1");
    
    var cookieDomain = getCookieDomain();
    if(cookieDomain){
        window.Cookies.set("hybrid", "1", {"domain": cookieDomain});        
    }


    if (!window.localStorage.getItem('hybrid')) {
        window.localStorage.setItem('hybrid', 1);
    }
};

var getCookieDomain = function() {
    var re = new RegExp(/(^https?:\/\/)(.*)/);
    var result = re.exec(window.location.origin);
    
    if(!result){
        return false;
    }

    var cookieDomain = result[result.length - 1]
        .split('.')
        .filter(function(el){
            return !(el === 'www' || el === 'www2');
        }).join('.');
    
    return cookieDomain;
};

/**
* Set on webapp what version we need to load
* (this will be called only after manifest is loaded on stargate)
*/
var setHybridVersion = function() {

    var stargateVersionToLoad = getStargateVersionToLoad();
    window.Cookies.set("stargateVersion", stargateVersionToLoad);

    var cookieDomain = getCookieDomain();
    if(cookieDomain){
        window.Cookies.set("stargateVersion", stargateVersionToLoad, {"domain": cookieDomain});        
    }

    if (!window.localStorage.getItem('stargateVersion')) {
        window.localStorage.setItem('stargateVersion', stargateVersionToLoad);
    }
};

var hideSplashAndLoaders = function() {
    
    
    if (! haveRequestedFeature("leavesplash")) {
        navigator.splashscreen.hide();
    }

    setBusy(false);
    
    if (typeof SpinnerDialog !== "undefined") {
        SpinnerDialog.hide();
    }
};

var onPluginReady = function (resolve) {
    log("onPluginReady() start");

    // FIXME: this is needed ??
    document.title = stargateConf.title;
    
    // set back cordova bridge mode to IFRAME_NAV overriding manifold settings
    if (isRunningOnIos() && (typeof window.cordova !== 'undefined') && window.cordova.require) {
        var exec = window.cordova.require('cordova/exec');
        if (exec.setJsToNativeBridgeMode && exec.jsToNativeModes && exec.jsToNativeModes.IFRAME_NAV) {
            exec.setJsToNativeBridgeMode(exec.jsToNativeModes.IFRAME_NAV);                    
        }
    }
    bindConnectionEvents();
    // save stargate version to load on webapp 
    setHybridVersion();

    
    if (hasFeature("mfp") && haveRequestedFeature("mfp")) {
        var mfpModuleConf = getModuleConf("mfp");
        
        // configurations needed
        //stargateConf.motime_apikey,
	  	//stargateConf.namespace,
        //stargateConf.label,
        
        // configurations needed
        //moduleConf.country
                  
        // retrocompatibility
        var keysOnStargateConf = ["motime_apikey", "namespace", "label", "country"];
        keysOnStargateConf.forEach(function(keyOnStargateConf) {
            // if it's available in stargateConf but not in module conf
            // copy it to module conf
            if (!mfpModuleConf.hasOwnProperty(keyOnStargateConf) &&
                stargateConf.hasOwnProperty(keyOnStargateConf)) {
                    
                mfpModuleConf[keyOnStargateConf] = stargateConf[keyOnStargateConf];
            }
        });
        
        MFP.check(mfpModuleConf);
    }
    
    if (hasFeature("deltadna")) {
        window.deltadna.startSDK(
            stargateConf.deltadna.environmentKey,
            stargateConf.deltadna.collectApi,
            stargateConf.deltadna.engageApi,
            onDeltaDNAStartedSuccess,
            onDeltaDNAStartedError,
            stargateConf.deltadna.settings
        );
    }

    // initialize all modules
    
    stargateModules.statusbar.initialize(
        getModuleConf("statusbar")
    );

    // In-app purchase initialization
    if (haveRequestedFeature("iapbase")) {
        // base legacy iap implementation
        IAP.initialize(
            getModuleConf("iapbase")
        );
        stargateIapType = STARGATEIAPTYPES.full;

    } else if (haveRequestedFeature("iap")) {
        // if initialize ok...
        if ( IAP.initialize( getModuleConf("iap") ) ) {
            // ...then call refresh
            // this doesn't works, so we do it when needed in iap module
            //IAP.doRefresh();
            log("Init IAP done.");
        }
        stargateIapType = STARGATEIAPTYPES.full;
        
    } else if (haveRequestedFeature("iaplight")) {
        // iap new implementation
        // (we don't need to wait for promis to fullfill)
        iaplight.initialize(
            getModuleConf("iaplight")
        );
        stargateIapType = STARGATEIAPTYPES.light;
    }

    // receive appsflyer conversion data event
    if (hasFeature('appsflyer') && haveRequestedFeature("appsflyer")) {
        appsflyer.init(
            getModuleConf("appsflyer")
        );
    }
    
    // apply webapp fixes
    webappsFixes.init();

    codepush.initialize();
    
    push.initialize();
    
    var modulePromises = [];
    
    //Game Module Init
    // if requested by caller (haveRequestedFeature)
    // if available in app (has feature)
    // if included in code (stargateModules.game)
    if (haveRequestedFeature("game") && hasFeature('game') && stargateModules.game) {
        // save initialization promise, to wait for
        modulePromises.push(
            stargateModules.game._protected.initialize(
                getModuleConf("game")
            )
        );
    }

    if (haveRequestedFeature("adv") && stargateModules.AdManager) {
        // save initialization promise, to wait for
        modulePromises.push(
            stargateModules.AdManager.initialize(
                getModuleConf("adv")
            )
        );
    }

    if (haveRequestedFeature("globalization")) {
        // save initialization promise, to wait for
        modulePromises.push(
            globalization.initialize()
        );
    }
    
    
    // wait for all module initializations before calling the webapp
    Promise.all(
            modulePromises
        )
        .then(function() {
            
            onStargateReady(resolve);
            
        })
        .catch(function (error) {
            err("onPluginReady() error: ",error);
            
            onStargateReady(resolve, error);
        });
};

var onStargateReady = function(resolve, error) {
    log("onStargateReady() start");
    
    hideSplashAndLoaders();
            
    // initialize finished
    isStargateOpen = true;
    
    log("version "+stargatePackageVersion+" ready; "+
        " running in package version: "+appVersion);
    
    appInformation = {
        cordova: runningDevice.cordova,
        manufacturer: runningDevice.manufacturer,
        model: runningDevice.model,
        platform: runningDevice.platform,
        deviceId: runningDevice.uuid,
        version: runningDevice.version,
        packageVersion: appVersion,
        packageName: appPackageName,
        packageBuild: appBuild,
        stargate: stargatePackageVersion,
        features: getAvailableFeatures().join(", ")
    };    
    if (requested_modules && requested_modules.constructor === Array) {
        appInformation.stargateModules = requested_modules.join(", ");
    }
    if (error && (error instanceof Error)) {
        appInformation.stargateError = error.toString();
    }
    if (window.navigator && window.navigator.connection && window.navigator.connection.type) {
        appInformation.connectionType = window.navigator.connection.type;
    }
    
    //execute callback
    initializeCallback(true);

    log("Stargate.initialize() done");
    resolve(true);
};

var onDeviceReady = function (resolve, reject) {
    log("onDeviceReady() start");

    // device ready received so i'm sure to be hybrid
    setIsHybrid();
    
    // get device information
    initDevice();
    
    // get connection information
    initializeConnectionStatus();

    // request all asyncronous initialization to complete
    Promise.all([
        // include here all needed asyncronous initializazion
        cordova.getAppVersion.getVersionNumber(),
        getManifest(),
        cordova.getAppVersion.getPackageName(),
        cordova.getAppVersion.getVersionCode(),
        getAppIsDebug()       
    ])
    .then(function(results) {
        // save async initialization result

        appVersion = results[0];
		
		if (typeof results[1] !== 'object') {
			results[1] = JSON.parse(results[1]);
		}
        
        appPackageName = results[2];
        appBuild = results[3];
        
        if (results[4] && ( typeof(results[4]) === 'object') ) {
            if (results[4].debug) {
                appIsDebug = true;             
            }
        }

        stargateConf = results[1].stargateConf;

        // execute remaining initialization
        onPluginReady(resolve, reject);
    })
    .catch(function (error) {
        err("onDeviceReady() error: "+error);
        reject("onDeviceReady() error: "+error);
    });
};

/**
* Check if we are running inside hybrid environment,  
* checking current url or cookies or localStorage
*/
var isHybridEnvironment = function() {
    return _isHybridEnvironment(document.location.href);
};
var _isHybridEnvironment = function(location) {

    // check url for hybrid query param
    var uri = window.URI(location);
    var protocol = uri.protocol();

    if (protocol === "file" || protocol === "cdvfile") {
        return true;
    }

    if (uri.hasQuery('hybrid')) {
        return true;
    }

    if (window.Cookies.get('hybrid')) {
        return true;
    }

    if (window.localStorage.getItem('hybrid')) {
        return true;
    }

    // FALLBACK
    if (window.navigator.userAgent.match(/Crosswalk\//) !== null) {
        war("Activated isHybrid from Crosswalk UA");
        return true;
    }

    return false;
};

var setBusy = function(value) {
    if (value) {
        startLoading();
    }
    else {
        stopLoading();
    }
};

var stargateConf = {
    features: {}
};

/**
 * getModuleConf(moduleName)
 * @param {string} moduleName - name of module to return conf of
 * @returns {object} - configuration for the module sent by Stargate implementator on Stargate.initialize()
 */
var getModuleConf = function(moduleName) {
    // 1. new version -> modules_conf
    // 2. old version -> hybrid_conf
    
    if (!moduleName) {
        return err("getModuleConf() invalid module requested");
    }
    
    if (moduleName in modules_conf) {
        return modules_conf[moduleName];
    }
    
    // covert modulesname
    var mapConfLegacy = {
        "iapbase": "IAP",
        "iap": "IAP"
    };
    
    var moduleNameLegacy = moduleName;
    if (mapConfLegacy[moduleName]) {
        moduleNameLegacy = mapConfLegacy[moduleName];
    }
    
    if (hybrid_conf && moduleNameLegacy in hybrid_conf) {
        return hybrid_conf[moduleNameLegacy];
    }
    
    log("getModuleConf(): no configuration for module: "+moduleName+" ("+mapConfLegacy+")");
    return {};
};

/**
 * hasFeature(feature)
 * @param {string} feature - name of feature to check
 * @returns {boolean} - true if app have feature requested (it check inside the manifest compiled in the app) 
 */
var hasFeature = function(feature) {
    return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
};

/**
 * getAvailableFeatures()
 * @returns {Array} - list of features enabled on native (features map on manifest.json)
 */
var getAvailableFeatures = function() {
    var availableFeatures = [];
    for (var feature in stargateConf.features) {
        if (stargateConf.features.hasOwnProperty(feature)) {
            if (stargateConf.features[feature]) {
                availableFeatures.push(feature);
            }
        }
    }
    return availableFeatures;
};

/**
 * haveRequestedFeature(feature)
 * @param {string} feature - name of feature to check
 * @returns {boolean} - true if implementator of Stargate requested the feature (it check against the configuration.modules array sent as paramenter of Stargate.initialize())
 * 
 * possible values: "mfp","iapbase","iap","appsflyer","webappanalytics","game" 
 */
var haveRequestedFeature = function(feature) {
    if (requested_modules && requested_modules.constructor === Array) {
        return requested_modules.indexOf(feature) > -1;
    }
    return false;
};
