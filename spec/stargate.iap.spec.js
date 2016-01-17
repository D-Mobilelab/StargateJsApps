/*

stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    setBusy(true);

    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;

    IAP.doRefresh();
    window.store.order(IAP.id);
};

stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }

    setBusy(true);

    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;

    IAP.doRefresh();
    storekit.restore();
};
*/

describe("Stargate IAP", function() {

	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("inAppPurchaseSubscription require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.inAppPurchaseSubscription(cbSuccess, cbError, "subscriptionUrl", "returnUrl");

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("inAppRestore require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.inAppPurchaseSubscription(cbSuccess, cbError, "subscriptionUrl", "returnUrl");

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

});