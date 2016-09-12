

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
	var conversionData = {};

	af.init = function() {

		if (!window.plugins || !window.plugins.appsFlyer) {

			// plugin is not installed

			return err("[appsflyer] missing cordova plugin");
		}

		if (typeof stargateConf.appstore_appid === "undefined") {
			return err("[appsflyer] missing manifest configuration: appstore_appid");
		}
		if (typeof stargateConf.appsflyer_devkey === "undefined") {
			return err("[appsflyer] missing manifest configuration: appsflyer_devkey");
	    }

	    //
	    // apInitArgs[0] => AppsFlyer Developer Key
	    // apInitArgs[1] => iOS App Store Id
	    //
		var apInitArgs = [stargateConf.appsflyer_devkey];
	    
	    if (isRunningOnIos()) {
	        apInitArgs.push(stargateConf.appstore_appid);
	    }

	    document.addEventListener('onInstallConversionDataLoaded', function(e){
		    conversionData = e.detail;
		    
		    if (typeof cb !== 'function') {
				return log("[appsflyer] callback not set!");
			}

			// send it
			try {
				cb(conversionData);
				log("[appsflyer] parameters sent to webapp callback: "+JSON.stringify(conversionData));
			}
			catch (error) {
				err("[appsflyer] callback error: "+error, error);
			}

            if (typeof conversionData === 'object') {
				if (conversionData.cmp) {
                    window.setTimeout(function(){
                        MFP.setSession(conversionData.cmp);
                    }, 500);
                }
			}
            

		}, false);

		window.plugins.appsFlyer.initSdk(apInitArgs);
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

