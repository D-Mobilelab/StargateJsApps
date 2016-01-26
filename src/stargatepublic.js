

// global variable used by old stargate client
// @deprecated since v2
window.pubKey = '';
// @deprecated since v2
window.forge = '';



stargatePublic.initialize = function(configurations, pubKey, forge, callback) {


    if (isStargateInitialized) {
        err("Stargate.initialize() already called!");
        return callback();
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
stargatePublic.checkConnection = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    // FIXME: check that network plugin is installed

    var networkState = navigator.connection.type;
    callbackSuccess({'networkState': networkState});
};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
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
 *
 *  stargatePublic.inApp* -> iap.js
 *
 */

stargatePublic.ad = new AdStargate();

