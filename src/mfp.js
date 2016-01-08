/* global URI, URITemplate  */


var MFP = {

	check: function(){

		//if (window.localStorage.getItem('mfpCheckDone')){
		//	return;
		//}

		// country defined on main stargate.js
		if (country) {		
			MFP.get(country);
		}else{
			err("Country not defined!");
		}
	},

	getContents: function(country, namespace, label, extData){
		var contents_inapp = {};
	    contents_inapp.api_country = label;
	    contents_inapp.country = country;
	    contents_inapp.fpnamespace = namespace;
	    if (extData){
	        contents_inapp.extData = extData;
	    }
	    
	    var json_data = JSON.stringify(contents_inapp);
	       
	    return json_data;
	},

	getPonyValue: function(ponyWithEqual) {
		try {
			return ponyWithEqual.split('=')[1];
		}
		catch (e) {
			err(e);
		}
		return '';
	},

	set: function(pony){

		// baseUrl: read from main stargate.js
		var appUrl = baseUrl;
		if (window.localStorage.getItem('appUrl')){
			appUrl = window.localStorage.getItem('appUrl');
		}

		var currentUrl = new URI(baseUrl);

		// stargateConf.api.mfpSetUriTemplate:
		// '{protocol}://{hostname}/mfpset.php{?url}&{pony}'
		var hostname = currentUrl.hostname();
		var newUrl = URITemplate(stargateConf.api.mfpSetUriTemplate)
	  		.expand({
	  			"protocol": currentUrl.protocol(),
	  			"hostname": hostname,
	  			"url": appUrl,
	  			"domain": hostname,
	  			"_PONY": MFP.getPonyValue(pony)
	  	});
				
		log("MFP going to url: ", newUrl);

		launchUrl(newUrl);
	},

	get: function(country){
		var expire = "";

	    // stargateConf.api.mfpGetUriTemplate:
	    // "http://domain.com/path.ext{?apikey,contents_inapp,country,expire}",

		var mfpUrl = URITemplate(stargateConf.api.mfpGetUriTemplate)
	  		.expand({
	  			"apikey": stargateConf.motime_apikey,
	  			"contents_inapp": MFP.getContents(country, stargateConf.namespace, stargateConf.label),
	  			"country": country,
	  			"expire": expire
	  	});


	  	reqwest({
		    url: mfpUrl,
		  	type: 'jsonp',
			method: 'get',
			error: function (error) {

				err("MFP.get() error: "+ error);
			},
			success: function (resp) {

				log("MFP.get() resp: ", resp);

				var ponyUrl = '';

				if (resp.content.inappInfo){
					var jsonStruct = JSON.parse(resp.content.inappInfo);
	                if ((jsonStruct.extData) && (jsonStruct.extData.ponyUrl)){
						ponyUrl = jsonStruct.extData.ponyUrl;
					}
	                if ((jsonStruct.extData) && (jsonStruct.extData.return_url)){
	                	window.localStorage.setItem('appUrl', jsonStruct.extData.return_url);
	                }
	                
	                MFP.set(ponyUrl);                
				}else{
					log("MFP.get(): Empty session");
				}
			}
		});
		
	}

};
