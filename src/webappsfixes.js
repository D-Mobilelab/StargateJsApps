
var webappsFixes = (function() {


	var waf = {};
	var enabled = false;

	waf.init = function() {
		if (stargateConf.hasOwnProperty('webappsfixes') && 
			typeof stargateConf.webappsfixes === 'object') {

			enabled = true;

			// execute all fixes found in conf
			for (var fixName in stargateConf.webappsfixes) {
				if (stargateConf.webappsfixes.hasOwnProperty(fixName)) {
					

					if (fixes.hasOwnProperty(fixName) && typeof fixes[fixName] === 'function') {

						log("[webappsFixes] applying fix: "+fixName);
						
						var error = fixes[fixName](stargateConf.webappsfixes[fixName]);

						if (error) {
							err("[webappsFixes] fix '"+fixName+"' failed: "+error);
						}
					}
					else {
						err("[webappsFixes] fix implementation not found for: "+fixName);
					}
				}
			}

		}

		return enabled;
	};

	// fixes function must return an empty string when result is ok and
	//  a string describing the error when there is one error
	var fixes = {};
	fixes.gamifiveSearchBox = function(conf) {
		// 

		if (! window.cordova || ! window.cordova.plugins || ! window.cordova.plugins.Keyboard) {
			return "missing ionic-plugin-keyboard";
		}

		if (conf.platforms) {
			if (isRunningOnIos() && ! conf.platforms.ios) {
				return "fix disabled on iOS";
			}
			if (isRunningOnAndroid() && ! conf.platforms.android) {
				return "fix disabled on Android";
			}
		}

		window.addEventListener(
			'native.keyboardshow',
			function(){
				setTimeout(function() {
					if (document.querySelectorAll('input:focus').length === 0) {
						log('[webappsFixes] [gamifiveSearchBox] keyboard show on null input: hiding');
						
						cordova.plugins.Keyboard.close();
					}
				},
				1);
			},
			false
		);

		log('[webappsFixes] [gamifiveSearchBox] listening on event native.keyboardshow');


		return '';
	};

	//window.addEventListener('native.keyboardshow', function(){ console.log('keyboardshow start'); if($(':focus')===null){console.log('keyboard show on null input, hiding');cordova.plugins.Keyboard.close()} console.log('keyboardshow finish') }, false)

	return waf;
})();