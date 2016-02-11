

// Universal Module Definition - https://github.com/umdjs/umd/blob/master/templates/returnExports.js
/*global define, module */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.Stargate = factory();
    }
}(this, function () {
    // Public interface
    var stargatePackageVersion = "0.1.6";
    var stargatePublic = {};
    /* global cordova */


/* globals AdMob, MoPub */

var AdManager = {

	AdMobSupport: false,
	MoPubSupport: false,
	AdPosition: {
		NO_CHANGE: 0,
		TOP_LEFT: 1,
		TOP_CENTER: 2,
		TOP_RIGHT: 3,
		LEFT: 4,
		CENTER: 5,
		RIGHT: 6,
		BOTTOM_LEFT: 7,
		BOTTOM_CENTER: 8,
		BOTTOM_RIGHT: 9,
		POS_XY: 10
	},
	AdSize: {
		SMART_BANNER: 'SMART_BANNER',
		BANNER: 'BANNER',
		MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
		FULL_BANNER: 'FULL_BANNER',
		LEADERBOARD: 'LEADERBOARD',
		SKYSCRAPER: 'SKYSCRAPER'
	},
	DefaultOptions : null,
		
	initialize: function (options, success, fail) {
		if(options)
			AdManager.DefaultOptions = options;
			
		if (AdMob) { 
			AdManager.AdMobSupport = true;
			AdManager.initAdMob(options, success, fail);
		}
		
		if (MoPub) { 
			AdManager.MoPubSupport = true;
		}	
		
		return true;
	},
	
	isAdMobSupported: function(){
		return AdManager.AdMobSupport;
	},
	
	isMoPubSupported: function(){
		return AdManager.MoPubSupport;
	},
	
	getUserAgent: function(){
		if( /(android)/i.test(navigator.userAgent) ) {
			return "android";
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
			return "ios";
		} else {
			return "other";
		}
	},
	
	/* setOptions(options, success, fail); */
	initAdMob: function(options, success, fail){
	
		var defaultOptions = {
			//bannerId: AdManager.AdMobID[userAgent].banner,
			//interstitialId: AdManager.AdMobID[userAgent].interstitial,
			adSize: 'BANNER',
			// width: integer, // valid when set adSize 'CUSTOM'
			// height: integer, // valid when set adSize 'CUSTOM'
			position: 8,
			// offsetTopBar: false, // avoid overlapped by status bar, for iOS7+
			bgColor: 'black', // color name, or '#RRGGBB'
			// x: integer, // valid when set position to 0 / POS_XY
			// y: integer, // valid when set position to 0 / POS_XY
			isTesting: false, // set to true, to receiving test ad for testing purpose
			autoShow: true // auto show interstitial ad when loaded, set to false if prepare/show
		};
		AdMob.setOptions(defaultOptions, success, fail);
		
	},
	
	/* TODO if needed */
	//initMoPub: function(options, success, fail){
	//
	//},	
	
	registerAdEvents: function(eventManager) {
		document.addEventListener('onAdFailLoad', eventManager);
		document.addEventListener('onAdLoaded', eventManager);
		document.addEventListener('onAdPresent', eventManager);
		document.addEventListener('onAdLeaveApp', eventManager);
		document.addEventListener('onAdDismiss', eventManager);
	},
	
	manageAdEvents: function(data) {
	
		console.log('error: ' + data.error +
			', reason: ' + data.reason +
			', adNetwork:' + data.adNetwork +
			', adType:' + data.adType +
			', adEvent:' + data.adEvent); 
	},
	
	/*
	createBanner(data, success, fail);
	data could be an object (one network) or an array of network info
	each network is an object with position, autoShow, banner, full_banner, leaderboard, ecc
	data = [{network: "dfp", device: "android", position: "BOTTOM_CENTER", banner: "/1017836/320x50_Radio_Leaderboard", autoShow: true},
			{network: "mopub", device: "ios", position: "BOTTOM_CENTER", banner: "agltb3B1Yi1pbmNyDAsSBFNpdGUY8fgRDA", autoShow: true}];
	*/
	createBanner: function(data, success, fail) {
		var options = {};
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				var adId = AdManager.getAdSize().toLowerCase();					
			
				if(entry.overlap) options.overlap = entry.overlap;
				if(entry.offsetTopBar) options.offsetTopBar = entry.offsetTopBar;
				options.adSize = AdManager.getAdSize();
				if(adId) options.adId = entry[adId];
				if(entry.position) options.position = AdManager.AdPosition[entry.position];
				if(entry.width) options.width = entry.width;
				if(entry.height) options.height = entry.height;
				if(entry.autoShow) options.autoShow = entry.autoShow;
				
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					if(entry.width && entry.height){
						options.adSize = 'CUSTOM';
					}
					AdMob.createBanner(options, success, fail);
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.createBanner(options, success, fail);
				}			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", position: "BOTTOM_CENTER"},
			{network: "mopub", device: "ios", position: "BOTTOM_CENTER"}];
	data.network could be admob, mopub, dfp
	data.position could be: NO_CHANGE, TOP_LEFT, TOP_CENTER, TOP_RIGHT, LEFT, CENTER, RIGHT, BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT, POS_XY
	*/
	showBannerAtSelectedPosition: function(data) {
	
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.showBanner(entry.position);
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.showBanner(entry.position);
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", x: "", y: ""},
			{network: "mopub", device: "ios", x: "", y: ""}];
	data.network could be admob, mopub, dfp
	*/
	showBannerAtGivenXY: function(data) {
	
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.showBannerAtXY(entry.x, entry.y);
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.showBannerAtXY(entry.x, entry.y);
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android"},
			{network: "mopub", device: "ios"}];
	*/
	hideBanner: function(data) {
	
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.hideBanner();
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.hideBanner();
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android"},
			{network: "mopub", device: "ios"}];
	*/
	removeBanner: function(data) {
	
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.removeBanner();
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.removeBanner();
				}	
			
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", interstitial: ""},
			{network: "mopub", device: "ios", interstitial: ""}];
	*/
	prepareInterstitial: function(data, success, fail) {
	
		var options = {};
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){				
			
				if(entry.interstitial) options.adId = entry.interstitial;
				if(entry.autoShow) options.autoShow = entry.autoShow;
				
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.prepareInterstitial(options);
				}
				else if(entry.network.toLowerCase() == 'mopub'){
					MoPub.prepareInterstitial(options, success, fail);
				}
			}
		});
	},
	
	/*
	data could be an object (one network) or an array of network info
	each entry is an object with position, device and network properties
	data = [{network: "dfp", device: "android", interstitial: ""},
			{network: "mopub", device: "ios", interstitial: ""}];
	*/
	showInterstitial: function(data) {
	
		var opt = [];
		var userAgent = AdManager.getUserAgent();
		
		/* no data, we use DefaultOptions */
		if(!data){
			if(!AdManager.isObjEmpty(AdManager.DefaultOptions)){
				data = AdManager.DefaultOptions;
			}		
		}
		
		if(!Array.isArray(data)){
			opt.push(data);
		}
		else {
			opt = data;
		}
		
		opt.forEach(function(entry) {
            if(entry.device == 'default' || entry.device == userAgent){
			
				if(entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp'){
					AdMob.showInterstitial();
				}
				else if(entry.network.toLowerCase().toLowerCase() == 'mopub'){
					MoPub.showInterstitial();
				}	
			
			}
		});
	},
	
	isObjEmpty: function(obj) {
		return Object.keys(obj).length === 0;
	},
	
	getAdSize: function(){
	
		var height = screen.height;
		var width = screen.width;
	
		if(width >= 728 && height >= 90 ) {
			return AdManager.AdSize.LEADERBOARD;
		} else if (width >= 468 && height >= 60 ) {
			//return AdManager.AdSize.FULL_BANNER;
			return AdManager.AdSize.BANNER;
		} else if (width >= 320 && height >= 50 ) {
			return AdManager.AdSize.BANNER;
			
		}
	}
	
	
};
/*! AdStargate.JS - v0.0.1 - 2015-XX-XX
 *
 */
