var push = (function(){
    
	var protectedInterface = {};

    var initPromise = null;

    var clickEventFunc = function() {
        // * read url saved
        var savedUrl = getSavedUrl();

        // * log push clicked event
        analytics.track({
            page: savedUrl,
            action: 'PushOpen'
        });

        // * load url in webview
        log("[push] going to url: ", savedUrl);
		launchUrl(savedUrl);
    };

    var pluginExistsFunc = function() {
        return window.cordova && window.cordova.plugins && window.cordova.plugins.notification && window.cordova.plugins.notification.local;
    };

    var fixedLocalPushId = 1;

    var localStorageDeeplinkName = "stargatePushUrl";

    var getSavedUrl = function() {
        return window.localStorage.getItem(localStorageDeeplinkName);
    };
    var setSavedUrl = function(url) {
        return window.localStorage.setItem(localStorageDeeplinkName, url);
    };

    /**
     * @param {object} initializeConf - configuration sent by
     * @return {boolean} - true if init ok
     */
	protectedInterface.initialize = function() {

        if (!pluginExistsFunc()) {
            return Promise.reject(" not available, missing cordova plugin.");
        }

        if (initPromise !== null) {
            return initPromise;
        }

        initPromise = new Promise(function(resolve){
            
            window.cordova.plugins.notification.local.on("click", clickEventFunc);
            resolve();
        });

        return initPromise;
    };
    
    protectedInterface.setScheduledNotify = function(params) {
        
        if (initPromise === null) {
            return Promise.reject("Not initialized");
        }

        if (typeof params !== 'object') {
            return Promise.reject("[push] params must be an object");
		}
        
        var reqParams = ["title", "text", "date", "deeplink"];
        for (var i=0; i < reqParams.length; i++) {
            if (!params[reqParams[i]]) {
                return Promise.reject("[push] params."+reqParams[i]+" required!");
            }
        }
        // FIXME: check that date is a js Date object

        var scheduleFunc = function() {
            return new Promise(function(resolve){
                
                setSavedUrl(params.deeplink);

                window.cordova.plugins.notification.local.schedule({
                    id: fixedLocalPushId,
                    title: params.title,
                    text: params.text,
                    at: params.date
                });
                resolve(true);
            }); 
        };

        // wait for initPromise if it didn't complete
        return initPromise.then(scheduleFunc);
    };

    /**
     * 
     * Check that stargate is properly initialized befor calling the function innerMethod
     */
    var checkDecorator = function(innerMethod) {
        return function () {

            if (!isStargateInitialized) {
                return Promise.reject("Stargate not initialized, call Stargate.initialize first!");
            }
            if (!isStargateOpen) {
                return Promise.reject("Stargate closed, wait for Stargate.initialize to complete!");
            }

            return innerMethod.apply(null, arguments);
        };
    };

    protectedInterface.public = {
        "initialize": checkDecorator(protectedInterface.initialize),
        "setScheduledNotify": checkDecorator(protectedInterface.setScheduledNotify)
    };

    protectedInterface.__clean__ = function() {
        initPromise = null;
    };

    return protectedInterface;
})();

stargatePublic.push = push.public;
