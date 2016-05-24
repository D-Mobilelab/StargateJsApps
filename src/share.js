var share = (function(){

    
	var shareProtected = {};
    
    var getOptions = function(requestedOptions) {
        var availableOptions = ["message", "subject", "files", "chooserTitle"];
        var options = {
            url: requestedOptions.url
        };
        availableOptions.forEach(function(availableOption) {
            if (availableOption in requestedOptions) {
                options[availableOption] = requestedOptions[availableOption];
            }
        });
        return options;
    };
    
	var shareWithChooser = function(requestedOptions, resolve, reject) {
        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        //var fullOptions = {
        //    message: 'share this', // not supported on some apps (Facebook, Instagram)
        //    subject: 'the subject', // fi. for email
        //    files: ['', ''], // an array of filenames either locally or remotely
        //    url: 'https://www.website.com/foo/#bar?a=b',
        //    chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
        //};
        
        var options = getOptions(requestedOptions);
        
        var onSuccess = function(result) {
            log("[share] Share completed? " + result.completed); // On Android apps mostly return false even while it's true
            log("[share] Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
            
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Sharing failed with message: " + msg);
            
            reject(msg);
        };

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    };
    
    var shareWithFacebook = function(requestedOptions, resolve, reject) {
        var onSuccess = function(result) {
            log("[share] Facebook share completed, result: ", result);
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Facebook sharing failed with message: " + msg);
            reject(msg);
        };
        
        window.plugins.socialsharing.shareViaFacebook(
            "",
            null,
            requestedOptions.url,
            onSuccess,
            onError
        );
    };
    
    var shareWithTwitter = function(requestedOptions, resolve, reject) {
        var onSuccess = function(result) {
            log("[share] Twitter share completed, result: ", result);
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Twitter sharing failed with message: " + msg);
            reject(msg);
        };
        
        var message = "";
        if ("message" in requestedOptions) {
            message = requestedOptions.message;
        }
        window.plugins.socialsharing.shareViaTwitter(
            message,
            null,
            requestedOptions.url,
            onSuccess,
            onError
        );
    };
    var shareWithWhatsapp = function(requestedOptions, resolve, reject) {
        var onSuccess = function(result) {
            log("[share] Whatsapp share completed, result: ", result);
            resolve(result);
        };

        var onError = function(msg) {
            err("[share] Whatsapp sharing failed with message: " + msg);
            reject(msg);
        };
        
        var message = "";
        if ("message" in requestedOptions) {
            message = requestedOptions.message;
        }
        
        window.plugins.socialsharing.shareViaWhatsApp(
            message,
            null,
            requestedOptions.url,
            onSuccess,
            onError
        );
    };
    
    
	shareProtected.socialShare = function(options, resolve, reject) {
        
		if (typeof options !== 'object') {
            options = {};
			war("[share] parameter options must be object!");
		}
        
        if (!options.type) {
            options.type = "chooser";
        }

        if (!window.plugins || !window.plugins.socialsharing) {

			// plugin is not installed
            err("[share] missing cordova plugin");
			return reject("missing cordova plugin");
		}
		
        if (!options.url) {
            err("[share] missing parameter url");
            return reject("missing parameter url");
        }
        
        if (options.type == "chooser") {
            return shareWithChooser(options, resolve, reject);
        }
        
        if (options.type == "facebook") {
            return shareWithFacebook(options, resolve, reject);
        }
        
        if (options.type == "twitter") {
            return shareWithTwitter(options, resolve, reject);
        }
        
        if (options.type == "whatsapp") {
            return shareWithWhatsapp(options, resolve, reject);
        }

        err("[share] type not valid");        
        return reject("type not valid");
        
	};
    
    return shareProtected;
})();


/**
 * @name Stargate#socialShare
 * @memberof Stargate
 *
 * @description share an url on a social network
 *
 * @param {object} options
 */
stargatePublic.socialShare = function(options) {
    
    if (!isStargateInitialized) {
        return Promise.reject("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        return Promise.reject("Stargate closed, wait for Stargate.initialize to complete!");
    }
    
    
    var result = new Promise(function(resolve,reject){
        
        share.socialShare(options, resolve, reject);
    });
    
    
    return result;
};