function AdStargate() {



    this.initialize = function(data, callbackSuccess, callbackError){
        err("unimplemented");
        callbackError("unimplemented");
    };

    this.createBanner = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.hideBanner = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.removeBanner = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.showBannerAtSelectedPosition = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.showBannerAtGivenXY = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.registerAdEvents = function(eventManager, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.prepareInterstitial = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };

    this.showInterstitial = function(data, callbackSuccess, callbackError){
    	err("unimplemented");
        callbackError("unimplemented");
    };
}


/**
 * @namespace
 * @protected
 *
 * @description
 * Analytics is a module to track events sending it to a webapp callback.
 * It's used internally in Stargate to track events like MFP get.
 * Before using it you need to set the callback calling {@link Stargate#setAnalyticsCallback}
 * 
 */
var analytics = (function(){

	var cb;
	var ana = {};

	/**
     * @name analytics#track
     * @memberof analytics
     *
     * @description Send an event to webapp analytics callback if it's defined
     *
     * @param {object} event
     */
	ana.track = function(trackedEvent) {

		if (typeof cb !== 'function') {
			return log("[analytics] callback not set!");
		}

		// send it
		try {
			cb(trackedEvent);
		}
		catch (error) {
			err("[analytics] callback error: "+error, error);
		}
	};

	/**
     * @name analytics#setCallback
     * @memberof analytics
     *
     * @description Save webapp analytics callback to be called when an event is tracked
     *
     * @param {function} callback
     */
	ana.setCallback = function(callback) {
		cb = callback;
	};

	return ana;
})();


/**
 * @name Stargate#setAnalyticsCallback
 * @memberof Stargate
 *
 * @description Save webapp analytics callback to be called when an event inside Stargaed need to be tracked
 *
 * @param {function} callback
 */
stargatePublic.setAnalyticsCallback = function(callback) {

	analytics.setCallback(callback);
};

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
    if(isRunningOnAndroid() && pushDatas.payload && pushDatas.payload.url && !pushDatas.foreground){
		return launchUrl(pushDatas.payload.url);
	}
    if(isRunningOnIos() && pushDatas.url){
        return launchUrl(pushDatas.url);
    }
};
/* global facebookConnectPlugin */


stargatePublic.facebookLogin = function(scope, callbackSuccess, callbackError) {


    // FIXME: check that facebook plugin is installed
    // FIXME: check parameters

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    
    facebookConnectPlugin.login(
        scope.split(","),

        // success callback
        function (userData) {
            log("[facebook] got userdata: ", userData);
            
            facebookConnectPlugin.getAccessToken(
                function(token) {
                    callbackSuccess({'accessToken' : token});
                },
                function(err) {
                    callbackError({'error': err});
                }
            );
        },

        // error callback
        function (error) {
            err("Got FB login error:", error);
            callbackError({'error': error});
        }
    );
};

stargatePublic.facebookShare = function(url, callbackSuccess, callbackError) {

    // FIXME: check that facebook plugin is installed
    // FIXME: check parameters

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    var options = {
        method: "share",
        href: url
    };
    
    facebookConnectPlugin.showDialog(
        options, 
        
        function(message){
            callbackSuccess({'message':message});
        }, 

        function(error){

            // error.errorMessage
            err("Got FB share error:", error);
            callbackError({'error':error});
        }
    );
};


