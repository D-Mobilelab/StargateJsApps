fdescribe("Stargate AdManager tests", function() {
    
    beforeEach(function() {

    });
    
	afterEach(function() {

	});
    
    it("Should be defined",function(){        
        expect(stargateModules).toBeDefined();
        expect(stargateModules.AdManager).toBeDefined();
        expect(stargateModules.AdManager.createBanner).toBeDefined();
        expect(stargateModules.AdManager.removeBanner).toBeDefined();
        expect(stargateModules.AdManager.showBanner).toBeDefined();
    });
    
    it("Should be callable but not yet implemented", function(){
        stargateModules.AdManager.createBanner();        
        
    });
    
});