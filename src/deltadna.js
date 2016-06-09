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
  if (isRunningOnAndroid() && pushDatas.payload && pushDatas.payload.url && !pushDatas.foreground) {
		                                                                                  return launchUrl(pushDatas.payload.url);
	                                          }
  if (isRunningOnIos() && pushDatas.url) {
    return launchUrl(pushDatas.url);
  }
};