var IAP = {

	id: '',
	alias: '',
	type: '',
	verbosity: '',
	paymethod: '',
    subscribeMethod: 'stargate',
    returnUrl: '',
    callbackSuccess: function(){log("[IAP] Undefined callbackSuccess");},
    callbackError: function(){log("[IAP] Undefined callbackError");},
    refreshDone: false,
    lastCreateuserUrl: '',
    lastCreateuserData: '',
    createUserAttempt: 0,
    maxCreateUserAttempt: 6,
	
	initialize: function () {
        if (!window.store) {
            err('Store not available');
            return;
        }
		
        // initialize with current url
        IAP.returnUrl = document.location.href;

        if (hybrid_conf.IAP.id) {
            IAP.id = hybrid_conf.IAP.id;
        }

        // 
        if (hybrid_conf.IAP.alias) {
            IAP.alias = hybrid_conf.IAP.alias;
        }

        //  --- type ---
        // store.FREE_SUBSCRIPTION = "free subscription";
        // store.PAID_SUBSCRIPTION = "paid subscription";
        // store.CONSUMABLE        = "consumable";
        // store.NON_CONSUMABLE    = "non consumable";
        if (hybrid_conf.IAP.type) {
            IAP.type = hybrid_conf.IAP.type;
        }

        // Available values: DEBUG, INFO, WARNING, ERROR, QUIET
        IAP.verbosity = 'INFO';

        IAP.paymethod = isRunningOnAndroid() ? 'gwallet' : 'itunes';


        log('IAP initialize id: '+IAP.id);
		
		if(isRunningOnAndroid()){
			IAP.getGoogleAccount();
		}
        window.store.verbosity = window.store[IAP.verbosity];
        // store.validator = ... TODO
        
        window.store.register({
            id:    IAP.id,
            alias: IAP.alias,
            type:  window.store[IAP.type]
        });
        
        window.store.when(IAP.alias).approved(function(p){IAP.onPurchaseApproved(p);});
        window.store.when(IAP.alias).verified(function(p){IAP.onPurchaseVerified(p);});
        window.store.when(IAP.alias).updated(function(p){IAP.onProductUpdate(p);});
		window.store.when(IAP.alias).owned(function(p){IAP.onProductOwned(p);});
		window.store.when(IAP.alias).cancelled(function(p){IAP.onCancelledProduct(p); });
		window.store.when(IAP.alias).error(function(errorPar){IAP.error(JSON.stringify(errorPar));});
        window.store.ready(function(){ IAP.onStoreReady();});
        window.store.when("order "+IAP.id).approved(function(order){IAP.onOrderApproved(order);});


        
    },

    doRefresh: function(force) {
        if (!IAP.refreshDone || force) {
            window.store.refresh();
            IAP.refreshDone = true;
        }
    },

    getPassword: function (transactionId){
        return md5('iap.'+transactionId+'.playme').substr(0,8);
    },
	
	getGoogleAccount: function(){
		window.accountmanager.getAccounts(IAP.checkGoogleAccount, IAP.error, "com.google");	
	},
	
	checkGoogleAccount: function(result){
		
		if(result) {
			log('[IAP] accounts');
			log(result);
			
			for(var i in result){
				window.localStorage.setItem('googleAccount', result[i].email);
				return result[i].email;
			}
		}	
	},
 
    onProductUpdate: function(p){
        log('IAP> Product updated.');
        log(JSON.stringify(p));
        if (p.owned) {
            log('[IAP] Subscribed!');
        } else {
            log('[IAP] Not Subscribed');
        }
    },
    
    onPurchaseApproved: function(p){
        log('IAP> Purchase approved.');
        log(JSON.stringify(p));
        //p.verify(); TODO before finish		
        p.finish();
    },
    onPurchaseVerified: function(p){
        log("subscription verified ", p);
        //p.finish(); TODO
    },
    onStoreReady: function(){
        log("\\o/ STORE READY \\o/");
        /*store.ask(IAP.alias)
        .then(function(data) {
              console.log('Price: ' + data.price);
              console.log('Description: ' + data.description);
              })
        .error(function(err) {
               // Invalid product / no connection.
               console.log('ERROR: ' + err.code);
               console.log('ERROR: ' + err.message);
               });*/
    },
    
    onProductOwned: function(p){
        log('[IAP] > Product Owned.');
        if (!p.transaction.id && isRunningOnIos()){
            log('[IAP] > no transaction id');
            return false;
        }
        window.localStorage.setItem('product', p);
		if(isRunningOnIos()){
			window.localStorage.setItem('transaction_id', p.transaction.id);
		}
        
        if (isRunningOnAndroid()){
            var purchase_token = p.transaction.purchaseToken + '|' + stargateConf.id + '|' + IAP.id;
            log('[IAP] Purchase Token: '+purchase_token);
            
            if(!window.localStorage.getItem('user_account')){
                IAP.createUser(p, purchase_token);
            }
            
        } else {
        
            window.storekit.loadReceipts(function (receipts) {
                
                if(!window.localStorage.getItem('user_account')){
                    if (!!!receipts.appStoreReceipt) {
                        log('[IAP] appStoreReceipt empty, ignoring request');
                    }
                    else {
                        log('[IAP] appStoreReceipt: ' + receipts.appStoreReceipt);
                        IAP.createUser(p, receipts.appStoreReceipt);
                    }
                }
            });
        }
        
    },
    
    onCancelledProduct: function(p){
        setBusy(false);
        IAP.callbackError({'iap_cancelled': 1, 'return_url' : IAP.returnUrl});
        log('[IAP] > Purchase cancelled ##################################', p);
    },
    
    onOrderApproved: function(order){
       log("[IAP] ORDER APPROVED "+IAP.id);
       order.finish();
    },
	
	error: function(error) {
        setBusy(false);
        IAP.callbackError({'iap_error': 1, 'return_url' : IAP.returnUrl});

		err('[IAP] error: '+error);	
	},
	


	createUser: function(product, purchaseToken){
        log('[IAP] createUser start ');
	   
		window.localStorage.setItem('user_account', 
            isRunningOnAndroid() ? 
                (window.localStorage.getItem('googleAccount') ? 
                    window.localStorage.getItem('googleAccount')
                    : purchaseToken+'@google.com')
                : product.transaction.id+'@itunes.com');
		
        var url = IAP.subscribeMethod;		
		
        var formData = {
            "paymethod": IAP.paymethod,
            "user_account": window.localStorage.getItem('user_account'),
            "purchase_token": purchaseToken,
            "return_url": IAP.returnUrl,
            "inapp_pwd": IAP.getPassword(purchaseToken),
            "hybrid": 1
        };

        IAP.lastCreateuserUrl = url;
        IAP.lastCreateuserData = formData;

        var onCreateError = function(error) {
            if (IAP.createUserAttempt <= IAP.maxCreateUserAttempt) {
                err("[IAP] createUser failed "+IAP.createUserAttempt+
                    " times, trying again... last error: "+JSON.stringify(error)
                );

                // trying again
                createUserAjaxCall();
            }
            else {
                // no more try, fail to webapp callbackerror

                log('[IAP] createUser onCreateError: removing user_account');
                window.localStorage.removeItem('user_account');

                var stargateResponseError = {"iap_error" : "1", "return_url" : IAP.returnUrl};
                setBusy(false);
                IAP.callbackError(stargateResponseError);
            }
        };

        var onCreateSuccess = function(user) {
            log('[IAP] createUser success ', user);
            try {
                user.device_id = runningDevice.uuid;
                if(window.localStorage.getItem('transaction_id')){
                    user.transaction_id = window.localStorage.getItem('transaction_id');
                }
                setBusy(false);
                IAP.callbackSuccess(user);
            }
            catch (error) {
                onCreateError(error);
            }
        };

        var startTimeoutSeconds = 10;

        var createUserAjaxCall = function() {
            setTimeout(function() {
                    IAP.createUserAttempt = IAP.createUserAttempt + 1;

                    log('[IAP] createUser attempt: '+IAP.createUserAttempt+
                        ' with timeout: '+startTimeoutSeconds+'sec.');

                    window.aja()
                        .method('POST')
                        .url(IAP.lastCreateuserUrl)
                        .cache(false)
                        .timeout(startTimeoutSeconds * 1000) // milliseconds
                        .data(IAP.lastCreateuserData)
                        .on('success', function(user){
                            onCreateSuccess(user);
                        })
                        .on('error', function(error){
                            onCreateError(error);
                        })
                        .on('4**', function(error){
                            onCreateError(error);
                        })
                        .on('5**', function(error){
                            onCreateError(error);
                        })
                        .on('timeout', function(){
                            onCreateError("timeout");
                        })
                        .on('end', function(){
                            log("[IAP] createUser end");
                            setBusy(false);
                        })
                        .go();

                    // more timeout
                    startTimeoutSeconds = startTimeoutSeconds + 5;

                },
                10 // millisecond after it's executed (when the thread that called setTimeout() has terminated)
            );
        };

        IAP.createUserAttempt = 0;

        // start first attempt
        createUserAjaxCall();
        
	}
};



stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    
    setBusy(true);

    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;

    IAP.doRefresh();
    window.store.order(IAP.id);
};


stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    // no set busy needed for restore as it's usually fast and 
    //  we cannot intercept error result, so the loader remain visible

    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;

    IAP.doRefresh(true);
};



/*  */

