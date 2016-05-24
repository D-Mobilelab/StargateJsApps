/**
 * AdManager module needs cordova-plugin-admobpro, cordova-plugin-mopub
 * @module src/modules/AdManager
 * @type {Object}
 * @requires ./Utils.js,./Decorators.js
 */
(function(Utils, Decorators, _modules){


    var POSITIONS = {
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
    };

    var SIZES = {
            SMART_BANNER: 'SMART_BANNER',
            BANNER: 'BANNER',
            MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
            FULL_BANNER: 'FULL_BANNER',
            LEADERBOARD: 'LEADERBOARD',
            SKYSCRAPER: 'SKYSCRAPER'
    };

    var admobid = {};
    var LOG = new Utils.Logger("all","[AdManager]");

    if(/(android)/i.test(navigator.userAgent) ) {
        admobid = { // for Android
            banner: 'ca-app-pub-6869992474017983/9375997553',
            interstitial: 'ca-app-pub-6869992474017983/1657046752'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
        admobid = { // for iOS
            banner: 'ca-app-pub-6869992474017983/4806197152',
            interstitial: 'ca-app-pub-6869992474017983/7563979554'
        };
    } else {
        admobid = { // for Windows Phone
            banner: 'ca-app-pub-6869992474017983/8878394753',
            interstitial: 'ca-app-pub-6869992474017983/1355127956'
        };
    }

    function AdManager(){
        LOG.i(POSITIONS, SIZES);
    }
    
    /*
    createBanner(adId/options, success, fail);
    removeBanner();
    showBanner(position);
    showBannerAtXY(x, y);
    hideBanner();

    // use interstitial
    prepareInterstitial(adId/options, success, fail);
    showInterstitial();
    isInterstitialReady(function(ready){ if(ready){ } });

    // use reward video
    prepareRewardVideoAd(adId/options, success, fail);
    showRewardVideoAd();

    // set values for configuration and targeting
    setOptions(options, success, fail);
    
    // get user ad settings
    getAdSettings(function(inf){ inf.adId; inf.adTrackingEnabled; }, fail);
    */
    AdManager.prototype.createBanner = function(){LOG.d("NotImplemented");};
    AdManager.prototype.removeBanner = function(){LOG.d("NotImplemented");};
    AdManager.prototype.showBanner = function(){LOG.d("NotImplemented");};
    AdManager.prototype.showBannerAtGivenXY = function(){LOG.d("NotImplemented");};
    AdManager.prototype.showBannerAtSelectedPosition = function(){LOG.d("NotImplemented");};
    AdManager.prototype.hideBanner = function(){LOG.d("NotImplemented");};
    AdManager.prototype.prepareInterstitial = function(){LOG.d("NotImplemented");};
    AdManager.prototype.showInterstitial = function(){LOG.d("NotImplemented");};
    AdManager.prototype.prepareRewardVideoAd = function(){LOG.d("NotImplemented");};
    AdManager.prototype.registerAdEvents = function(){LOG.d("NotImplemented");};
    AdManager.prototype.showRewardVideoAd = function(){LOG.d("NotImplemented");};
    AdManager.prototype.setOptions = function(){LOG.d("NotImplemented");};    

    function isCordovaPluginDefined(){
        return window.plugins && typeof window.plugins.AdMob !== "undefined";
    }
    
    // unwrap it as soon as implemented
    for(var method in AdManager.prototype){
        if(AdManager.prototype.hasOwnProperty(method)){
            AdManager.prototype[method] = Decorators.requireCondition(isCordovaPluginDefined, 
                                AdManager.prototype[method], 
                                AdManager.prototype, 
                                "cordova-plugin-admob not installed", 
                                "warn");
        }
    }
    
    _modules.AdManager = new AdManager();

})(stargateModules.Utils, stargateModules.Decorators, stargateModules);