

var appsflyer = (function(){

	var af = {};
	var cb;

	/*
		https://support.appsflyer.com/hc/en-us/articles/207032126-AppsFlyer-SDK-Integration-Android
		https://support.appsflyer.com/hc/en-us/articles/207032096-Accessing-AppsFlyer-Attribution-Conversion-Data-from-the-SDK-Deferred-Deeplinking-
		{
		"af_status": "Non-organic",
		"media_source": "tapjoy_int",
		"campaign": "July4-Campaign",
		"agency": "starcomm",
		"af_siteid": null,
		"af_sub1": "subtext1",
		"af_sub2": null,
		"af_sub3": null,
		"af_sub4": null,
		"af_sub5": null,
		"freehand-param": "somevalue",
		"click_time": "2014-05-23 20:11:31",
		"install_time": "2014-05-23 20:12:16.751"
		}
	*/

	af.init = function(configuration) {

		if (!window.plugins || !window.plugins.appsFlyer) {

			// plugin is not installed

			return err("[appsflyer] missing cordova plugin");
		}

		
		if (typeof stargateConf.appsflyer_devkey === "undefined") {
			return err("[appsflyer] missing manifest configuration: appsflyer_devkey");
	    }

	    //
	    // apInitArgs[0] => AppsFlyer Developer Key
	    // apInitArgs[1] => iOS App Store Id
	    //
		var apInitArgs = {
            devKey: stargateConf.appsflyer_devkey,
            isDebug: false,
            onInstallConversionDataListener: true
        };

	    if (isRunningOnIos()) {
            if (typeof stargateConf.appstore_appid === "undefined") {
                return err("[appsflyer] missing manifest configuration: appstore_appid");
            }
	        apInitArgs.appId = stargateConf.appstore_appid;
	    }

        var onInstallConversionData = function(conversionData){

            if (typeof cb !== 'function') {
                return console.log("[Stargate] [appsflyer] callback not set!");
            }

            if(window.localStorage.getItem('appsflyerSetSessionDone')){
                cb(null);
                return true;
            }

            // if(runningDevice.uuid=="2fbd1a9b9e224f94")
            //    conversionData.af_sub1="PONY=12-19a76196f3b04f1ff60e82aa1cf5f987999999END";

            // send it
            try {
                if (typeof conversionData === 'string') {
                    conversionData = JSON.parse(conversionData);
                }
                if (conversionData.type && conversionData.type == "onInstallConversionDataLoaded" && 
                    conversionData.data) {
                        conversionData = conversionData.data;
                }
                cb(conversionData);
                console.log("[Stargate] [appsflyer] parameters sent to webapp callback: "+JSON.stringify(conversionData));
            }
            catch (error) {
                console.error("[Stargate] [appsflyer] callback error: "+error, error);
            }

            console.log('[Stargate] [appsflyer] configuration:', configuration);

            if(!window.localStorage.getItem('appsflyerSetSessionDone') && configuration.autologin){

                var fieldPony = "af_sub1";
                if (configuration.fieldPony) {
                    fieldPony = configuration.fieldPony;
                }
                var fieldReturnUrl = "";
                if (configuration.fieldReturnUrl) {
                    fieldReturnUrl = configuration.fieldReturnUrl;
                }

                window.localStorage.setItem('appsflyerSetSessionDone', 1);
                if (typeof conversionData === 'object') {

                    if (conversionData[fieldPony]) {
                        var returnUrl = null;
                        if (fieldReturnUrl && conversionData[fieldReturnUrl]) {
                            returnUrl = conversionData[fieldReturnUrl];
                        }

                        window.setTimeout(function(){
                            console.log("[Stargate] [appsflyer] perform autologin");
                            
                            if (configuration.cbOnAfOkPreSession &&  (typeof configuration.cbOnAfOkPreSession === 'function')) {
                                var cbOnAfOkPreSession = configuration.cbOnAfOkPreSession;
                                cbOnAfOkPreSession();
                            }
                            MFP.setSession(conversionData[fieldPony], returnUrl);
                        }, 100);

                        return;
                    }
                }
            }
            if (configuration.cbOnAfEmptySession &&  (typeof configuration.cbOnAfEmptySession === 'function')) {
                var cbOnAfEmptySession = configuration.cbOnAfEmptySession;
                cbOnAfEmptySession();
            }

  		};
        
        var onError = function(e) {
            console.error("[Stargate] [appsflyer] plugin error: "+e, e);
        };

		window.plugins.appsFlyer.initSdk(apInitArgs, onInstallConversionData, onError);
	};

	/**
     * @name analytics#setCallback
     * @memberof analytics
     *
     * @description Save webapp callback to be called when appsflyer data
     *
     * @param {function} callback
     */
	af.setCallback = function(callback) {
		cb = callback;
	};

	return af;

})();

/**
 * @name Stargate#setConversionDataCallback
 * @memberof Stargate
 *
 * @description Save webapp conversion data callback to be called when converion data from AppsFlyer are received.
 *              You may need to save the data you receive, becouse you'll only got that data the first time the app
 *              is run after installation.
 *              Please call this before Stargate.initialize()
 *
 * @param {function} callback
 */
stargatePublic.setConversionDataCallback = function(callback) {

	appsflyer.setCallback(callback);
};