var stargateLoader = (function(){

var loaderCss = 
"#holdon-overlay {\n"+
"    filter: alpha(opacity=80);\n"+
"    position:fixed; \n"+
"    width:100%; \n"+
"    height:100%;\n"+
"    left: 0;\n"+
"    top: 0;\n"+
"    bottom: 0;\n"+
"    right: 0;\n"+
"    background: #000;\n"+
"    opacity: 0;\n"+
"    z-index: 9999;\n"+
"    transition: opacity 300ms linear;\n"+
"    -moz-transition: opacity 300ms linear;\n"+
"    -webkit-transition: opacity 300ms linear;\n"+
"}\n"+

"#holdon-overlay.show {\n"+
"  opacity: 0.8;\n"+
"}\n"+

"#holdon-content-container{\n"+
"    width: 100%;\n"+
"    padding: 0;\n"+
"    vertical-align: middle;\n"+
"    display: table-cell !important;\n"+
"    margin: 0;\n"+
"    text-align: center;\n"+
"}\n"+

"#holdon-content {\n"+
"    text-align: center;\n"+
"    width: 50px;\n"+
"    height: 57px;\n"+
"    position: absolute;\n"+
"    top: 50%;\n"+
"    left: 50%;\n"+
"    margin: -28px 0 0 -25px;\n"+
"}\n"+

"#holdon-message {\n"+
"    width:100%;\n"+
"    text-align: center;\n"+
"    position: absolute;\n"+
"    top: 55%;\n"+
"    color:white;\n"+
"}\n"+


".sk-rect {\n"+
"  width: 50px;\n"+
"  height: 40px;\n"+
"  text-align: center;\n"+
"  font-size: 10px;\n"+
"}\n"+

".sk-rect > div {\n"+
"  background-color: #333;\n"+
"  height: 100%;\n"+
"  width: 6px;\n"+
"  display: inline-block;\n"+
"  -webkit-animation: sk-rect-anim 1.2s infinite ease-in-out;\n"+
"  animation: sk-rect-anim 1.2s infinite ease-in-out;\n"+
"}\n"+

".sk-rect .rect2 {\n"+
"  -webkit-animation-delay: -1.1s;\n"+
"  animation-delay: -1.1s;\n"+
"}\n"+

".sk-rect .rect3 {\n"+
"  -webkit-animation-delay: -1.0s;\n"+
"  animation-delay: -1.0s;\n"+
"}\n"+

".sk-rect .rect4 {\n"+
"  -webkit-animation-delay: -0.9s;\n"+
"  animation-delay: -0.9s;\n"+
"}\n"+

".sk-rect .rect5 {\n"+
"  -webkit-animation-delay: -0.8s;\n"+
"  animation-delay: -0.8s;\n"+
"}\n"+

"@-webkit-keyframes sk-rect-anim {\n"+
"  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }  \n"+
"  20% { -webkit-transform: scaleY(1.0) }\n"+
"}\n"+

"@keyframes sk-rect-anim {\n"+
"  0%, 40%, 100% { \n"+
"    transform: scaleY(0.4);\n"+
"    -webkit-transform: scaleY(0.4);\n"+
"  }  20% { \n"+
"    transform: scaleY(1.0);\n"+
"    -webkit-transform: scaleY(1.0);\n"+
"  }\n"+
"}\n"+





".sk-cube {\n"+
"  width: 50px;\n"+
"  height: 40px;\n"+
"  text-align: center;\n"+
"  font-size: 10px;\n"+
"}\n"+

".sk-cube1, .sk-cube2 {\n"+
"  background-color: #333;\n"+
"  width: 15px;\n"+
"  height: 15px;\n"+
"  position: absolute;\n"+
"  top: 0;\n"+
"  left: 0;\n"+
"  \n"+
"  -webkit-animation: sk-cube 1.8s infinite ease-in-out;\n"+
"  animation: sk-cube 1.8s infinite ease-in-out;\n"+
"}\n"+

".sk-cube2 {\n"+
"  -webkit-animation-delay: -0.9s;\n"+
"  animation-delay: -0.9s;\n"+
"}\n"+

"@-webkit-keyframes sk-cube {\n"+
"  25% { -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5) }\n"+
"  50% { -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg) }\n"+
"  75% { -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5) }\n"+
"  100% { -webkit-transform: rotate(-360deg) }\n"+
"}\n"+

"@keyframes sk-cube {\n"+
"  25% { \n"+
"    transform: translateX(42px) rotate(-90deg) scale(0.5);\n"+
"    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);\n"+
"  } 50% { \n"+
"    transform: translateX(42px) translateY(42px) rotate(-179deg);\n"+
"    -webkit-transform: translateX(42px) translateY(42px) rotate(-179deg);\n"+
"  } 50.1% { \n"+
"    transform: translateX(42px) translateY(42px) rotate(-180deg);\n"+
"    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);\n"+
"  } 75% { \n"+
"    transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);\n"+
"    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);\n"+
"  } 100% { \n"+
"    transform: rotate(-360deg);\n"+
"    -webkit-transform: rotate(-360deg);\n"+
"  }\n"+
"}\n"+
".sk-dot {\n"+
"    width: 50px;\n"+
"    height: 40px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+

"    -webkit-animation: sk-dot-rotate 2.0s infinite linear;\n"+
"    animation: sk-dot-rotate 2.0s infinite linear;\n"+
"}\n"+
".sk-dot1, .sk-dot2 {\n"+
"  width: 60%;\n"+
"  height: 60%;\n"+
"  display: inline-block;\n"+
"  position: absolute;\n"+
"  top: 0;\n"+
"  background-color: #333;\n"+
"  border-radius: 100%;\n"+
"  \n"+
"  -webkit-animation: sk-dot-bounce 2.0s infinite ease-in-out;\n"+
"  animation: sk-dot-bounce 2.0s infinite ease-in-out;\n"+
"}\n"+

".sk-dot2 {\n"+
"  top: auto;\n"+
"  bottom: 0;\n"+
"  -webkit-animation-delay: -1.0s;\n"+
"  animation-delay: -1.0s;\n"+
"}\n"+

"@-webkit-keyframes sk-dot-rotate { 100% { -webkit-transform: rotate(360deg) }}\n"+
"@keyframes sk-dot-rotate { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg) }}\n"+

"@-webkit-keyframes sk-dot-bounce {\n"+
"  0%, 100% { -webkit-transform: scale(0.0) }\n"+
"  50% { -webkit-transform: scale(1.0) }\n"+
"}\n"+

"@keyframes sk-dot-bounce {\n"+
"  0%, 100% { \n"+
"    transform: scale(0.0);\n"+
"    -webkit-transform: scale(0.0);\n"+
"  } 50% { \n"+
"    transform: scale(1.0);\n"+
"    -webkit-transform: scale(1.0);\n"+
"  }\n"+
"}\n"+



".sk-bounce {\n"+
"    width: 60px;\n"+
"    height: 40px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+
"}\n"+

".sk-bounce > div {\n"+
"  width: 18px;\n"+
"  height: 18px;\n"+
"  background-color: #333;\n"+

"  border-radius: 100%;\n"+
"  display: inline-block;\n"+
"  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n"+
"  animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n"+
"}\n"+

".sk-bounce .bounce1 {\n"+
"    -webkit-animation-delay: -0.32s;\n"+
"    animation-delay: -0.32s;\n"+
"}\n"+

".sk-bounce .bounce2 {\n"+
"  -webkit-animation-delay: -0.16s;\n"+
"  animation-delay: -0.16s;\n"+
"}\n"+

"@-webkit-keyframes sk-bouncedelay {\n"+
"  0%, 80%, 100% { -webkit-transform: scale(0) }\n"+
"  40% { -webkit-transform: scale(1.0) }\n"+
"}\n"+

"@keyframes sk-bouncedelay {\n"+
"  0%, 80%, 100% { \n"+
"    -webkit-transform: scale(0);\n"+
"    transform: scale(0);\n"+
"  } 40% { \n"+
"    -webkit-transform: scale(1.0);\n"+
"    transform: scale(1.0);\n"+
"  }\n"+
"}\n"+




".sk-circle {\n"+
"    width: 60px;\n"+
"    height: 40px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+
"}\n"+
".sk-circle .sk-child {\n"+
"  width: 100%;\n"+
"  height: 100%;\n"+
"  position: absolute;\n"+
"  left: 0;\n"+
"  top: 0;\n"+
"}\n"+
".sk-circle .sk-child:before {\n"+
"  content: '';\n"+
"  display: block;\n"+
"  margin: 0 auto;\n"+
"  width: 15%;\n"+
"  height: 15%;\n"+
"  background-color: #333;\n"+
"  border-radius: 100%;\n"+
"  -webkit-animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;\n"+
"          animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;\n"+
"}\n"+
".sk-circle .sk-circle2 {\n"+
"  -webkit-transform: rotate(30deg);\n"+
"      -ms-transform: rotate(30deg);\n"+
"          transform: rotate(30deg); }\n"+
".sk-circle .sk-circle3 {\n"+
"  -webkit-transform: rotate(60deg);\n"+
"      -ms-transform: rotate(60deg);\n"+
"          transform: rotate(60deg); }\n"+
".sk-circle .sk-circle4 {\n"+
"  -webkit-transform: rotate(90deg);\n"+
"      -ms-transform: rotate(90deg);\n"+
"          transform: rotate(90deg); }\n"+
".sk-circle .sk-circle5 {\n"+
"  -webkit-transform: rotate(120deg);\n"+
"      -ms-transform: rotate(120deg);\n"+
"          transform: rotate(120deg); }\n"+
".sk-circle .sk-circle6 {\n"+
"  -webkit-transform: rotate(150deg);\n"+
"      -ms-transform: rotate(150deg);\n"+
"          transform: rotate(150deg); }\n"+
".sk-circle .sk-circle7 {\n"+
"  -webkit-transform: rotate(180deg);\n"+
"      -ms-transform: rotate(180deg);\n"+
"          transform: rotate(180deg); }\n"+
".sk-circle .sk-circle8 {\n"+
"  -webkit-transform: rotate(210deg);\n"+
"      -ms-transform: rotate(210deg);\n"+
"          transform: rotate(210deg); }\n"+
".sk-circle .sk-circle9 {\n"+
"  -webkit-transform: rotate(240deg);\n"+
"      -ms-transform: rotate(240deg);\n"+
"          transform: rotate(240deg); }\n"+
".sk-circle .sk-circle10 {\n"+
"  -webkit-transform: rotate(270deg);\n"+
"      -ms-transform: rotate(270deg);\n"+
"          transform: rotate(270deg); }\n"+
".sk-circle .sk-circle11 {\n"+
"  -webkit-transform: rotate(300deg);\n"+
"      -ms-transform: rotate(300deg);\n"+
"          transform: rotate(300deg); }\n"+
".sk-circle .sk-circle12 {\n"+
"  -webkit-transform: rotate(330deg);\n"+
"      -ms-transform: rotate(330deg);\n"+
"          transform: rotate(330deg); }\n"+
".sk-circle .sk-circle2:before {\n"+
"  -webkit-animation-delay: -1.1s;\n"+
"          animation-delay: -1.1s; }\n"+
".sk-circle .sk-circle3:before {\n"+
"  -webkit-animation-delay: -1s;\n"+
"          animation-delay: -1s; }\n"+
".sk-circle .sk-circle4:before {\n"+
"  -webkit-animation-delay: -0.9s;\n"+
"          animation-delay: -0.9s; }\n"+
".sk-circle .sk-circle5:before {\n"+
"  -webkit-animation-delay: -0.8s;\n"+
"          animation-delay: -0.8s; }\n"+
".sk-circle .sk-circle6:before {\n"+
"  -webkit-animation-delay: -0.7s;\n"+
"          animation-delay: -0.7s; }\n"+
".sk-circle .sk-circle7:before {\n"+
"  -webkit-animation-delay: -0.6s;\n"+
"          animation-delay: -0.6s; }\n"+
".sk-circle .sk-circle8:before {\n"+
"  -webkit-animation-delay: -0.5s;\n"+
"          animation-delay: -0.5s; }\n"+
".sk-circle .sk-circle9:before {\n"+
"  -webkit-animation-delay: -0.4s;\n"+
"          animation-delay: -0.4s; }\n"+
".sk-circle .sk-circle10:before {\n"+
"  -webkit-animation-delay: -0.3s;\n"+
"          animation-delay: -0.3s; }\n"+
".sk-circle .sk-circle11:before {\n"+
"  -webkit-animation-delay: -0.2s;\n"+
"          animation-delay: -0.2s; }\n"+
".sk-circle .sk-circle12:before {\n"+
"  -webkit-animation-delay: -0.1s;\n"+
"          animation-delay: -0.1s; }\n"+

"@-webkit-keyframes sk-circleBounceDelay {\n"+
"  0%, 80%, 100% {\n"+
"    -webkit-transform: scale(0);\n"+
"            transform: scale(0);\n"+
"  } 40% {\n"+
"    -webkit-transform: scale(1);\n"+
"            transform: scale(1);\n"+
"  }\n"+
"}\n"+

"@keyframes sk-circleBounceDelay {\n"+
"  0%, 80%, 100% {\n"+
"    -webkit-transform: scale(0);\n"+
"            transform: scale(0);\n"+
"  } 40% {\n"+
"    -webkit-transform: scale(1);\n"+
"            transform: scale(1);\n"+
"  }\n"+
"}\n"+




".sk-cube-grid {\n"+
"    width: 60px;\n"+
"    height: 60px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+
"}\n"+

".sk-cube-grid .sk-cube-child {\n"+
"  width: 33%;\n"+
"  height: 33%;\n"+
"  background-color: #333;\n"+
"  float: left;\n"+
"  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;\n"+
"          animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out; \n"+
"}\n"+
".sk-cube-grid .sk-cube-grid1 {\n"+
"  -webkit-animation-delay: 0.2s;\n"+
"          animation-delay: 0.2s; }\n"+
".sk-cube-grid .sk-cube-grid2 {\n"+
"  -webkit-animation-delay: 0.3s;\n"+
"          animation-delay: 0.3s; }\n"+
".sk-cube-grid .sk-cube-grid3 {\n"+
"  -webkit-animation-delay: 0.4s;\n"+
"          animation-delay: 0.4s; }\n"+
".sk-cube-grid .sk-cube-grid4 {\n"+
"  -webkit-animation-delay: 0.1s;\n"+
"          animation-delay: 0.1s; }\n"+
".sk-cube-grid .sk-cube-grid5 {\n"+
"  -webkit-animation-delay: 0.2s;\n"+
"          animation-delay: 0.2s; }\n"+
".sk-cube-grid .sk-cube-grid6 {\n"+
"  -webkit-animation-delay: 0.3s;\n"+
"          animation-delay: 0.3s; }\n"+
".sk-cube-grid .sk-cube-grid7 {\n"+
"  -webkit-animation-delay: 0s;\n"+
"          animation-delay: 0s; }\n"+
".sk-cube-grid .sk-cube-grid8 {\n"+
"  -webkit-animation-delay: 0.1s;\n"+
"          animation-delay: 0.1s; }\n"+
".sk-cube-grid .sk-cube-grid9 {\n"+
"  -webkit-animation-delay: 0.2s;\n"+
"          animation-delay: 0.2s; }\n"+

"@-webkit-keyframes sk-cubeGridScaleDelay {\n"+
"  0%, 70%, 100% {\n"+
"    -webkit-transform: scale3D(1, 1, 1);\n"+
"            transform: scale3D(1, 1, 1);\n"+
"  } 35% {\n"+
"    -webkit-transform: scale3D(0, 0, 1);\n"+
"            transform: scale3D(0, 0, 1); \n"+
"  }\n"+
"}\n"+

"@keyframes sk-cubeGridScaleDelay {\n"+
"  0%, 70%, 100% {\n"+
"    -webkit-transform: scale3D(1, 1, 1);\n"+
"            transform: scale3D(1, 1, 1);\n"+
"  } 35% {\n"+
"    -webkit-transform: scale3D(0, 0, 1);\n"+
"            transform: scale3D(0, 0, 1);\n"+
"  } \n"+
"}\n"+


".sk-folding-cube {\n"+
"  margin: 20px auto;\n"+
"  width: 40px;\n"+
"  height: 40px;\n"+
"  position: relative;\n"+
"  -webkit-transform: rotateZ(45deg);\n"+
"          transform: rotateZ(45deg);\n"+
"}\n"+

".sk-folding-cube .sk-cube-parent {\n"+
"  float: left;\n"+
"  width: 50%;\n"+
"  height: 50%;\n"+
"  position: relative;\n"+
"  -webkit-transform: scale(1.1);\n"+
"      -ms-transform: scale(1.1);\n"+
"          transform: scale(1.1); \n"+
"}\n"+
".sk-folding-cube .sk-cube-parent:before {\n"+
"  content: '';\n"+
"  position: absolute;\n"+
"  top: 0;\n"+
"  left: 0;\n"+
"  width: 100%;\n"+
"  height: 100%;\n"+
"  background-color: #333;\n"+
"  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;\n"+
"          animation: sk-foldCubeAngle 2.4s infinite linear both;\n"+
"  -webkit-transform-origin: 100% 100%;\n"+
"      -ms-transform-origin: 100% 100%;\n"+
"          transform-origin: 100% 100%;\n"+
"}\n"+
".sk-folding-cube .sk-cubechild2 {\n"+
"  -webkit-transform: scale(1.1) rotateZ(90deg);\n"+
"          transform: scale(1.1) rotateZ(90deg);\n"+
"}\n"+
".sk-folding-cube .sk-cubechild3 {\n"+
"  -webkit-transform: scale(1.1) rotateZ(180deg);\n"+
"          transform: scale(1.1) rotateZ(180deg);\n"+
"}\n"+
".sk-folding-cube .sk-cubechild4 {\n"+
"  -webkit-transform: scale(1.1) rotateZ(270deg);\n"+
"          transform: scale(1.1) rotateZ(270deg);\n"+
"}\n"+
".sk-folding-cube .sk-cubechild2:before {\n"+
"  -webkit-animation-delay: 0.3s;\n"+
"          animation-delay: 0.3s;\n"+
"}\n"+
".sk-folding-cube .sk-cubechild3:before {\n"+
"  -webkit-animation-delay: 0.6s;\n"+
"          animation-delay: 0.6s; \n"+
"}\n"+
".sk-folding-cube .sk-cubechild4:before {\n"+
"  -webkit-animation-delay: 0.9s;\n"+
"          animation-delay: 0.9s;\n"+
"}\n"+
"@-webkit-keyframes sk-foldCubeAngle {\n"+
"  0%, 10% {\n"+
"    -webkit-transform: perspective(140px) rotateX(-180deg);\n"+
"            transform: perspective(140px) rotateX(-180deg);\n"+
"    opacity: 0; \n"+
"  } 25%, 75% {\n"+
"    -webkit-transform: perspective(140px) rotateX(0deg);\n"+
"            transform: perspective(140px) rotateX(0deg);\n"+
"    opacity: 1; \n"+
"  } 90%, 100% {\n"+
"    -webkit-transform: perspective(140px) rotateY(180deg);\n"+
"            transform: perspective(140px) rotateY(180deg);\n"+
"    opacity: 0; \n"+
"  } \n"+
"}\n"+

"@keyframes sk-foldCubeAngle {\n"+
"  0%, 10% {\n"+
"    -webkit-transform: perspective(140px) rotateX(-180deg);\n"+
"            transform: perspective(140px) rotateX(-180deg);\n"+
"    opacity: 0; \n"+
"  } 25%, 75% {\n"+
"    -webkit-transform: perspective(140px) rotateX(0deg);\n"+
"            transform: perspective(140px) rotateX(0deg);\n"+
"    opacity: 1; \n"+
"  } 90%, 100% {\n"+
"    -webkit-transform: perspective(140px) rotateY(180deg);\n"+
"            transform: perspective(140px) rotateY(180deg);\n"+
"    opacity: 0; \n"+
"  }\n"+
"}\n";


	function addcss(css){
		var head = document.getElementsByTagName('head')[0];
		var s = document.createElement('style');
		s.setAttribute('type', 'text/css');
		if (s.styleSheet) {   // IE
			s.styleSheet.cssText = css;
		} else {                // the world
			s.appendChild(document.createTextNode(css));
		}
		head.appendChild(s);
	}

	var cssAdded = false;


	var createElement = function(html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		//var elements = div.childNodes;
		//var element = div.firstChild
		return div.firstChild;
	};

    
	var sgl = {};
    
    sgl.start = function(properties){

    	if (!cssAdded) {
			addcss(loaderCss);
			cssAdded = true;
		}

    	var oldOverlay = document.querySelector('#holdon-overlay');
    	if (oldOverlay) {
    		oldOverlay.parentNode.removeChild(oldOverlay);
    		oldOverlay = null;
    	}

        var theme = "sk-rect";
        var content = "";
        var message = "";
        
        if(properties){
            if(properties.hasOwnProperty("theme")){//Choose theme if given
                theme = properties.theme;
            }
            
            if(properties.hasOwnProperty("message")){//Choose theme if given
                message = properties.message;
            }
        }
        
        switch(theme){
            case "custom":
                content = '<div style="text-align: center;">' + properties.content + "</div>";
            break;
            case "sk-dot":
                content = '<div class="sk-dot"> <div class="sk-dot1"></div> <div class="sk-dot2"></div> </div>';
            break;
            case "sk-rect":
                content = '<div class="sk-rect"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>';
            break;
            case "sk-cube":
                content = '<div class="sk-cube"> <div class="sk-cube1"></div> <div class="sk-cube2"></div> </div>';
            break;
            case "sk-bounce":
                content = '<div class="sk-bounce"> <div class="bounce1"></div> <div class="bounce2"></div> <div class="bounce3"></div> </div>';
            break;
            case "sk-circle":
                content = '<div class="sk-circle"> <div class="sk-circle1 sk-child"></div> <div class="sk-circle2 sk-child"></div> <div class="sk-circle3 sk-child"></div> <div class="sk-circle4 sk-child"></div> <div class="sk-circle5 sk-child"></div> <div class="sk-circle6 sk-child"></div> <div class="sk-circle7 sk-child"></div> <div class="sk-circle8 sk-child"></div> <div class="sk-circle9 sk-child"></div> <div class="sk-circle10 sk-child"></div> <div class="sk-circle11 sk-child"></div> <div class="sk-circle12 sk-child"></div> </div>';
            break;
            case "sk-cube-grid":
                content = '<div class="sk-cube-grid"> <div class="sk-cube-child sk-cube-grid1"></div> <div class="sk-cube-child sk-cube-grid2"></div> <div class="sk-cube-child sk-cube-grid3"></div> <div class="sk-cube-child sk-cube-grid4"></div> <div class="sk-cube-child sk-cube-grid5"></div> <div class="sk-cube-child sk-cube-grid6"></div> <div class="sk-cube-child sk-cube-grid7"></div> <div class="sk-cube-child sk-cube-grid8"></div> <div class="sk-cube-child sk-cube-grid9"></div> </div>';
            break;
            case "sk-folding-cube":
                content = '<div class="sk-folding-cube"> <div class="sk-cubechild1 sk-cube-parent"></div> <div class="sk-cubechild2 sk-cube-parent"></div> <div class="sk-cubechild4 sk-cube-parent"></div> <div class="sk-cubechild3 sk-cube-parent"></div> </div>';
            break;
            default:
                content = '<div class="sk-rect"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>';
                err("[loading] " + theme + " doesn't exist");
            break;
        }
        
        var HolderHtml = '<div id="holdon-overlay">\n'+
                         '   <div id="holdon-content-container">\n'+
                         '       <div id="holdon-content">'+content+'</div>\n'+
                         '       <div id="holdon-message">'+message+'</div>\n'+
                         '   </div>\n'+
                         '</div>';
        
        var body = document.getElementsByTagName('body')[0];
        var holderElement = createElement(HolderHtml);

        if(properties){
            if(properties.backgroundColor){
            	holderElement.style.backgroundColor = properties.backgroundColor;
            	holderElement.querySelector('#holdon-message').style.color = properties.textColor;
            }
        }

        body.appendChild(holderElement);
        
        holderElement = null;

        // fade in
        setTimeout(
	        function() {
	        	// remove
				var ho = document.getElementById('holdon-overlay');
				ho.classList.add('show');
	        },
	        1
	    );
        
        
    };
    
    sgl.stop = function(){
    	var holdonOverlay = document.querySelector('#holdon-overlay');
    	if (holdonOverlay) {

        	holdonOverlay.classList.remove('show');

    		setTimeout(
		        function() {
		        	// remove
    				holdonOverlay.parentNode.removeChild(holdonOverlay);
    				holdonOverlay = null;
		        },
		        500
		    );
    	}
    };

	return sgl;

})();





