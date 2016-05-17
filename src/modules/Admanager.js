/**
 * Admanager module needs cordova-plugin-admobpro, cordova-plugin-mopub
 * @module src/modules/Admanager
 * @type {Object}
 * @requires ./Utils.js,./Decorators
 */
(function(Utils, Decorators,_modules) {


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
    var LOG = new Utils.Logger("all","[Admanager]");

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

    function Admanager(){
        LOG.i(POSITIONS, SIZES);
    }
    
    Admanager.prototype.createBannerView = function(){LOG.d("NotImplemented");};
    Admanager.prototype.requestInterstitialAd = function(){LOG.d("NotImplemented");};
    Admanager.prototype.showAd = function(){LOG.d("NotImplemented");};
    
    function isCordovaPluginDefined(){return window.plugins && typeof window.plugins.AdMob !== "undefined";}    
        
    Admanager.prototype.createBannerView = Decorators.requireCondition(isCordovaPluginDefined, 
                                Admanager.prototype.createBannerView, 
                                Admanager.prototype, 
                                "cordova-plugin-admob not installed", "warn");
    
    _modules.Admanager = new Admanager();

})(stargateModules.Utils, stargateModules.Decorators, stargateModules);