var store_mock = {
    verbosity: '',
    
    DEBUG: '',
    INFO: '',
    WARNING: '',
    ERROR: '',
    QUIET: '',
    
    _mock_cb_par: {
        finish: function() {},
        transaction: {
            id: 'xxxxxxxxxxxxxxxxxx'
        }
    },

    when: function(id) {
        return {
            approved: function(cb) {
                //cb(store_mock._mock_cb_par)
            },
            verified: function(cb) {
                //cb(store_mock._mock_cb_par)
            },
            updated: function(cb) {
                //cb(store_mock._mock_cb_par)
            },
            owned: function(cb) {
                //cb(store_mock._mock_cb_par)
            },
            cancelled: function(cb) {
                //cb(store_mock._mock_cb_par)
            },
            error: function(cb) {
                //cb(store_mock._mock_cb_par)
            }
        };
    },
    ready: function(cb) {
        //cb()
    },
    register: function(productData) {this._mockProductData = productData}
};

var storekit_mock = {
    loadReceipts: function(cb) {
        cb({
            appStoreReceipt: "xxxxxxxxxyyyyyyyy...recipt.ios..xxxxxxx"
        })
    }
};

var IapTestResponses = {
    success: {
        status: 200,
        responseText: '{"user":"1928734198273498172439018723498@itunes.com","password":"8217364871263481726349876","fb_id":null,"newuser":false,"status":"200","return_url":"http://mywebapp.com/my-content-page"}'
    }
};


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