var startLoading = function(properties) {
	if (typeof properties !== 'object') {
		properties = {};
	}
	if (! properties.theme) {
		properties.theme = 'sk-circle';
	}
	stargateLoader.start(properties);
};

var stopLoading = function() {
	stargateLoader.stop();
};

var changeLoadingMessage = function(newMessage) {
	var hom = document.querySelector('#holdon-message');
	if (hom) {
		hom.textContent = newMessage;
		return true;
	}
	return false;
};


// ----- FIXME ---- only for testing purposes ----
if (typeof stargatePublic.test !== 'object') {
	stargatePublic.test = {};
}
if (typeof stargatePublic.test.loading !== 'object') {
	stargatePublic.test.loading = {};
}

stargatePublic.test.loading.start = startLoading;
stargatePublic.test.loading.stop = stopLoading;
stargatePublic.test.loading.change = changeLoadingMessage;
// ------------------------------------------------




// - not used, enable if needed -
//var timeoutLoading = function(t) {
//    startLoading();
//    setTimeout(
//        function(){
//            stopLoading();
//        },
//        t
//    );
//};

// FIXME: used inside store.js
window.startLoading = startLoading;
window.stopLoading = stopLoading;

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*jslint bitwise: true */
/*global unescape, define, module */

var md5 = (function () {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    return md5;
}());


