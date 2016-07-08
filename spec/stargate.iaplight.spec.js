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
var iaplightReceiptBundle = {
    "originalAppVersion": "1.0",
    "appVersion": "0.1.0",
    "inAppPurchases": [ {
        "transactionIdentifier":"123412341234",
        "quantity":1,
        "purchaseDate":"2016-07-05T10:15:21Z",
        "productId":"com.mycompany.myapp.weekly.v1",
        "originalPurchaseDate":"2016-07-05T10:15:22Z",
        "subscriptionExpirationDate":"2016-07-05T10:18:21Z",
        "originalTransactionIdentifier":"123412341234",
        "webOrderLineItemID":-1497665198,
        "cancellationDate":null
    },
    {
        "transactionIdentifier":"123412341256",
        "quantity":1,
        "purchaseDate":"2016-07-03T10:15:21Z",
        "productId":"com.mycompany.myapp.weekly.v1",
        "originalPurchaseDate":"2016-07-03T10:15:22Z",
        "subscriptionExpirationDate":"2016-07-03T10:18:21Z",
        "originalTransactionIdentifier":"123412341256",
        "webOrderLineItemID":-1497665195,
        "cancellationDate":null
    } ],
    "bundleIdentifier": "com.mycompany.myapp"
};
var iaplightSubscribeResult = {
"transactionId":"1000000221696692",
"receipt":"MXXXX"
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
                    var res = [];
                    productsId.forEach(function(pidParam){
                        if (pidParam === iaplightProduct1.productId) {
                            res.push(iaplightProduct1);
                        } else if (pidParam === iaplightProduct2.productId) {
                            res.push(iaplightProduct2);
                        }
                    });
                    resolve(res);
                });
            },
            subscribe: function(productId) {
                return new Promise(function(resolve,reject){
                    resolve(iaplightSubscribeResult);
                });
            },
            getReceiptBundle: function() {
                return new Promise(function(resolve,reject){
                    resolve(iaplightReceiptBundle);
                });
            }
        };

        iaplight.__clean__();
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

    it("getProductInfo require module init", function(done) {
        isStargateInitialized = true;
        isStargateOpen = true;
        var res = stargatePublic.iaplight.getProductInfo("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});

	it("subscribe require module init", function(done) {
        isStargateInitialized = true;
        isStargateOpen = true;
        var res = stargatePublic.iaplight.subscribe("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});

	it("getExpireDate require module init", function(done) {
        isStargateInitialized = true;
        isStargateOpen = true;
        var res = stargatePublic.iaplight.getExpireDate("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});
    
    it("initialize require cordova plugin", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        window.inAppPurchase = null;

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/missing cordova plugin/);
		    done();
		});
	});

    it("initialize check parameters", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        var init = iaplight.initialize({
            //productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/missing parameter productsId/);
		    done();
		});
	});
    it("initialize check parameters is array", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: "aaaaa",
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/must be an array/);
		    done();
		});
	});
    it("initialize check parameters is array lenght", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: []
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/must contains at least a productid/);
		    done();
		});
	});

    it("initialize return same promise as before", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
        init.then(function(result) {
            var init2 = iaplight.initialize({
                productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
                productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
            });
            expect(init2).toBe(init);
            done();
		});
	});

    it("initialize ios", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "iOS";
        
        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId],
            productsIdIos: [iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
        init.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            expect(result).toEqual([iaplightProduct2]);
            done();
		});
	});

    it("iaplight getExpireDate", function(done) {
		
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

		var res = stargatePublic.iaplight.getExpireDate(iaplightReceiptBundle.inAppPurchases[0].productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            expect(result).toEqual(new Date(iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate))
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

    it("iaplight subscribe", function(done) {
		
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

		var res = stargatePublic.iaplight.subscribe(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightSubscribeResult);
            done();
		});
	});

});