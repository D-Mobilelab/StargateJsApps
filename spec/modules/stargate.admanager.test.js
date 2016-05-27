fdescribe("Stargate AdManager tests", function() {
    
    beforeAll(function(done){
        document.addEventListener("deviceready", function(ready){
            console.log("ready", ready);
            done();
        },false);    
    });
    
    beforeEach(function() {
        stargateModules.AdManager.initialize({
            publisherId:'ca-app-pub-6869992474017983/9375997553',
            interstitialAdId:'ca-app-pub-6869992474017983/1657046752',
            isTesting:true,
            autoShowBanner:false,
            autoShowInterstitial:true       
        });
    });
    
	afterEach(function() {
        //stargateModules.AdManager.removeBanner();
	});
    
    it("Public interface should be defined",function(){        
        expect(stargateModules).toBeDefined();
        expect(stargateModules.AdManager).toBeDefined();
        expect(stargateModules.AdManager.createBanner).toBeDefined();
        expect(stargateModules.AdManager.removeBanner).toBeDefined();
        expect(stargateModules.AdManager.showBanner).toBeDefined();
        expect(stargateModules.AdManager.hideBanner).toBeDefined();
        /*expect(stargateModules.AdManager.showBannerAtSelectedPosition).toBeDefined();
        expect(stargateModules.AdManager.showBannerAtGivenXY).toBeDefined();
        expect(stargateModules.AdManager.registerAdEvents).toBeDefined();*/
        expect(stargateModules.AdManager.prepareInterstitial).toBeDefined();
        expect(stargateModules.AdManager.showInterstitial).toBeDefined();
    });
    
    it("createBanner should be called and return OK", function(done){
        stargateModules.AdManager.createBanner()
            .then(function(result){
                expect(result).toEqual("OK");
                done();
            });
    });
    
    it("showBanner should be called and return OK", function(done){
        stargateModules.AdManager.createBanner()
        .then(stargateModules.AdManager.showBanner)        
        .then(function(result){
                expect(result).toEqual("OK");
                done();
            });
    });
    
   it("removeBanner should be called and return OK", function(done){
        stargateModules.AdManager.removeBanner()
            .then(function(result){
                expect(result).toEqual("OK");
                done();
            });
    });    

});