/* global URI, URITemplate  */

/**
 * @namespace
 * @protected
 * 
 * @description
 * MFP is used to recognize user coming from webapp.
 *
 * For example an usual flow can be:
 *  1. an user open the browser and go to our webapp;
 *  2. then he's suggested to install the app
 *  3. he's sent to the app store and install the app
 *  4. our app with Stargate integrated is opened by our user
 *  5. MFP module send an api request to the server and the user is recongized
 *  6. the previous session is restored by the MobileFingerPrint.setSession
 * 
 */
var MFP = (function(){

	// contains private module members
	var MobileFingerPrint = {};

	/**
     * @name MFP#check
     * @memberof MFP
     *
     * @description Start the MFP check to see if user has a session on the server
     *
     */
	MobileFingerPrint.check = function(){

		//if (window.localStorage.getItem('mfpCheckDone')){
		//	return;
		//}

		// country defined on main stargate.js
		if (!country) {		
			return err("Country not defined!");
		}

		MobileFingerPrint.get(country);
	};

	MobileFingerPrint.getContents = function(country, namespace, label, extData){
		var contents_inapp = {};
	    contents_inapp.api_country = label;
	    contents_inapp.country = country;
	    contents_inapp.fpnamespace = namespace;
	    if (extData){
	        contents_inapp.extData = extData;
	    }
	    
	    var json_data = JSON.stringify(contents_inapp);
	       
	    return json_data;
	};

	MobileFingerPrint.getPonyValue = function(ponyWithEqual) {
		try {
			return ponyWithEqual.split('=')[1];
		}
		catch (e) {
			err(e);
		}
		return '';
	};

	MobileFingerPrint.setSession = function(pony){

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
	  			"_PONY": MobileFingerPrint.getPonyValue(pony)
	  	});
				
		log("[MobileFingerPrint] going to url: ", newUrl);

		launchUrl(newUrl);
	};

	MobileFingerPrint.get = function(country){
		var expire = "";

	    // stargateConf.api.mfpGetUriTemplate:
	    // "http://domain.com/path.ext{?apikey,contents_inapp,country,expire}",

		var mfpUrl = URITemplate(stargateConf.api.mfpGetUriTemplate)
	  		.expand({
	  			"apikey": stargateConf.motime_apikey,
	  			"contents_inapp": MobileFingerPrint.getContents(country, stargateConf.namespace, stargateConf.label),
	  			"country": country,
	  			"expire": expire
	  	});

        window.aja()
            .url(mfpUrl)
            .type('jsonp')
            .on('success', function(response){
                
                log("[MobileFingerPrint] get() response: ", response);

                var ponyUrl = '';

                if (response.content.inappInfo){
                    var jsonStruct = JSON.parse(response.content.inappInfo);

                    var session_id = 'UNKNOWN';

                    if (jsonStruct.extData) {
                    	if (jsonStruct.extData.ponyUrl) {
                    		ponyUrl = jsonStruct.extData.ponyUrl;
                    	}
                    	if (jsonStruct.extData.return_url) {
                    		window.localStorage.setItem('appUrl', jsonStruct.extData.return_url);
                    	}
                    	if (jsonStruct.extData.session_id) {
                    		session_id = jsonStruct.extData.session_id;
                    	}
                    }

                    analytics.track({
                    	page: 'hybrid_initialize',
                    	action: 'MFP_get',
                    	value: session_id
                    });
                    
                    MobileFingerPrint.setSession(ponyUrl);                
                }else{
                    log("[MobileFingerPrint] get(): Empty session");
                }
            })
            .on('error', function(error){
                err("[MobileFingerPrint] get() error: ", error);
            })
            .go();
	};


	return {
		check: MobileFingerPrint.check
	};

})();


