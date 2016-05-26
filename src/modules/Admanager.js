/**
 * AdManager module needs https://github.com/appfeel/admob-google-cordova
 * @module src/modules/AdManager
 * @type {Object}
 * @requires ./Utils.js,./Decorators.js
 */
(function(Utils, Decorators, _modules){

    var admobid = {};

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

    function AdManager(){}
    
    var platform;    
    var supportedPlatform = ["ios","android"];
    function checkSupport(arr, val) {
        return arr.some(function(arrVal){ return val === arrVal;});
    }
    
    AdManager.prototype.initialize = function(options){
        platform = window.device.platform.toLowerCase();
        
        if(checkSupport(supportedPlatform, platform)){
            this.AD_TYPE = window.admob.AD_TYPE;
            this.AD_SIZE = window.admob.AD_SIZE;
            this.LOG = new Utils.Logger("all","[AdManager]");
            this.LOG.i("initialize admob with", platform, options[platform]);
            this.setOptions(options[platform]);
            return Promise.resolve("OK");           
        } else {
            return Promise.reject([platform, "Unsupported"].join(" "));
        }        
    };
    
    AdManager.prototype.createBanner = function(options){
        this.LOG.i("createBanner");
        var self = this;
        options = Utils.extend(self.options, options || {});
        return new Promise(function(resolve, reject){
            window.admob.createBannerView(options, resolve, reject);
        });
    };
    
    AdManager.prototype.removeBanner = function(){
        window.admob.destroyBannerView();
        return Promise.resolve("OK");
    };
    
    AdManager.prototype.showBanner = function(){
        return new Promise(function(resolve, reject){
            window.admob.showBannerAd(true, resolve, reject);
        });
    };
    
    AdManager.prototype.showBannerAtGivenXY = function(){this.LOG.d("NotImplemented");};
    AdManager.prototype.showBannerAtSelectedPosition = function(){this.LOG.d("NotImplemented");};
    
    AdManager.prototype.hideBanner = function(){        
        return new Promise(function(resolve, reject){
            window.admob.showBannerAd(false, resolve, reject);
        });        
    };
    
    AdManager.prototype.prepareInterstitial = function(options){
        var self = this;
        return new Promise(function(resolve, reject){
            window.admob.requestInterstitialAd(Utils.extend(self.options, options || {}), resolve, reject);                        
        });
    };
    
    AdManager.prototype.showInterstitial = function(){
        return new Promise(function(resolve, reject){
            window.admob.showInterstitialAd(resolve, reject);
        });
    };
    
    AdManager.prototype.registerAdEvents = function(eventManager){
        this.LOG.d("NotImplemented", eventManager);
    };
    
    AdManager.prototype.setOptions = function(options){
        this.options = options || {};
        window.admob.setOptions(options || {});
    };

    function isCordovaPluginDefined(){
        return window.admob !== "undefined";
    }
    
    // unwrap it as soon as implemented
    for(var method in AdManager.prototype){
        if(AdManager.prototype.hasOwnProperty(method)){
            AdManager.prototype[method] = Decorators.requireCondition(isCordovaPluginDefined, 
                                AdManager.prototype[method], 
                                AdManager.prototype, 
                                "try cordova plugin add cordova-admob:plugin not installed", 
                                "warn");
        }
    }
    
    _modules.AdManager = new AdManager();

})(stargateModules.Utils, stargateModules.Decorators, stargateModules);