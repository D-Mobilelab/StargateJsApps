describe("Stargate AdManager tests", function() {
    
    beforeEach(function() {

    });
    
	afterEach(function() {

	});
    
    it("Public interface should be defined",function(){        
        expect(stargateModules).toBeDefined();
        expect(stargateModules.AdManager).toBeDefined();
        expect(stargateModules.AdManager.createBanner).toBeDefined();
        expect(stargateModules.AdManager.removeBanner).toBeDefined();
        expect(stargateModules.AdManager.showBanner).toBeDefined();
        expect(stargateModules.AdManager.hideBanner).toBeDefined();
        expect(stargateModules.AdManager.showBannerAtSelectedPosition).toBeDefined();
        expect(stargateModules.AdManager.showBannerAtGivenXY).toBeDefined();
        expect(stargateModules.AdManager.registerAdEvents).toBeDefined();
        expect(stargateModules.AdManager.prepareInterstitial).toBeDefined();
        expect(stargateModules.AdManager.showInterstitial).toBeDefined();
    });
    
    it("Should be callable but not yet implemented", function(){
        stargateModules.AdManager.createBanner();        
    });
    
});