/* globals Q */

/***
* 
* 
* 
*/

// current stargateVersion 
var stargateVersion = "2";

// logger function
var log = function(msg, obj) {
    if (typeof obj !== 'undefined') {
        console.log("[Stargate] "+msg+" ",obj);
    } else {
        console.log("[Stargate] "+msg);
    }
    return true;
};
var err = function(msg, obj) {
    if (typeof obj !== 'undefined') {
        console.error("[Stargate] "+msg+" ",obj);
    } else {
        console.error("[Stargate] "+msg);
    }
    return false;
};


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
//var isRunningOnCordova = function () {
//    return (typeof window.cordova !== "undefined");
//};
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



var getManifest = function() {

    var deferred = Q.defer();

    window.hostedwebapp.getManifest(
        function(manifest){
            deferred.resolve(manifest);
        },
        function(error){
            deferred.reject(new Error(error));
            console.error(error);
        }
    );
    return deferred.promise;
};

var launchUrl = function (url) {
    log("launchUrl: "+url);
    document.location.href = url;
};


var isStargateRunningInsideHybrid = false;
var isStargateInitialized = false;
var isStargateOpen = false;
var initializeCallback = null;
var initializeDeferred = null;

var appVersion = '';

/**
 * 
 * variables sent by server configuration
 * 
 */
var country = '',
    hybrid_conf = {};

/**
 * 
 * this is got from manifest
 * 
 */
var baseUrl;

var updateStatusBar = function() {

    if (typeof window.StatusBar === "undefined") {
        // missing cordova plugin
        return err("[StatusBar] missing cordova plugin");
    }
    if (typeof stargateConf.statusbar === "undefined") {
        return;
    }
    if (typeof stargateConf.statusbar.hideOnUrlPattern !== "undefined" && 
        stargateConf.statusbar.hideOnUrlPattern.constructor === Array) {

        var currentLocation = document.location.href;
        var hide = false;

        for (var i=0; i<stargateConf.statusbar.hideOnUrlPattern.length; i++) {

            var re = new RegExp(stargateConf.statusbar.hideOnUrlPattern[i]);
            
            if (re.test(currentLocation)) {
                hide = true;
                break;
            }
        }

        if (hide) {
            window.StatusBar.hide();
        }
        else {
            window.StatusBar.show();
        }
    }
};

