

describe("Stargate share", function() {
    
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
        window.plugins.socialsharing = {
            shareWithOptions: function(options, onSuccess, onError) {
                onSuccess(true);
            },
            shareViaFacebook: function(msg, img, url, onSuccess, onError) {
                onSuccess(true);
            },
            shareViaTwitter: function(msg, img, url, onSuccess, onError) {
                onSuccess(true);
            },
            shareViaWhatsApp: function(msg, img, url, onSuccess, onError) {
                onSuccess(true);
            },
            canShareVia: function(via, message, subject, fileOrFileArray, url, onSuccess, onError) {
                //onError();
				onSuccess(true);
            }
        };
    });
    
	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("socialShare require initialization", function(done) {
		var options = {};

		var res = stargatePublic.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
            expect(message).toMatch(/not initialized/);
		    done();
		});
        
	});

	it("socialShareAvailable require initialization", function() {
		var options = {};

		var res = stargatePublic.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
            expect(message).toMatch(/not initialized/);
		    done();
		});
	});
    
    it("socialShare require opened stargate", function(done) {
		
        isStargateInitialized = true;
        
        var options = {};
        
		var res = stargatePublic.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
            expect(message).toMatch(/Stargate closed/);
		    done();
		});
        
	});

	it("socialShareAvailable require opened stargate", function() {
		
        isStargateInitialized = true;
        
        var options = {};

		var res = stargatePublic.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
            expect(message).toMatch(/Stargate closed/);
		    done();
		});
	});
	
	it("socialShare shareViaFacebook", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var options = {
			"url": "http://www.google.com",
			"type": "facebook"
		};

		var res = stargatePublic.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare shareWithTwitter", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var options = {
			"url": "http://www.google.com",
			"type": "twitter"
		};

		var res = stargatePublic.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare shareWithWhatsapp", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var options = {
			"url": "http://www.google.com",
			"type": "whatsapp"
		};

		var res = stargatePublic.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare shareWithChooser", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var options = {
			"url": "http://www.google.com",
			"type": "chooser"
		};

		var res = stargatePublic.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare socialShareAvailable parameter error", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var options = {
			"url": "http://www.google.com",
			"socials": "invalidparam"
		};

		var res = stargatePublic.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			//console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toMatch(/missing object parameter socials/);
		    done();
		});
	});
	
	it("socialShare socialShareAvailable", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var options = {
			"url": "http://www.google.com",
			"socials": {
				"facebook": true,
				"twitter": true,
				"instagram": false
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = stargatePublic.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).not.toBeFalsy();
            expect(result).toEqual(expectedResult);
		    done();
		});
	});

});