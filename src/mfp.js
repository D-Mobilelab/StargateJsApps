/* global URI, URITemplate  */

/**
 * @namespace
 * @protected
 *
 * @description
 * MFP is used to recognize user coming from webapp.
 *
 * For example an usual flow can be:
 *  1. an user open the browser and go to our webapp;
 *  2. then he's suggested to install the app
 *  3. he's sent to the app store and install the app
 *  4. our app with Stargate integrated is opened by our user
 *  5. MFP module send an api request to the server and the user is recongized
 *  6. the previous session is restored by the MobileFingerPrint.setSession
 *
 */
var MFP = (function(){

	// contains private module members
	var MobileFingerPrint = {};

	/**
     * @name MFP#check
     * @memberof MFP
     *
     * @description Start the MFP check to see if user has a session on the server
     * @param {object} initializeConf - configuration sent by
     * @return {boolean} - true if init ok
     *
     */
	MobileFingerPrint.check = function(initializeConf){

		//if (window.localStorage.getItem('mfpCheckDone')){
		//	return;
		//}

		// country defined on main stargate.js
        var neededConfs = ["motime_apikey", "namespace", "label", "country"];
        neededConfs.forEach(function(neededConf) {
            if (!initializeConf.hasOwnProperty(neededConf)) {
                return err("[MFP] Configuration '"+neededConf+"' not defined!");
            }
            if (!initializeConf[neededConf]) {
                return err("[MFP] Configuration: '"+neededConf+"' not valid!");
            }
        });

		MobileFingerPrint.get(initializeConf);
	};

	MobileFingerPrint.getContents = function(country, namespace, label, extData){
		var contents_inapp = {};
	    contents_inapp.api_country = label;
	    contents_inapp.country = country;
	    contents_inapp.fpnamespace = namespace;
	    if (extData){
	        contents_inapp.extData = extData;
	    }

	    var json_data = JSON.stringify(contents_inapp);

	    return json_data;
	};

	MobileFingerPrint.getPonyValue = function(ponyWithEqual) {
		try {
			return ponyWithEqual.split('=')[1];
		}
		catch (e) {
			err(e);
		}
		return '';
	};

	MobileFingerPrint.setSession = function(pony){

		// get appurl from configuration
		var appUrl = stargatePublic.conf.getWebappStartUrl();
		if (window.localStorage.getItem('appUrl')){
			appUrl = window.localStorage.getItem('appUrl');
		}

		var currentUrl = new URI(appUrl);

		// stargateConf.api.mfpSetUriTemplate:
		// '{protocol}://{hostname}/mfpset.php{?url}&{pony}'
		var hostname = currentUrl.hostname();
		var newUrl = URITemplate(stargateConf.api.mfpSetUriTemplate)
	  		.expand({
	  			"protocol": currentUrl.protocol(),
	  			"hostname": hostname,
	  			"url": appUrl,
	  			"domain": hostname,
	  			"_PONY": MobileFingerPrint.getPonyValue(pony)
	  	});

		log("[MobileFingerPrint] going to url: ", newUrl);

		launchUrl(newUrl);
	};

	MobileFingerPrint.get = function(initializeConf){
		var expire = "";

	    // stargateConf.api.mfpGetUriTemplate:
	    // "http://domain.com/path.ext{?apikey,contents_inapp,country,expire}",

		var mfpUrl = URITemplate(stargateConf.api.mfpGetUriTemplate)
	  		.expand({
	  			"apikey": initializeConf.motime_apikey,
	  			"contents_inapp": MobileFingerPrint.getContents(initializeConf.country, initializeConf.namespace, initializeConf.label),
	  			"country": initializeConf.country,
	  			"expire": expire
	  	});

        window.aja()
            .url(mfpUrl)
            .type('jsonp')
            .on('success', function(response){

                log("[MobileFingerPrint] get() response: ", response);

                var ponyUrl = '';

                if (response.content.inappInfo){
                    var jsonStruct = JSON.parse(response.content.inappInfo);

                    if (jsonStruct.extData) {
                    	if (jsonStruct.extData.ponyUrl) {
                    		ponyUrl = jsonStruct.extData.ponyUrl;
                    	}
                    	if (jsonStruct.extData.return_url) {
                    		window.localStorage.setItem('appUrl', jsonStruct.extData.return_url);
                    	}
                    	if (jsonStruct.extData.session_mfp) {

                    		analytics.track({
		                    	page: 'hybrid_initialize',
		                    	action: 'MFP_get',
		                    	session_mfp: jsonStruct.extData.session_mfp
		                    });
                    	}
                    }



                    MobileFingerPrint.setSession(ponyUrl);
                }else{
                    log("[MobileFingerPrint] get(): Empty session");
                }
            })
            .on('error', function(error){
                err("[MobileFingerPrint] get() error: ", error);
            })
            .go();
	};


	return {
    setSession: MobileFingerPrint.setSession,
		check: MobileFingerPrint.check
	};

})();
