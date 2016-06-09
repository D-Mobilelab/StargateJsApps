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
	                                        DefaultOptions: null,

	                                        initialize: function(options, success, fail) {
		                                        if (options)
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

	                                        isAdMobSupported: function() {
		                                        return AdManager.AdMobSupport;
	},

	                                        isMoPubSupported: function() {
		                                        return AdManager.MoPubSupport;
	},

	                                        getUserAgent: function() {
		                                        if (/(android)/i.test(navigator.userAgent)) {
			                                        return "android";
		} else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
			                                        return "ios";
		} else {
			                                        return "other";
		}
	},

	/* setOptions(options, success, fail); */
	                                        initAdMob: function(options, success, fail) {

		                                        var defaultOptions = {
			// bannerId: AdManager.AdMobID[userAgent].banner,
			// interstitialId: AdManager.AdMobID[userAgent].interstitial,
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
	// initMoPub: function(options, success, fail){
	//
	// },

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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          var adId = AdManager.getAdSize().toLowerCase();

				                                                                                          if (entry.overlap) options.overlap = entry.overlap;
				                                                                                          if (entry.offsetTopBar) options.offsetTopBar = entry.offsetTopBar;
				                                                                                          options.adSize = AdManager.getAdSize();
				                                                                                          if (adId) options.adId = entry[adId];
				                                                                                          if (entry.position) options.position = AdManager.AdPosition[entry.position];
				                                                                                          if (entry.width) options.width = entry.width;
				                                                                                          if (entry.height) options.height = entry.height;
				                                                                                          if (entry.autoShow) options.autoShow = entry.autoShow;

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        if (entry.width && entry.height) {
						                                        options.adSize = 'CUSTOM';
					}
					                                        AdMob.createBanner(options, success, fail);
				}
				                                                                                          else if (entry.network.toLowerCase().toLowerCase() == 'mopub') {
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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        AdMob.showBanner(entry.position);
				}
				                                                                                          else if (entry.network.toLowerCase().toLowerCase() == 'mopub') {
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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        AdMob.showBannerAtXY(entry.x, entry.y);
				}
				                                                                                          else if (entry.network.toLowerCase().toLowerCase() == 'mopub') {
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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        AdMob.hideBanner();
				}
				                                                                                          else if (entry.network.toLowerCase().toLowerCase() == 'mopub') {
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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        AdMob.removeBanner();
				}
				                                                                                          else if (entry.network.toLowerCase().toLowerCase() == 'mopub') {
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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          if (entry.interstitial) options.adId = entry.interstitial;
				                                                                                          if (entry.autoShow) options.autoShow = entry.autoShow;

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        AdMob.prepareInterstitial(options);
				}
				                                                                                          else if (entry.network.toLowerCase() == 'mopub') {
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
		                                        if (!data) {
			                                        if (!AdManager.isObjEmpty(AdManager.DefaultOptions)) {
				                                        data = AdManager.DefaultOptions;
			}
		}

		                                        if (!Array.isArray(data)) {
			                                        opt.push(data);
		}
		                                        else {
			                                        opt = data;
		}

		                                        opt.forEach(function(entry) {
  if (entry.device == 'default' || entry.device == userAgent) {

				                                                                                          if (entry.network.toLowerCase() == 'admob' || entry.network.toLowerCase() == 'dfp') {
					                                        AdMob.showInterstitial();
				}
				                                                                                          else if (entry.network.toLowerCase().toLowerCase() == 'mopub') {
					                                        MoPub.showInterstitial();
				}

			                                                  }
		});
	},

	                                        isObjEmpty: function(obj) {
		                                        return Object.keys(obj).length === 0;
	},

	                                        getAdSize: function() {

		                                        var height = screen.height;
		                                        var width = screen.width;

		                                        if (width >= 728 && height >= 90) {
			                                        return AdManager.AdSize.LEADERBOARD;
		} else if (width >= 468 && height >= 60) {
			// return AdManager.AdSize.FULL_BANNER;
			                                        return AdManager.AdSize.BANNER;
		} else if (width >= 320 && height >= 50) {
			                                        return AdManager.AdSize.BANNER;

		}
	}


};
