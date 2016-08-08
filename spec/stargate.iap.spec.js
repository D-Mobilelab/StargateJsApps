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
    register: function(productData) {this._mockProductData = productData},
    refresh: function() {}
};

var storekit_mock = {
    loadReceipts: function(cb) {
        cb({
            appStoreReceipt: "xxxxxxxxxyyyyyyyy...recipt.ios..xxxxxxx"
        })
    }
};

var accountmanager_mock = {
    getAccounts: function(cb) {
        cb([{
            email: "test@stargatejs.com"
        }])
    }
};

var IapTestResponses = {
    success: {
        status: 200,
        responseText: '{"user":"1928734198273498172439018723498@itunes.com","password":"8217364871263481726349876","fb_id":null,"newuser":false,"status":"200","return_url":"http://mywebapp.com/my-content-page"}'
    }
};


describe("Stargate IAP requires initialization", function() {

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
    
    it("inAppProductInfo require initialization", function() {
        var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbPurchaseSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');
        
        var inappproductinfooptions = {
            "productId": "stargate.test.spec.product2",
            "callbackListingSuccess": cbSuccess,
            "callbackPurchaseSuccess": cbPurchaseSuccess,
            "callbackError": cbError,
            "subscriptionUrl": "fakeApiUrl"
        };
        
		stargatePublic.inAppProductInfo(inappproductinfooptions);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

    it("IAP module methods", function() {
        
        var old_log = log;
        var old_err = err;
        log = jasmine.createSpy('log');
        err = jasmine.createSpy('err');

        IAP.callbackSuccess();
        IAP.callbackError();
        IAP.callbackListingSuccess();
        IAP.callbackListingError();
        IAP.callbackPurchaseSuccess();

        var result;
        
        window.store = false;
        result = IAP.initialize();
        expect(err).toHaveBeenCalled();
		expect(err.calls.mostRecent().args[0]).toMatch(/Store not available/);

        window.store = store_mock;
        window.storekit = storekit_mock;
        window.accountmanager = accountmanager_mock;
        runningDevice.platform = "Android";
        IAP.initialize({
            id: "stargate.test.spec.product1",
            type: "PAID_SUBSCRIPTION",
            alias: "stargateiapproduct"
        });
        IAP.initialize({
            id_android: "stargate.test.spec.product1",
            type: "PAID_SUBSCRIPTION",
            alias: "stargateiapproduct"
        });
        

        runningDevice.platform = "iOS";
        IAP.initialize({
            id_ios: "stargate.test.spec.product1",
            type: "PAID_SUBSCRIPTION",
            alias: "stargateiapproduct",
            api_createuser: "na"
        });
        
        IAP.getPassword("testid");
        IAP.error("test error");
        IAP.getRandomEmail();
	});
});

var mock_iap_default_product_id = "stargate.test.spec.product1";

var mock_iap_products = {
    "stargate.test.spec.product1": {
        "id": "stargate.test.spec.product1",
        "alias": "Test Spec Product 1",
        "title": "Test Spec Product 1",
        "description": "Test Spec Product 1",
        "currency": "EUR",
        "price": "0,99 €",
        "type": "paid subscription",
        "canPurchase": true,
        "downloaded": false,
        "downloading": false,
        "loaded": true,
        "owned": false,
        "state": "valid",
        "transaction": null,
        "valid": true
    },
    "stargate.test.spec.product2": {
        "id": "stargate.test.spec.product2",
        "alias": "Test Spec Product 2",
        "title": "Test Spec Product 2",
        "description": "Test Spec Product 2",
        "currency": "EUR",
        "price": "1,99 €",
        "type": "paid subscription",
        "canPurchase": true,
        "downloaded": false,
        "downloading": false,
        "loaded": true,
        "owned": false,
        "state": "valid",
        "transaction": null,
        "valid": true
    },
};

describe("Stargate IAP inAppProductInfo", function() {
    
    beforeEach(function() {

        IAP.id = mock_iap_default_product_id;
        
        IAP.productsInfo = mock_iap_products;
        
        isStargateInitialized = true;
        isStargateOpen = true;
        
        window.store = store_mock;
		window.storekit = storekit_mock;
        log = jasmine.createSpy();
        war = jasmine.createSpy();
    });
    
	afterEach(function() {
        IAP.id = "";
		IAP.productsInfo = {};
        isStargateInitialized = undefined;
        isStargateOpen = undefined;
	});
    
    it("inAppProductInfo return default product info", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbPurchaseSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');
        
        var inappproductinfooptions = {
            "callbackListingSuccess": cbSuccess,
            "callbackPurchaseSuccess": cbPurchaseSuccess,
            "callbackError": cbError,
            "subscriptionUrl": "fakeApiUrl"
        };
		stargatePublic.inAppProductInfo(inappproductinfooptions);
        
		expect(cbError).not.toHaveBeenCalled();
        expect(cbSuccess).toHaveBeenCalled();
		expect(cbSuccess.calls.mostRecent().args[0]).toBe(
            mock_iap_products[mock_iap_default_product_id]
        );
	});
    
    it("inAppProductInfo return requested product info", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbPurchaseSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');
        
        var inappproductinfooptions = {
            "productId": "stargate.test.spec.product2",
            "callbackListingSuccess": cbSuccess,
            "callbackPurchaseSuccess": cbPurchaseSuccess,
            "callbackError": cbError,
            "subscriptionUrl": "fakeApiUrl"
        };
		stargatePublic.inAppProductInfo(inappproductinfooptions);
        
		expect(cbError).not.toHaveBeenCalled();
        expect(cbSuccess).toHaveBeenCalled();
		expect(cbSuccess.calls.mostRecent().args[0]).toBe(
            mock_iap_products["stargate.test.spec.product2"]
        );
	});

});