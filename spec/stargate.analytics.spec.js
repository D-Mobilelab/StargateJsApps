
describe("Stargate analytics", function() {

	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("setAnalyticsCallback doesn't require initialization", function() {
		var cbAnalytics = jasmine.createSpy('cbSuccess');
		var trackEvent = {test: 'OK'};

		stargatePublic.setAnalyticsCallback(cbAnalytics);

		analytics.track(trackEvent);

		expect(cbAnalytics).toHaveBeenCalled();
		expect(cbAnalytics.calls.mostRecent().args[0]).toBe(trackEvent);
	});

});