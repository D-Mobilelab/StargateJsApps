
describe("Stargate push", function() {
    
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
        if (!window.cordova) {
            window.cordova = {};
        }
        if (!window.cordova.plugins) {
            window.cordova.plugins = {};
        }
        window.cordova.plugins.notification = {
            local: {
                schedule: function(params) {},
                on: function(params) {}
            }
        };

        push.__clean__();
    });
    
	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("setScheduledNotify require initialization", function(done) {
        var res = stargatePublic.push.setScheduledNotify();
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/not initialized/);
		    done();
		});
	});

    it("setScheduledNotify require opened stargate", function(done) {
        isStargateInitialized = true;
        var res = stargatePublic.push.setScheduledNotify();
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Stargate closed/);
		    done();
		});
	});

    it("setScheduledNotify require module init", function(done) {
        isStargateInitialized = true;
        isStargateOpen = true;
        var res = stargatePublic.push.setScheduledNotify();
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});

    it("setScheduledNotify require cordova plugin", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        window.cordova.plugins.notification = null;

        var init = push.initialize();
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/missing cordova plugin/);
		    done();
		});
	});

    it("setScheduledNotify check parameters", function(done) {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        runningDevice.platform = "Android";

        var init = push.initialize();
        expect(init.then).toBeDefined();

        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        var sched = push.setScheduledNotify();
        expect(sched.then).toBeDefined();

        sched.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/params must be an object/);
		});

        sched = push.setScheduledNotify({
            "title": "test title",
            "text": "test text",
            "date": new Date(),
            "deeplink": "http://www.google.com/"
        });
        expect(sched.then).toBeDefined();

        sched.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        sched.then(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeFalsy();
		    done();
		});
	});
});