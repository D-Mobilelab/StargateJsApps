var MFP = {};

MFP.check = function(){
	
	if(CONFIGS.label.country){
		
		MFP.get(CONFIGS.label.country);
		
	}else{

		var xmlhttp;
		
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		
		// network info	
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4){
				if(xmlhttp.status === 200) {
					try {
						console.log(xmlhttp.responseText);
						var serverResponse = JSON.parse(xmlhttp.responseText);
						console.log(serverResponse);
						
						var country = serverResponse.response.realCountry;
						MFP.get(country);
					}
					catch(e){
						// display error message
						console.log("Error MFP.check reading the response: " + e.toString());
						app.launch(app.url());
					}
				}
				else {
					console.log("Error MFP.check", xmlhttp.statusText); 
					app.launch(app.url());
				}
			}
		}
		
		var url = CONFIGS.api.networkInfo;
		url = url.replace('%apikey%',CONFIGS.label.apimm_apikey);
		
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}

};
MFP.getContents = function(country,namespace,label,extData) {
	
	var contents_inapp = {};
    contents_inapp.api_country= label;
    contents_inapp.country =country;
    if (extData){
        contents_inapp.extData= extData;
    }
    contents_inapp.fpnamespace= namespace;
    
    var json_data = JSON.stringify(contents_inapp);
       
    return json_data;

};
MFP.set = function(pony,country) {
	
	var url = CONFIGS.label.url + CONFIGS.api.mfpSet;
	var appUrl = app.url();
	if(pony){
		pony = '&' + pony;
	}
	if (window.localStorage.getItem('appUrl')){
		appUrl = window.localStorage.getItem('appUrl');
	}
	url = url.replace('%pony%',pony).replace('%url%',encodeURIComponent(appUrl));
			
	console.log("MFP going to url: ", url);

	app.launch(url);
	

};
MFP.get = function(country) {

	var xmlhttp;
	var ponyUrl = '';
	
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else {// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState ===4){
			
			if(xmlhttp.status === 200) {
				try {
					
					console.log(xmlhttp.responseText);
					var serverResponse = JSON.parse(xmlhttp.responseText);
					console.log(serverResponse);
					
					if (serverResponse.content.inappInfo){
						var jsonStruct = JSON.parse(serverResponse.content.inappInfo);
		                if ((jsonStruct.extData) && (jsonStruct.extData.ponyUrl)){
							ponyUrl = jsonStruct.extData.ponyUrl;
						}
		                if ((jsonStruct.extData) && (jsonStruct.extData.return_url)){
		                	window.localStorage.setItem('appUrl', jsonStruct.extData.return_url);
		                }
		                                        
					}else{
						console.log("Empty session MFP.get");
					}
					
					MFP.set(ponyUrl,country);		
					
				}
				catch(e){
			        // display error message
			        console.log("Error MFP.get reading the response: " + e.toString());
			        app.launch(app.url());
				}
			}
			else {
				console.log("Error MFP.get", xmlhttp.statusText); 
				app.launch(app.url());
			}
		} 
	}
	
	var lang = navigator.language.split("-");
	
	var namespace = CONFIGS.label.namespace;
    var expire = "";
    var apikey = CONFIGS.label.motime_apikey;
    var label   = CONFIGS.label.label;
    var contents_inapp = MFP.getContents(country,namespace,label);
	var url = CONFIGS.api.mfpGet;
	url = url.replace('%apikey%', apikey).replace('%contents_inapp%', contents_inapp).replace('%country%', country).replace('%expire%', expire);
	
	xmlhttp.open("GET",url,true);
	xmlhttp.send();


};