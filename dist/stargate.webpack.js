(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Stargate"] = factory();
	else
		root["Stargate"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var core = __webpack_require__(1);

	/**
	 * Stargate public interface
	 */
	var stargatePublic = {};

	/**
	 * Stargate application configuration getters namespace
	 */
	stargatePublic.conf = {};

	var getStargateVersionToLoad = function() {
	  if (core.stargateConf.stargate_version_to_load) {
	    return core.stargateConf.stargate_version_to_load;
	  }

	  core.war("getStargateVersionToLoad() stargate_version_to_load must be set on manifest!");

	  // return deprecated value
	  return core.stargateVersion;
	};

	/**
	 * Get url of webapp starting page when hybrid
	 * @return {String} webapp start url
	 */
	stargatePublic.conf.getWebappStartUrl = function() {
	  if (!core.isStargateInitialized) {
	    return core.err("Stargate not initialized, call Stargate.initialize first!");
	  }
	  if (!core.isStargateOpen) {
	    return core.err("Stargate closed, wait for Stargate.initialize to complete!");
	  }

	  var webappStartUrl = URI(core.stargateConf.webapp_start_url)
	        .addSearch("hybrid", "1")
	        .addSearch("stargateVersion", getStargateVersionToLoad());

	  return String(webappStartUrl);
	};





	/**
	 * Get webapp url origin
	 * @return {String} origin for webapp api call
	 */
	stargatePublic.conf.getWebappOrigin = function() {
	  var re = /http:\/\/[\w]{3,4}\..*\.[\w]{2,}/;
	  if (typeof core.stargateConf.webapp_start_url === "undefined") {
	    core.log("Stargate is initialized? Please call this method after it");
	    return "";
	  }

	  return re.exec(core.stargateConf.webapp_start_url)[0];
	};

	var initializePromise;

	/**
	* Initialize Stargate
	* initialize(configurations, callback)
	* @deprecated initialize(configurations, pubKey, forge, callback)
	*
	* @param {object} [configurations={"modules":["mfp","iapbase","appsflyer"],"modules_conf":{}}] - an object with configurations
	*        [configurations.modules=["mfp","iapbase","appsflyer"]] - array with one or more modules to initialize and enable
	*        [configurations.modules_conf={}] - an object with configurations for modules
	*        [configurations.country=undefined] - MFP country @deprecated since 0.2.3
	*        [configurations.hybrid_conf={}] - old configuration of modules, used by IAP @deprecated since 0.2.3
	* @param {string} [pubKeyPar] - public key used by iframe communication protocol @deprecated since 0.2.0
	* @param {object} [forgePar] - Forge library instance used by iframe communication protocol @deprecated since 0.2.0
	* @param {Function} [callback=function(){}] - callback success
	* @return {Promise<boolean>} - true if we're running inside hybrid
	*
	*/
	stargatePublic.initialize = function(configurations, pubKeyPar,
	                                    forgePar, callback) {
	    // parameters checking to support both interfaces:
	    //    initialize(configurations, callback)
	    //    initialize(configurations, pubKey, forge, callback)
	  if (typeof pubKeyPar === 'function' &&
	        typeof forgePar === 'undefined' &&
	        typeof callback === 'undefined') {
	        // second parameter is the callback
	    callback = pubKeyPar;
	  }

	  if (typeof callback === 'undefined') {
	    log("Callback success not setted. \n You can use 'then'");
	    callback = function() {};
	  }
	    // check callback type is function
	    // if not return a failing promise
	  if (typeof callback !== 'function') {
	    war("Stargate.initialize() callback is not a function!");
	    return Promise.reject(new Error("Stargate.initialize() callback is not a function!"));
	  }

	  isStargateRunningInsideHybrid = isHybridEnvironment();

	    // if i'm already initialized just:
	    //  * execute the callback
	    //  * return a resolving promise
	  if (isStargateInitialized) {
	    war("Stargate.initialize() already called, executing callback.");

	    if (callback) {callback(isStargateRunningInsideHybrid);}

	    return initializePromise;
	  }

	  if (typeof configurations !== 'object') {
	    configurations = {};
	  }

	    // old configuration mechanism, used by IAP
	  if (configurations.hybrid_conf) {
	    if (typeof configurations.hybrid_conf === 'object') {
	      hybrid_conf = configurations.hybrid_conf;
	    } else {
	      hybrid_conf = JSON.parse(decodeURIComponent(configurations.hybrid_conf));
	    }
	  }

	  if (configurations.modules) {
	        // save modules requested by caller,
	        // initialization will be done oly for these modules

	        // check type
	    if (configurations.modules.constructor !== Array) {
	      err("initialize() configurations.modules is not an array");
	    }
	    else {
	      requested_modules = configurations.modules;
	    }
	  } else {
	        // default modules
	    requested_modules = ["mfp", "iapbase", "appsflyer", "game"];
	  }
	  if (configurations.modules_conf) {
	        // check type
	    if (typeof configurations.modules_conf !== 'object') {
	      err("initialize() configurations.modules_conf is not an object");
	    }
	    else {
	      modules_conf = configurations.modules_conf;
	    }
	  }

	    // old configuration mechanism, used by MFP module
	  if (configurations.country) {
	        // overwrite conf
	    if ("mfp" in hybrid_conf) {
	      hybrid_conf.mfp.country = configurations.country;
	    }
	        // define conf
	    else {
	      hybrid_conf.mfp = {
	        "country": configurations.country
	      };
	    }
	  }

	    // if not running inside hybrid save the configuration then:
	    //  * call the callback and return a resolving promise
	  if (!isStargateRunningInsideHybrid) {

	    log("version " + stargatePackageVersion + " running outside hybrid ");

	    if (callback) {callback(isStargateRunningInsideHybrid);}

	    initializePromise = Promise.resolve(isStargateRunningInsideHybrid);
	    isStargateInitialized = true;
	    return initializePromise;
	  }

	  log("initialize() starting up, configuration: ", hybrid_conf);

	  initializeCallback = callback;

	  initializePromise = new Promise(function(resolve, reject) {

	    var deviceReadyHandler = function() {
	      onDeviceReady(resolve, reject);
	      document.removeEventListener("deviceready", deviceReadyHandler, false);
	    };

	        // finish the initialization of cordova plugin when deviceReady is received
	    document.addEventListener('deviceready', deviceReadyHandler, false);
	  });

	  isStargateInitialized = true;

	  return initializePromise;
	};

	stargatePublic.isInitialized = function() {
	  return isStargateInitialized;
	};

	stargatePublic.isOpen = function() {
	  return isStargateOpen;
	};

	stargatePublic.isHybrid = function() {
	  return isHybridEnvironment();
	};

	stargatePublic.openUrl = function(url) {

		                                            if (!isStargateInitialized) {
			                                            return err("Stargate not initialized, call Stargate.initialize first!");
	}
	    // FIXME: check that inappbrowser plugin is installed otherwise return error

	  window.open(url, "_system");
	};

	stargatePublic.googleLogin = function(callbackSuccess, callbackError) {

		                                            if (!isStargateInitialized) {
			                                            return callbackError("Stargate not initialized, call Stargate.initialize first!");
	}

	    // FIXME: implement it; get code from old stargate

	  err("unimplemented");
	  callbackError("unimplemented");
	};

	var connectionStatus = {
	  type: "unknown",
	  networkState: "unknown"
	};

	var onConnectionChange;
	/**
	 * Stargate.addListener
	 * @param {String} type - possible values: "connectionchange"
	 * @param {Function} _onConnectionChange
	 * **/
	stargatePublic.addListener = function(type, _onConnectionChange) {
	    // if not already registered
	  if (type == "connectionchange" && (typeof _onConnectionChange === "function")) {
	    log("onConnectionChange registered");
	    onConnectionChange = _onConnectionChange;
	  }
	};

	function updateConnectionStatus(theEvent) {
	  connectionStatus.type = theEvent.type;
	  connectionStatus.networkState = navigator.connection.type;
	  if (typeof onConnectionChange === "function") {onConnectionChange(connectionStatus);}
	}

	function bindConnectionEvents() {
	  document.addEventListener("offline", updateConnectionStatus, false);
	  document.addEventListener("online", updateConnectionStatus, false);
	}

	function initializeConnectionStatus() {
	  connectionStatus.networkState = navigator.connection.type;

	  if (navigator.connection.type === "none") {
	    connectionStatus.type = "offline";
	  } else {
	    connectionStatus.type = "online";
	  }
	}

	/**
	 * checkConnection function returns the updated state of the client connection
	 * @param {Function} [callbackSuccess=function(){}] - callback success filled with: {type:"online|offline",networkState:"wifi|3g|4g|none"}
	 * @param {Function} [callbackError=function(){}] - called if stargate is not initialize or cordova plugin missing
	 * @returns {Object|boolean} connection info {type:"online|offline",networkState:"wifi|3g|4g|none"}
	 * */
	stargatePublic.checkConnection = function() {

	  var callbackSuccess = arguments.length <= 0 || arguments[0] === undefined ? function() {} : arguments[0];
	  var callbackError = arguments.length <= 1 || arguments[1] === undefined ? function() {} : arguments[1];

		                                            if (!isStargateInitialized) {
			                                            callbackError("Stargate not initialized, call Stargate.initialize first!");
	  return false;
	}
	  if (!isStargateOpen) {
	    callbackError("Stargate closed, wait for Stargate.initialize to complete!");
	    return false;
	  }

	  if (typeof navigator.connection === "undefined" ||
	        typeof navigator.connection.getInfo !== "function") {

	    callbackError("Missing cordova plugin");
	    console.warn("Cordova Network Information module missing");
	    return false;
	  }

	  callbackSuccess(connectionStatus);
	  return connectionStatus;
	};
	stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {

		                                            if (!isStargateInitialized) {
			                                            return callbackError("Stargate not initialized, call Stargate.initialize first!");
	}
	  if (!isStargateOpen) {
	    callbackError("Stargate closed, wait for Stargate.initialize to complete!");
	    return false;
	  }

	    // FIXME: check that device plugin is installed
	    // FIXME: integrate with other stargate device handling method

	  var deviceID = runningDevice.uuid;
	  callbackSuccess({'deviceID': deviceID});
	};

	/**
	 * loadUrl
	 * @protected
	 * @param {String} url - an uri string
	 * */
	function loadUrl(url) {

	  if (window.device.platform.toLowerCase() == "android") {
	    window.navigator.app.loadUrl(url);
	  } else if (window.device.platform.toLowerCase() == "ios" && (url.indexOf("file:///") !== -1)) {
	        // ios and url is a file:// protocol
	    var _url = url.split("?")[0];
	    log("Without qs", _url);
	    window.resolveLocalFileSystemURL(_url, function(entry) {
	      var internalUrl = entry.toInternalURL() + "?hybrid=1";
	      log("Redirect to", internalUrl);
	      window.location.href = internalUrl;
	    }, err);
	  } else {
	    window.location.href = url;
	  }
	}

	/**
	 * goToLocalIndex
	 * redirect the webview to the local index.html
	 * */
	stargatePublic.goToLocalIndex = function() {
	  if (window.cordova.file.applicationDirectory !== "undefined") {
	    var qs = "?hybrid=1";
	    var LOCAL_INDEX = window.cordova.file.applicationDirectory + "www/index.html";
	    loadUrl(LOCAL_INDEX + qs);
	  } else {
	    err("Missing cordova-plugin-file. Install it with: cordova plugin add cordova-plugin-file");
	  }
	};

	/**
	 * goToWebIndex
	 * redirect the webview to the online webapp
	 * */
	stargatePublic.goToWebIndex = function() {
	  var webUrl = stargatePublic.conf.getWebappStartUrl() + "";
	  log("Redirect to", webUrl);
	  loadUrl(webUrl);
	};

	stargatePublic.getVersion = function() {
	  return stargatePackageVersion;
	};

	/**
	 * @return {object} application information;
	 *
	 * this information are available only after initialize complete
	 *
	 * object keys returned and meaning
	 *
	 *  cordova: Cordova version,
	 *  manufacturer: device manufacter,
	 *  model: device model,
	 *  platform: platform (Android, iOs, etc),
	 *  deviceId: device id or UUID,
	 *  version: platform version,
	 *  packageVersion: package version,
	 *  packageName: package name ie: com.stargatejs.test,
	 *  packageBuild: package build number,
	 *  stargate: stargate version,
	 *  stargateModules: stargate modules initialized,
	 *  stargateError: stargate initialization error
	 *
	 */
	stargatePublic.getAppInformation = function() {
	  return appInformation;
	};

	module.exports = stargatePublic;


/***/ },
/* 1 */
/***/ function(module, exports) {

	/* globals SpinnerDialog */

	/** *
	*
	*
	*
	*/

	// current stargateVersion used by webapp to understand
	//  the version to load based on cookie or localstorage
	// @deprecated since 0.2.2
	var stargateVersion = "2";

	var is_staging = ("IS_STAGING = 1".slice(-1) === "1");


	var argsToString = function() {
	  var args = Array.prototype.slice.call(arguments);
	  var result = '';
	  for (var i = 0; i < args.length; i++) {
	    if (typeof (args[i]) === 'object') {
	      result += " " + JSON.stringify(args[i]);
	    }
	    else {
	      result += " " + args[i];
	    }
	  }
	  return result;
	};

	// logger function
	var log = console.log.bind(window.console, "[Stargate] ");
	var err = console.error.bind(window.console, "[Stargate] ");
	var war = console.warn.bind(window.console, "[Stargate] ");
	if (!is_staging) {
	  log = function() {
	    console.log("[I] [Stargate] " + argsToString.apply(null, arguments));
	  };
	  err = function() {
	    console.log("[E] [Stargate] " + argsToString.apply(null, arguments));
	  };
	  war = function() {
	    console.log("[W] [Stargate] " + argsToString.apply(null, arguments));
	  };
	}


	// device informations   // examples
	var runningDevice = {
	  available: false,    // true
	  cordova: "",         // 4.1.1
	  manufacturer: "",    // samsung
	  model: "",           // GT-I9505
	  platform: "",        // Android
	  uuid: "",            // ac7245e38e3dfecb
	  version: ""          // 5.0.1
	};
	var isRunningOnAndroid = function() {
	  return runningDevice.platform == "Android";
	};
	var isRunningOnIos = function() {
	  return runningDevice.platform == "iOS";
	};
	// - not used, enable if needed -
	// var isRunningOnCordova = function () {
	//    return (typeof window.cordova !== "undefined");
	// };
	var initDevice = function() {
	  if (typeof window.device === 'undefined') {
	    return err("Missing cordova device plugin");
	  }
	  for (var key in runningDevice) {
	    if (window.device.hasOwnProperty(key)) {
	      runningDevice[key] = window.device[key];
	    }
	  }
	  return true;
	};

	function getAppIsDebug() {
	  if (window.cordova && window.cordova.plugins && window.cordova.plugins.AppIsDebug) {
	    return new Promise(function(resolve, reject) {
	      window.cordova.plugins.AppIsDebug.get(
	                function(appinfo) {
	                  resolve(appinfo);
	                },
	                function(error) {
	                  err("getAppIsDebug(): " + error, error);
	                  reject(new Error(error));
	                }
	            );
	    });
	  }

	  err("getAppIsDebug(): plugin not available!");
	  return Promise.resolve({});
	}

	function getManifest() {

	  if (window.cordova.file) {
	    return stargateModules.file.readFileAsJSON(window.cordova.file.applicationDirectory + "www/manifest.json");
	  }

	  if (window.hostedwebapp) {
	    return new Promise(function(resolve, reject) {
	      window.hostedwebapp.getManifest(
	                function(manifest) {
	                  resolve(manifest);
	                },
	                function(error) {
	                  err(error);
	                  reject(new Error(error));
	                }
	            );
	    });
	  }

	  err("getManifest() no available reading mechanism!");
	  return Promise.resolve({});
	}

	var launchUrl = function(url) {
	  log("launchUrl: " + url);
	  document.location.href = url;
	};


	var isStargateRunningInsideHybrid = false;
	var isStargateInitialized = false;
	var isStargateOpen = false;
	var initializeCallback = null;

	/**
	 * appVersion: version number of the app
	 */
	var appVersion = '';
	/**
	 * appBuild: build identifier of the app
	 */
	var appBuild = '';
	/**
	 * appPackageName: package name of the app - the reversed domain name app identifier like com.example.myawesomeapp
	 */
	var appPackageName = '';

	/**
	 * appIsDebug {Boolean} true if app is compiled in debug mode
	 */
	var appIsDebug = false;


	/**
	 *
	 * variables sent by server configuration
	 *
	 */
	var hybrid_conf = {},
	  requested_modules = [],
	  modules_conf = {};

	/**
	 *
	 * Application information set on initialize
	 *
	 */
	var appInformation = {
	  cordova: null,
	  manufacturer: null,
	  model: null,
	  platform: null,
	  deviceId: null,
	  version: null,
	  packageVersion: null,
	  packageName: null,
	  packageBuild: null,
	  stargate: null,
	  stargateModules: null,
	  stargateError: null
	};

	/**
	* Set on webapp that we are hybrid
	* (this will be called only after device ready is received and
	*   we are sure to be inside cordova app)
	*/
	var setIsHybrid = function() {

	  window.Cookies.set("hybrid", "1");

	  if (!window.localStorage.getItem('hybrid')) {
	    window.localStorage.setItem('hybrid', 1);
	  }
	};

	/**
	* Set on webapp what version we need to load
	* (this will be called only after manifest is loaded on stargate)
	*/
	var setHybridVersion = function() {

	  window.Cookies.set("stargateVersion", getStargateVersionToLoad());

	  if (!window.localStorage.getItem('stargateVersion')) {
	    window.localStorage.setItem('stargateVersion', getStargateVersionToLoad());
	  }
	};

	var hideSplashAndLoaders = function() {


	  if (!haveRequestedFeature("leavesplash")) {
	    navigator.splashscreen.hide();
	  }

	  setBusy(false);

	  if (typeof SpinnerDialog !== "undefined") {
	    SpinnerDialog.hide();
	  }
	};

	var onPluginReady = function(resolve) {
	  log("onPluginReady() start");

	    // FIXME: this is needed ??
	  document.title = stargateConf.title;

	    // set back cordova bridge mode to IFRAME_NAV overriding manifold settings
	  if (isRunningOnIos() && (typeof window.cordova !== 'undefined') && cordova.require) {
	    var exec = cordova.require('cordova/exec');
	    exec.setJsToNativeBridgeMode(exec.jsToNativeModes.IFRAME_NAV);
	  }
	  bindConnectionEvents();
	    // save stargate version to load on webapp
	  setHybridVersion();


	  if (hasFeature("mfp") && haveRequestedFeature("mfp")) {
	    var mfpModuleConf = getModuleConf("mfp");

	        // configurations needed
	        // stargateConf.motime_apikey,
		  	// stargateConf.namespace,
	        // stargateConf.label,

	        // configurations needed
	        // moduleConf.country

	        // retrocompatibility
	    var keysOnStargateConf = ["motime_apikey", "namespace", "label"];
	    keysOnStargateConf.forEach(function(keyOnStargateConf) {
	            // if it's available in stargateConf but not in module conf
	            // copy it to module conf
	      if (!mfpModuleConf.hasOwnProperty(keyOnStargateConf) &&
	                stargateConf.hasOwnProperty(keyOnStargateConf)) {

	        mfpModuleConf[keyOnStargateConf] = stargateConf[keyOnStargateConf];
	      }
	    });

	    MFP.check(mfpModuleConf);
	  }

	  if (hasFeature("deltadna")) {
	    window.deltadna.startSDK(
	            stargateConf.deltadna.environmentKey,
	            stargateConf.deltadna.collectApi,
	            stargateConf.deltadna.engageApi,
	            onDeltaDNAStartedSuccess,
	            onDeltaDNAStartedError,
	            stargateConf.deltadna.settings
	        );
	  }

	    // initialize all modules

	  stargateModules.statusbar.initialize(
	        getModuleConf("statusbar")
	    );

	    // In-app purchase initialization
	  if (haveRequestedFeature("iapbase")) {
	        // base legacy iap implementation
	    IAP.initialize(
	            getModuleConf("iapbase")
	        );

	  } else if (haveRequestedFeature("iap")) {
	        // if initialize ok...
	    if (IAP.initialize(getModuleConf("iap"))) {
	            // ...then call refresh
	            // this doesn't works, so we do it when needed in iap module
	            // IAP.doRefresh();
	      log("Init IAP done.");
	    }
	  }

	    // receive appsflyer conversion data event
	  if (hasFeature('appsflyer') && haveRequestedFeature("appsflyer")) {
	    appsflyer.init(
	            getModuleConf("appsflyer")
	        );
	  }

	    // apply webapp fixes
	  webappsFixes.init();

	  var modulePromises = [];

	    // Game Module Init
	    // if requested by caller (haveRequestedFeature)
	    // if available in app (has feature)
	    // if included in code (stargateModules.game)
	  if (haveRequestedFeature("game") && hasFeature('game') && stargateModules.game) {
	        // save initialization promise, to wait for
	    modulePromises.push(
	            stargateModules.game._protected.initialize(
	                getModuleConf("game")
	            )
	        );
	  }

	  if (haveRequestedFeature("adv") && stargateModules.AdManager) {
	        // save initialization promise, to wait for
	    modulePromises.push(
	            stargateModules.AdManager.initialize(
	                getModuleConf("adv")
	            )
	        );
	  }


	    // wait for all module initializations before calling the webapp
	  Promise.all(
	            modulePromises
	        )
	        .then(function() {

	          onStargateReady(resolve);

	        })
	        .catch(function(error) {
	          err("onPluginReady() error: ", error);

	          onStargateReady(resolve, error);
	        });
	};

	var onStargateReady = function(resolve, error) {
	  log("onStargateReady() start");

	  hideSplashAndLoaders();

	    // initialize finished
	  isStargateOpen = true;

	  log("version " + stargatePackageVersion + " ready; " +
	        " running in package version: " + appVersion);

	  appInformation = {
	    cordova: runningDevice.cordova,
	    manufacturer: runningDevice.manufacturer,
	    model: runningDevice.model,
	    platform: runningDevice.platform,
	    deviceId: runningDevice.uuid,
	    version: runningDevice.version,
	    packageVersion: appVersion,
	    packageName: appPackageName,
	    packageBuild: appBuild,
	    stargate: stargatePackageVersion
	  };
	  if (requested_modules && requested_modules.constructor === Array) {
	    appInformation.stargateModules = requested_modules.join(", ");
	  }
	  if (error && (error instanceof Error)) {
	    appInformation.stargateError = error.toString();
	  }

	    // execute callback
	  initializeCallback(true);

	  log("Stargate.initialize() done");
	  resolve(true);
	};

	var onDeviceReady = function(resolve, reject) {
	  log("onDeviceReady() start");

	    // device ready received so i'm sure to be hybrid
	  setIsHybrid();

	    // get device information
	  initDevice();

	    // get connection information
	  initializeConnectionStatus();

	    // request all asyncronous initialization to complete
	  Promise.all([
	        // include here all needed asyncronous initializazion
	    cordova.getAppVersion.getVersionNumber(),
	    getManifest(),
	    cordova.getAppVersion.getPackageName(),
	    cordova.getAppVersion.getVersionCode(),
	    getAppIsDebug()
	  ])
	    .then(function(results) {
	        // save async initialization result

	      appVersion = results[0];

			                                                                                                                        if (typeof results[1] !== 'object') {
				                                        results[1] = JSON.parse(results[1]);
			}

	      appPackageName = results[2];
	      appBuild = results[3];

	      if (results[4] && (typeof (results[4]) === 'object')) {
	        if (results[4].debug) {
	          appIsDebug = true;
	        }
	      }

	      stargateConf = results[1].stargateConf;

	        // execute remaining initialization
	      onPluginReady(resolve, reject);
	    })
	    .catch(function(error) {
	      err("onDeviceReady() error: " + error);
	      reject("onDeviceReady() error: " + error);
	    });
	};

	/**
	* Check if we are running inside hybrid environment,
	* checking current url or cookies or localStorage
	*/
	var isHybridEnvironment = function() {

	    // check url for hybrid query param
	  var uri = window.URI(document.location.href);
	  if (uri.hasQuery('hybrid')) {
	    return true;
	  }

	  if (window.Cookies.get('hybrid')) {
	    return true;
	  }

	  if (window.localStorage.getItem('hybrid')) {
	    return true;
	  }

	  return false;
	};


	var setBusy = function(value) {
	  if (value) {
	    startLoading();
	  }
	  else {
	    stopLoading();
	  }
	};

	var stargateConf = {
	  features: {}
	};

	/**
	 * getModuleConf(moduleName)
	 * @param {string} moduleName - name of module to return conf of
	 * @returns {object} - configuration for the module sent by Stargate implementator on Stargate.initialize()
	 */
	var getModuleConf = function(moduleName) {
	    // 1. new version -> modules_conf
	    // 2. old version -> hybrid_conf

	  if (!moduleName) {
	    return err("getModuleConf() invalid module requested");
	  }

	  if (moduleName in modules_conf) {
	    return modules_conf[moduleName];
	  }

	    // covert modulesname
	  var mapConfLegacy = {
	    "iapbase": "IAP",
	    "iap": "IAP"
	  };

	  var moduleNameLegacy = moduleName;
	  if (mapConfLegacy[moduleName]) {
	    moduleNameLegacy = mapConfLegacy[moduleName];
	  }

	  if (hybrid_conf && moduleNameLegacy in hybrid_conf) {
	    return hybrid_conf[moduleNameLegacy];
	  }

	  log("getModuleConf(): no configuration for module: " + moduleName + " (" + mapConfLegacy + ")");
	  return {};
	};

	/**
	 * hasFeature(feature)
	 * @param {string} feature - name of feature to check
	 * @returns {boolean} - true if app have feature requested (it check inside the manifest compiled in the app)
	 */
	var hasFeature = function(feature) {
	  return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
	};

	/**
	 * haveRequestedFeature(feature)
	 * @param {string} feature - name of feature to check
	 * @returns {boolean} - true if implementator of Stargate requested the feature (it check against the configuration.modules array sent as paramenter of Stargate.initialize())
	 *
	 * possible values: "mfp","iapbase","iap","appsflyer","webappanalytics","game"
	 */
	var haveRequestedFeature = function(feature) {
	  if (requested_modules && requested_modules.constructor === Array) {
	    return requested_modules.indexOf(feature) > -1;
	  }
	  return false;
	};


/***/ }
/******/ ])
});
;