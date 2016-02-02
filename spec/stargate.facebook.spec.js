

describe("Stargate facebook", function() {

	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("facebookLogin require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		var scope = "a,b,c";

		stargatePublic.facebookLogin(scope, cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("inAppRestore require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		var url = "http://www.google.com";

		stargatePublic.facebookShare(url, cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

});