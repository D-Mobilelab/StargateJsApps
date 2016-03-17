// global variable used by old stargate client
// @deprecated since v0.1.2
window.pubKey = '';
// @deprecated since v0.1.2
window.forge = '';


var initOfflinePromise;

/**
 * Initialize offline will be resolved at the deviceready event or rejected after a timeout
 * @param {object} [options={}] - an object with offline initialization options
 * @param [options.hideSplashScreen=true] - a boolean indicating to hide or not the splash screen
 * @returns {Promise<boolean>}
 * */
stargatePublic.initializeOffline = function(options){

    if(initOfflinePromise) {
        return initOfflinePromise;
    }
    
    // - start set default options -
    if (typeof options !== "object") {
        options = {};
    }
    if (! options.hasOwnProperty("hideSplashScreen")) {
        options.hideSplashScreen = true;
    }
    // -- end set default options --
    
    isStargateInitialized = true;
    initOfflinePromise = new Promise(function (initOfflineResolve) {
        document.addEventListener("deviceready", function deviceReadyOffline() {

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
                getManifest()
            ])
            .then(function(results) {
                // save async initialization result

                appVersion = results[0];
                
                if (typeof results[1] !== 'object') {
                    results[1] = JSON.parse(results[1]);
                }

                baseUrl = results[1].start_url;

                stargateConf = results[1].stargateConf;
                
                if (options.hideSplashScreen) {
                    navigator.splashscreen.hide();
                    setBusy(false);                    
                }

                // initialize finished
                isStargateOpen = true;

                log("Stargate.initializeOffline() done");

                initOfflineResolve(true);

            })
            .catch(function (error) {
                err("initializeOffline() error: "+error);
            });
        });
    });
    return initOfflinePromise;
};


/**
 * Stargate application configuration getters namespace
 */
stargatePublic.conf = {};

/**
 * Get url of webapp starting page when hybrid 
 * @returns {String}
 */
stargatePublic.conf.getWebappStartUrl = function() {
    return stargateConf.webapp_start_url;
};

/**
 * Get webapp url origin
 * @returns {String}
 */
stargatePublic.conf.getWebappOrigin = function() {
    var re = /http:\/\/[\w]{3,4}\..*\.[\w]{2,}/;
    if(typeof stargateConf.webapp_start_url === "undefined"){
        log("Stargate is initialized? Please call this method after it");
        return "";
    }else{
        return re.exec(stargateConf.webapp_start_url)[0];
    }
};

/**
* 
* initialize(configurations, callback)
* @param {object} [configurations={}] - an object with configurations
* @param @deprecated [configurations.country=undefined] - MFP country @deprecated since 0.2.3
* @param @deprecated [configurations.hybrid_conf={}] - old configuration of modules, used by IAP @deprecated since 0.2.3 
* @param [configurations.modules=["mfp","iapbase","appsflyer"]] - array with one or more of: "mfp","iapbase","iap","appsflyer","game"
* @param [configurations.modules_conf={}] - an object with configurations for modules
* @param {Function} [callback=function(){}] - callback success
* @returns {Promise<boolean>} - true if we're running inside hybrid
*
* @deprecated initialize(configurations, pubKey, forge, callback)
*/
stargatePublic.initialize = function(configurations, pubKeyPar, forgePar, callback) {

    // parameters checking to support both interfaces:
    //    initialize(configurations, callback)
    //    initialize(configurations, pubKey, forge, callback)
    if (typeof pubKeyPar === 'function' &&
        typeof forgePar === 'undefined' &&
        typeof callback === 'undefined') {
        // second parameter is the callback
        callback = pubKeyPar;
    }

    if(typeof callback === 'undefined'){
        log("Callback success not setted. \n You can use 'then'");
        callback = function(){};
    }
    // check callback type is function
    // if not return a failing promise 
    if (typeof callback !== 'function') {
        war("Stargate.initialize() callback is not a function!");
        return Promise.reject(new Error("Stargate.initialize() callback is not a function!"));
    }

    isStargateRunningInsideHybrid = isHybridEnvironment();

    // if i'm already initialized just:
    //  * execute the callback
    //  * return a resolving promise
    if (isStargateInitialized) {
        war("Stargate.initialize() already called, executing callback.");
        
        if(callback){callback(isStargateRunningInsideHybrid);}

        return Promise.resolve(isStargateRunningInsideHybrid);
    }

    isStargateInitialized = true;
    
    if (typeof configurations !== 'object') {
        configurations = {};
    }
    
    // old configuration mechanism, used by IAP
    if(configurations.hybrid_conf){
        if (typeof configurations.hybrid_conf === 'object') {
            hybrid_conf = configurations.hybrid_conf;
        } else {
            hybrid_conf = JSON.parse(decodeURIComponent(configurations.hybrid_conf));
        }
    }
    
    if(configurations.modules){
        // save modules requested by caller,
        // initialization will be done oly for these modules
        
        // check type
        if (configurations.modules.constructor !== Array) {
            err("initialize() configurations.modules is not an array");
        }
        else {
            requested_modules = configurations.modules;
        }
    } else {
        // default modules
        requested_modules = ["mfp","iapbase","appsflyer","game"];
    }
    if(configurations.modules_conf){
        // check type
        if (typeof configurations.modules_conf !== 'object') {
            err("initialize() configurations.modules_conf is not an object");
        }
        else {
            modules_conf = configurations.modules_conf;
        }
    }
    
    // old configuration mechanism, used by MFP module
    if(configurations.country) {
        // overwrite conf
        if ("mfp" in hybrid_conf) {
            hybrid_conf.mfp.country = configurations.country;        
        }
        // define conf
        else {
            hybrid_conf.mfp = {
                "country": configurations.country
            }; 
        }
    }

    // if not running inside hybrid save the configuration then:
    //  * call the callback and return a resolving promise
    if (!isStargateRunningInsideHybrid) {

        log("version "+stargatePackageVersion+" running outside hybrid; "+
            "loaded from server version: v"+stargateVersion);

        if(callback){callback(isStargateRunningInsideHybrid);}
        
        return Promise.resolve(isStargateRunningInsideHybrid);
    }

    log("initialize() starting up, configuration: ",hybrid_conf);

    initializeCallback = callback;
    
    var initPromise = new Promise(function(resolve,reject){
        
        
        // finish the initialization of cordova plugin when deviceReady is received
        document.addEventListener('deviceready', function(){
            
            onDeviceReady(resolve, reject);
            
        }, false);
    });
    
    return initPromise;
};

