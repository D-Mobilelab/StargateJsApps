

describe("Stargate public interface", function() {
	it("Stargate exists", function() {
		expect(stargatePublic).toBeDefined();
	});

	it("pubKey exists", function() {
		expect(window.pubKey).toBeDefined();
	});

	it("forge exists", function() {
		expect(window.forge).toBeDefined();
	});

});


describe("Stargate initialization required", function() {

    function SimulateEvent(eventName, attrs, time){
        var event = new Event(eventName);

        for(var key in attrs){
            event[key] = attrs[key];
        }
        setTimeout(function(){
            document.dispatchEvent(event);
        }, time || 3000);
    }

	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("openUrl require initialization", function() {
		spyOn(console, 'error');

		expect(stargatePublic.openUrl()).toBeFalsy();
		expect(console.error).toHaveBeenCalled();
	});

	it("googleLogin require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.googleLogin(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});


	it("checkConnection require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.checkConnection(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("getDeviceID require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.getDeviceID(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("setStatusbarVisibility require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.setStatusbarVisibility(true, cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

});

    

describe("Stargate public ad interface", function() {

	it("Stargate ad exists", function() {
		expect(stargatePublic.ad).toBeDefined();
	});

	it("Stargate ad initialize exists", function() {
		expect(stargatePublic.ad.initialize).toBeDefined();
	});

	it("Stargate ad createBanner exists", function() {
		expect(stargatePublic.ad.createBanner).toBeDefined();
	});

	it("Stargate ad hideBanner exists", function() {
		expect(stargatePublic.ad.hideBanner).toBeDefined();
	});

	it("Stargate ad removeBanner exists", function() {
		expect(stargatePublic.ad.removeBanner).toBeDefined();
	});

	it("Stargate ad showBannerAtSelectedPosition exists", function() {
		expect(stargatePublic.ad.showBannerAtSelectedPosition).toBeDefined();
	});

	it("Stargate ad showBannerAtGivenXY exists", function() {
		expect(stargatePublic.ad.showBannerAtGivenXY).toBeDefined();
	});

	it("Stargate ad registerAdEvents exists", function() {
		expect(stargatePublic.ad.registerAdEvents).toBeDefined();
	});

	it("Stargate ad prepareInterstitial exists", function() {
		expect(stargatePublic.ad.prepareInterstitial).toBeDefined();
	});

	it("Stargate ad showInterstitial exists", function() {
		expect(stargatePublic.ad.showInterstitial).toBeDefined();
	});

});


describe("Stargate version", function() {

	it("getVersion return correct string", function() {

		expect(stargatePublic.getVersion()).toBe("0.0.0-test");
	});

});


