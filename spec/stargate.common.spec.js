

describe("Stargate", function() {
	it("exists", function() {
		expect(window.Stargate).toBeDefined();
	});

	it("pubKey exists", function() {
		expect(window.pubKey).toBeDefined();
	});

	it("forge exists", function() {
		expect(window.forge).toBeDefined();
	});

	/*
	it("initialize() to have been called", function(done) {

		window.Stargate.initialize({}, pubKey, forge, function(){

			expect(Stargate.isInitialized).toBe(true);
			done();
		});

	});
	*/

});