var onPluginReady = function () {
    
    // FIXME: this is needed ??
    document.title = stargateConf.title;
    
    // set back cordova bridge mode to IFRAME_NAV overriding manifold settings
    if (isRunningOnIos() && (typeof window.cordova !== 'undefined') && cordova.require) {
        var exec = cordova.require('cordova/exec');
        exec.setJsToNativeBridgeMode(exec.jsToNativeModes.IFRAME_NAV);
    }
    

    updateStatusBar();

    
    if (hasFeature('mfp')) {
        MFP.check();
    }
    
    if (hasFeature('deltadna')) {
        window.deltadna.startSDK(
            stargateConf.deltadna.environmentKey,
            stargateConf.deltadna.collectApi,
            stargateConf.deltadna.engageApi,

            onDeltaDNAStartedSuccess,
            onDeltaDNAStartedError,

            stargateConf.deltadna.settings
        );
    }


    navigator.splashscreen.hide();
    setBusy(false);

    IAP.initialize();

    window.Cookies.set("hybrid", "1");
    window.Cookies.set("stargateVersion", stargateVersion);

    if (!window.localStorage.getItem('hybrid')) {
        window.localStorage.setItem('hybrid', 1);
    }
    if (!window.localStorage.getItem('stargateVersion')) {
        window.localStorage.setItem('stargateVersion', stargateVersion);
    }

    // apply webapp fixes
    webappsFixes.init();

    // initialize finished
    isStargateOpen = true;

    log("version "+stargatePackageVersion+" ready; "+
        "loaded from server version: v"+stargateVersion+
        " running in package version: "+appVersion);

    //execute callback
    // FIXME: check callback type is function
    initializeCallback(true);

    log("Stargate.initialize() done");
    initializeDeferred.resolve(true);
};

var onDeviceReady = function () {
    initDevice();

    Q.all([
        // include here all needed initializazion
        cordova.getAppVersion.getVersionNumber(),
        getManifest()
    ])
    .then(function(results) {
        
        appVersion = results[0];
		
		if (typeof results[1] !== 'object') {
			results[1] = JSON.parse(results[1]);
		}

        baseUrl = results[1].start_url;

        stargateConf = results[1].stargateConf;

        onPluginReady();
    })
    .fail(function (error) {
        err("onDeviceReady() error: "+error);
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
};

var stargateBusy = false;

// - not used, enable if needed -
//var isBusy = function() { return stargateBusy; };

var setBusy = function(value) {
    if (value) {
        stargateBusy = true;
        startLoading();
    }
    else {
        stargateBusy = false;
        stopLoading();
    }
};

var stargateConf = {
    features: {}
};

var hasFeature = function(feature) {
    return (typeof stargateConf.features[feature] !== 'undefined' && stargateConf.features[feature]);
};











// global variable used by old stargate client
// @deprecated since v0.2
window.pubKey = '';
// @deprecated since v0.2
window.forge = '';


/**
*
* initialize(configurations, callback)
*
* 
* @deprecated initialize(configurations, pubKey, forge, callback)
*
*/
stargatePublic.initialize = function(configurations, pubKeyPar, forgePar, callback) {

    // parameters checking to support both interfaces:
    //    initialize(configurations, callback)
    //    initialize(configurations, pubKey, forge, callback)
    if (typeof pubKeyPar === 'function' &&
        typeof forgePar === 'undefined' &&
        typeof callback === 'undefined') {
        // second parameter is the callback
        callback = pubKeyPar;
    }

    // check callback type is function
    // if not return a failing promise 
    if (typeof callback !== 'function') {
        err("Stargate.initialize() callback is not a function!");

        var errDefer = Q.defer();
        setTimeout(function(){
            // fail the promise
            errDefer.reject(new Error("Stargate.initialize() callback is not a function!"));
        }, 1);
        return errDefer.promise;
    }

    isStargateRunningInsideHybrid = isHybridEnvironment();

    // if i'm already initialized just:
    //  * execute the callback
    //  * return a resolving promise
    if (isStargateInitialized) {
        err("Stargate.initialize() already called, executing callback.");
        
        callback(isStargateRunningInsideHybrid);

        var alreadyRunningDefer = Q.defer();
        setTimeout(function(){
            // resolve the promise
            alreadyRunningDefer.resolve(isStargateRunningInsideHybrid);
        }, 1);
        return alreadyRunningDefer.promise;
    }


    isStargateInitialized = true;


    if(configurations.country){
        country = configurations.country;
    }
    
    if(configurations.hybrid_conf){
        if (typeof configurations.hybrid_conf === 'object') {
            hybrid_conf = configurations.hybrid_conf;
        } else {
            hybrid_conf = JSON.parse(decodeURIComponent(configurations.hybrid_conf));
        }
    }

    // if not running inside hybrid save the configuration then:
    //  * call the callback and return a resolving promise
    if (!isStargateRunningInsideHybrid) {

        log("version "+stargatePackageVersion+" running outside hybrid; "+
            "loaded from server version: v"+stargateVersion);

        callback(isStargateRunningInsideHybrid);

        var notHybridDefer = Q.defer();
        setTimeout(function(){
            // resolve the promise
            notHybridDefer.resolve(isStargateRunningInsideHybrid);
        }, 1);
        return notHybridDefer.promise;
    }

    initializeCallback = callback;
    initializeDeferred = Q.defer();

    // finish the initialization of cordova plugin when deviceReady is received
    document.addEventListener('deviceready', onDeviceReady, false);
    
    return initializeDeferred.promise;
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
    // FIXME: check that inappbrowser plugin is installed otherwise retunr error

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
stargatePublic.checkConnection = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    // FIXME: check that network plugin is installed

    var networkState = navigator.connection.type;
    callbackSuccess({'networkState': networkState});
};
stargatePublic.getDeviceID = function(callbackSuccess, callbackError) {

	if (!isStargateInitialized) {
		return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    // FIXME: check that device plugin is installed
    // FIXME: integrate with other stargate device handling method

    var deviceID = runningDevice.uuid;
    callbackSuccess({'deviceID': deviceID});
};

stargatePublic.setStatusbarVisibility = function(visibility, callbackSuccess, callbackError) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    if (typeof window.StatusBar === "undefined") {
        // missing cordova plugin
        err("[StatusBar] missing cordova plugin");
        return callbackError("missing cordova plugin");
    }

    if (visibility) {
        window.StatusBar.show();
        return callbackSuccess("statusbar shown");
    }

    window.StatusBar.hide();
    return callbackSuccess("statusbar hided");
};


stargatePublic.getVersion = function() {
    return stargatePackageVersion;
};

/**  
 *
 *  stargatePublic.inApp* -> iap.js
 *
 */

stargatePublic.ad = new AdStargate();




// FIXME
//function reboot(){
//    window.location.href = 'index.html';
//}


// - not used, enable if needed -
//var utils = {
//    elementHasClass: function (element, selector) {
//        var className = " " + selector + " ",
//            rclass = "/[\n\t\r]/g",
//            i = 0;
//        if ( (" " + element.className + " ").replace(rclass, " ").indexOf(className) >= 0 ) {
//            return true;
//        }
//        return false;
//    }
//};


// - not used, enable if needed -
//function ab2str(buf) {
//    return String.fromCharCode.apply(null, new Uint16Array(buf));
//}

// - not used, enable if needed -
//function str2ab(str) {
//    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
//    var bufView = new Uint16Array(buf);
//    for (var i=0; i < str.length; i++) {
//        bufView[i] = str.charCodeAt(i);
//    }
//    return buf;
//}



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
    // Just return a value to define the module export
    return stargatePublic;
}));


