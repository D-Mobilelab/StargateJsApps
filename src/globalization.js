var globalization = (function(){
    
	var protectedInterface = {};

    var preferredLanguage = {};
    var localeName = {};

    var initFinished = false;

    protectedInterface.initialize = function() {
        if (typeof window.navigator !== "object" || typeof window.navigator.globalization !== "object") {
            err("[globalization] missing cordova plugin!");
            return false;
        }

        var prefLangPromise = new Promise(function(resolve){
            navigator.globalization.getPreferredLanguage(
                function(props) {
                    if (typeof props !== "object") {
                        err("[globalization] initialize getPreferredLanguage result error: invalid type", props);
                        resolve({"error":"invalid type"});
                        return;
                    }
                    log("[globalization] initialize getPreferredLanguage result ok: ", props);
                    preferredLanguage = props;
                    resolve(props);
                },
                function(error) {
                    err("[globalization] initialize getPreferredLanguage result error: ", error);
                    resolve({"error":error});
                }
            );
        }); // end prefLangPromise

        var locaNamePromise = new Promise(function(resolve){
            navigator.globalization.getLocaleName(
                function(props) {
                    if (typeof props !== "object") {
                        err("[globalization] initialize getLocaleName result error: invalid type", props);
                        resolve({"error":"invalid type"});
                        return;
                    }
                    log("[globalization] initialize getLocaleName result ok: ", props);
                    localeName = props;
                    resolve(props);
                },
                function(error) {
                    err("[globalization] initialize getLocaleName result error: ", error);
                    resolve({"error":error});
                }
            );
        }); // end locaNamePromise


        return Promise.all([prefLangPromise, locaNamePromise]).then(function(results){
            initFinished = true;
            return results;
        });
    };

    protectedInterface.getPreferredLanguage = function() {
        if (!initFinished) {
            err("[globalization] getPreferredLanguage: not initialized!");
            return false;
        }
        return preferredLanguage;
    };
    protectedInterface.getLocaleName = function() {
        if (!initFinished) {
            err("[globalization] getLocaleName: not initialized!");
            return false;
        }
        return localeName;
    };

    return protectedInterface;
})();