stargatePublic.isInitialized = function() {
    return isStargateInitialized;
};

stargatePublic.isOpen = function() {
    return isStargateOpen;
};

stargatePublic.isHybrid = function() {
    return isHybridEnvironment();
};

stargatePublic.openUrl = function(url) {

	if (!isStargateInitialized) {
		return err("Stargate not initialized, call Stargate.initialize first!");
    }
    // FIXME: check that inappbrowser plugin is installed otherwise retunr error

    window.open(url, "_system");
};

stargatePublic.googleLogin = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    // FIXME: implement it; get code from old stargate

    err("unimplemented");
    callbackError("unimplemented");
};

var connectionStatus = {
    type: "unknown",
    networkState: "unknown"
};

var onConnectionChange;
/**
 * @param {String} type - possible values: "connectionchange"
 * @param {Function} [_onConnectionChange=function(){}]
 **/
stargatePublic.addListener = function(type, _onConnectionChange){
    if(type == "connectionchange"){
        log("onConnectionChange registered");
        onConnectionChange = _onConnectionChange ? _onConnectionChange : function(){};
    }
};

function updateConnectionStatus(theEvent){
    connectionStatus.type = theEvent.type;
    connectionStatus.networkState = navigator.connection.type;
    if(onConnectionChange){onConnectionChange(connectionStatus);}
}

window.addEventListener("online", updateConnectionStatus, false);
window.addEventListener("offline", updateConnectionStatus, false);

function initializeConnectionStatus() {
    connectionStatus.networkState = navigator.connection.type;
    
    if (navigator.connection.type === "none") {
        connectionStatus.type = "offline";
    } else {
        connectionStatus.type = "online";        
    }
}

/**
 * checkConnection function returns the updated state of the client connection
 * @param {Function} [callbackSuccess=function(){}] - callback success filled with: {type:"online|offline",networkState:"wifi|3g|4g|none"}
 * @param {Function} [callbackError=function(){}] - called if stargate is not initialize or cordova plugin missing
 * @returns {Object|boolean} connection info {type:"online|offline",networkState:"wifi|3g|4g|none"}
 * */
stargatePublic.checkConnection = function() {

    var callbackSuccess = arguments.length <= 0 || arguments[0] === undefined ? function(){} : arguments[0];
    var callbackError = arguments.length <= 1 || arguments[1] === undefined ? function(){} : arguments[1];

	if (!isStargateInitialized) {
		callbackError("Stargate not initialized, call Stargate.initialize first!");
        return false;
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    if(typeof navigator.connection === "undefined" ||
        typeof navigator.connection.getInfo !== "function"){
            
        callbackError("Missing cordova plugin");
        console.warn("Cordova Network Information module missing");
        return false;
    }

    callbackSuccess(connectionStatus);
    return connectionStatus;
};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    // FIXME: check that device plugin is installed
    // FIXME: integrate with other stargate device handling method

    var deviceID = runningDevice.uuid;
    callbackSuccess({'deviceID': deviceID});
};

stargatePublic.setStatusbarVisibility = function(visibility, callbackSuccess, callbackError) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    if (typeof window.StatusBar === "undefined") {
        // missing cordova plugin
        err("[StatusBar] missing cordova plugin");
        return callbackError("missing cordova plugin");
    }

    if (visibility) {
        window.StatusBar.show();
        return callbackSuccess("statusbar shown");
    }

    window.StatusBar.hide();
    return callbackSuccess("statusbar hided");
};


stargatePublic.getVersion = function() {
    return stargatePackageVersion;
};

/**
 * This is a decorator:
 * before calling a module's function I check that stargate is initialized for each module
 *
 * @param {Object} context - context is the "this" of the method. usually the parent
 * @param {Function} fn - fn is the function to decorate with isStargateInitialized
 * @returns {Function} the function actually called
 * */
/*function decorateWithInitialized(context, fn){
    return function(){
        if(isStargateInitialized){
            return fn.apply(context, arguments);
        }
        console.warn("[Stargate.js] - WARN! not initialize");
    };
}

// decorate the game modules: do it for all modules?
for(var fn in _modules.game){
    if(typeof _modules.game[fn] === "function"){
        _modules.game[fn] = decorateWithInitialized(_modules.game, _modules.game[fn]);
    }
}*/

/**  
 *
 *  stargatePublic.inApp* -> iap.js
 *
 */

stargatePublic.ad = new AdStargate();