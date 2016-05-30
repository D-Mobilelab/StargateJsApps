

stargateModules.statusbar = (function(){

    var sbProtected = {};
    
    sbProtected.initialize = function(initializeConf) {
        if (typeof window.StatusBar === "undefined") {
            // missing cordova plugin
            return err("[StatusBar] missing cordova plugin");
        }
        
        
        if (!initializeConf ||
            initializeConf.constructor !== Object ||
            Object.keys(initializeConf).length === 0) {
                
            if (stargateConf.statusbar) {
                initializeConf = stargateConf.statusbar;
            } else {
                return;
            }
        }
        
        if (typeof initializeConf.hideOnUrlPattern !== "undefined" && 
            initializeConf.hideOnUrlPattern.constructor === Array) {

            var currentLocation = document.location.href;
            var hide = false;

            for (var i=0; i<initializeConf.hideOnUrlPattern.length; i++) {

                var re = new RegExp(initializeConf.hideOnUrlPattern[i]);
                
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
        
        if (initializeConf.color) {
            //log("color: "+initializeConf.color);
            window.StatusBar.backgroundColorByHexString(initializeConf.color);
        }
    };
    
    sbProtected.setVisibility = function(visibility, callbackSuccess, callbackError) {
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
    
    return sbProtected;
})();


stargatePublic.setStatusbarVisibility = function(visibility, callbackSuccess, callbackError) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }

    return stargateModules.statusbar.setVisibility(visibility, callbackSuccess, callbackError);
};
