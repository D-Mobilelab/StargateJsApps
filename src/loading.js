

var startLoading = function(properties) {
	if (typeof SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    if (typeof properties !== 'object') {
		properties = {};
	}
	
    var msg = null;
    
    if(properties.hasOwnProperty("message")){
        msg = properties.message;
    }
    SpinnerDialog.show(null, msg);
};

var stopLoading = function() {
	if (typeof SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    SpinnerDialog.hide();
};

var changeLoadingMessage = function(newMessage) {
    if (typeof SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    SpinnerDialog.show(null, newMessage);
    return true;
};


// FIXME: used inside store.js
window.startLoading = startLoading;
window.stopLoading = stopLoading;
