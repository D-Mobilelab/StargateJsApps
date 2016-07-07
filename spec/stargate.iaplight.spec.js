var iaplightProduct1 = {
    "productId": "com.mycompany.myproduct.weekly.v1",
    "title": "Premium weekly subscription",
    "description": "Premium weekly subscription to my beatiful product",
    "price": "€0,99"
};
var iaplightProduct2 = {
    "productId": "com.mycompany.myproduct.montly.v1",
    "title": "Premium montly subscription",
    "description": "Premium montly subscription to my beatiful product",
    "price": "€3,99"
};


describe("Stargate IAP Light", function() {
    
    beforeEach(function() {
		hybrid_conf = null;
		country = null;
        isStargateOpen = false;
		isStargateInitialized = false;

		specTestMock = {
			onDeviceReady: function() {
				return onDeviceReady();
			}
		};

		cookie_mock._val.hybrid = 1;
		window.Cookies = cookie_mock;

		window.device = spec_device_mock;
		window.hostedwebapp = hostedwebapp_mock;
		window.cordova = cordova_mock;
		window.StatusBar = statusbar_mock;
		navigator.splashscreen = navigator_splashscreen_mock;
        navigator.connection = navigator_connection_mock;
		window.store = store_mock;
		window.storekit = storekit_mock;
		
		log = jasmine.createSpy();

		getManifest = function(){
			return Promise.resolve(manifest_mock);
		};

        document.removeEventListener("deviceready",onDeviceReady, false);
        
        if (!window.plugins) {
            window.plugins = {};
        }
        window.inAppPurchase = {
            getProducts: function(productsId) {
                return new Promise(function(resolve,reject){
                    resolve([iaplightProduct1, iaplightProduct2]);
                });
            },
            subscribe: function(productId) {
                return new Promise(function(resolve,reject){
                    resolve();
                });
            },
            getReceiptBundle: function() {
                return new Promise(function(resolve,reject){
                    resolve();
                });
            }
        };
    });
    
	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("getProductInfo require initialization", function(done) {
        var res = stargatePublic.iaplight.getProductInfo("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/not initialized/);
		    done();
		});
	});

	it("subscribe require initialization", function(done) {
        var res = stargatePublic.iaplight.subscribe("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/not initialized/);
		    done();
		});
	});

	it("getExpireDate require initialization", function(done) {
        var res = stargatePublic.iaplight.getExpireDate("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/not initialized/);
		    done();
		});
	});

    it("getProductInfo require opened stargate", function(done) {
        isStargateInitialized = true;
        var res = stargatePublic.iaplight.getProductInfo("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Stargate closed/);
		    done();
		});
	});

	it("subscribe require opened stargate", function(done) {
        isStargateInitialized = true;
        var res = stargatePublic.iaplight.subscribe("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Stargate closed/);
		    done();
		});
	});

	it("getExpireDate require opened stargate", function(done) {
        isStargateInitialized = true;
        var res = stargatePublic.iaplight.getExpireDate("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Stargate closed/);
		    done();
		});
	});
    
    it("iaplight getProductInfo", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = stargatePublic.iaplight.getProductInfo(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightProduct1)
		});

        var res2 = stargatePublic.iaplight.getProductInfo(iaplightProduct2.productId);
        
        expect(res2.then).toBeDefined();
        
		res2.catch(function(message) {
			console.log("stargatePublic.iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res2.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightProduct2)
		    done();
		});
	});

});