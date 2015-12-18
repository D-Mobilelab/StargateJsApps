/* global deltadna */

var onDeltaDNAStartedSuccess = function() {
    deltadna.registerPushCallback(
		onDeltaDNAPush
	); 
};


var onDeltaDNAStartedError = function(error) {
    err("[DeltaDNA] error: " + error);
};

var onDeltaDNAPush = function(pushDatas) {
    if(ua.Android() && pushDatas.payload && pushDatas.payload.url && !pushDatas.foreground){
		launchUrl(pushDatas.payload.url);
	}
    if(ua.iOS() && pushDatas.url){
        launchUrl(pushDatas.url);
    }
};