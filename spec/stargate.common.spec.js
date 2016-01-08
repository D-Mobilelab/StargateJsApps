

describe("Stargate public interface", function() {
	it("Stargate exists", function() {
		expect(window.Stargate).toBeDefined();
	});

	it("pubKey exists", function() {
		expect(window.pubKey).toBeDefined();
	});

	it("forge exists", function() {
		expect(window.forge).toBeDefined();
	});

});


describe("Stargate initialization required", function() {
	it("isInitialized is false", function() {
		expect(window.Stargate.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(window.Stargate.isOpen()).toBeFalsy();
	});

	it("openUrl require initialization", function() {
		spyOn(console, 'error');

		expect(window.Stargate.openUrl()).toBeFalsy();
		expect(console.error).toHaveBeenCalled();
	});

	it("googleLogin require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		window.Stargate.googleLogin(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});


	it("checkConnection require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		window.Stargate.checkConnection(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("getDeviceID require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		window.Stargate.getDeviceID(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

});

    

describe("Stargate public ad interface", function() {
	it("Stargate ad exists", function() {
		expect(window.Stargate.ad).toBeDefined();
	});

	it("Stargate ad initialize exists", function() {
		expect(window.Stargate.ad.initialize).toBeDefined();
	});

	it("Stargate ad createBanner exists", function() {
		expect(window.Stargate.ad.createBanner).toBeDefined();
	});

	it("Stargate ad hideBanner exists", function() {
		expect(window.Stargate.ad.hideBanner).toBeDefined();
	});

	it("Stargate ad removeBanner exists", function() {
		expect(window.Stargate.ad.removeBanner).toBeDefined();
	});

	it("Stargate ad showBannerAtSelectedPosition exists", function() {
		expect(window.Stargate.ad.showBannerAtSelectedPosition).toBeDefined();
	});

	it("Stargate ad showBannerAtGivenXY exists", function() {
		expect(window.Stargate.ad.showBannerAtGivenXY).toBeDefined();
	});

	it("Stargate ad registerAdEvents exists", function() {
		expect(window.Stargate.ad.registerAdEvents).toBeDefined();
	});

	it("Stargate ad prepareInterstitial exists", function() {
		expect(window.Stargate.ad.prepareInterstitial).toBeDefined();
	});

	it("Stargate ad showInterstitial exists", function() {
		expect(window.Stargate.ad.showInterstitial).toBeDefined();
	});

});



