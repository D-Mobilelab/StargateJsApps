

var startLoading = function(properties) {
	if (typeof window.SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    if (typeof properties !== 'object') {
		properties = {};
	}
	
    var msg = null;
    
    if(properties.hasOwnProperty("message")){
        msg = properties.message;
    }
    window.SpinnerDialog.show(null, msg);
    return true;
};

var stopLoading = function() {
	if (typeof window.SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    window.SpinnerDialog.hide();
    return true;
};

//jshint unused:false
var changeLoadingMessage = function(newMessage) {
    if (typeof window.SpinnerDialog === "undefined") {
        return err("startLoading(): SpinnerDialog cordova plugin missing!");
    }
    
    window.SpinnerDialog.show(null, newMessage);
    return true;
};


// FIXME: used inside store.js
window.startLoading = startLoading;
window.stopLoading = stopLoading;
