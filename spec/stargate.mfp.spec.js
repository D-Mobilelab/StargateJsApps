

describe("Stargate Mobile Finger Print", function() {
    var oldlog, oldwar, olderr;
    
    beforeEach(function() {
		hybrid_conf = null;
		country = null;
        isStargateOpen = false;
		isStargateInitialized = false;

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
		
        oldlog = log;
        oldwar = war;
        olderr = err;
        log = function(){};
        war = function(){};
        err = function(){};

		getManifest = function(){
			return Promise.resolve(manifest_mock);
		};

        
        if (!window.plugins) {
            window.plugins = {};
        }
        
    });
    
    afterEach(function() {
        log = oldlog;
        war = oldwar;
        err = olderr;
        
    });
    
	it("MFP initialized on stargate initialize", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		//spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// suppress console messages
		//spyOn(console, 'error');
		//spyOn(console, 'log');
        
        spyOn(MFP, "check").and.callThrough();
        
        var cbFinish = jasmine.createSpy('cbFinish');
        var conf = {
            modules: ["mfp"],
            modules_conf: {
                "mfp": {
                    "country": manifest_mock.stargateConf.country
                }
            }
        };
        
		var res = stargatePublic.initialize(conf, cbFinish);
        SimulateEvent("deviceready", 300);

		expect(isStargateInitialized).toBe(true);
		expect(isStargateRunningInsideHybrid).toBe(true);
		expect(document.addEventListener).toHaveBeenCalled();
		expect(document.addEventListener).toHaveBeenCalledWith('deviceready', jasmine.any(Function), false);

		expect(res.then).toBeDefined();

		res.then(function(result) {
			expect(window.Cookies.get('hybrid')).toBeTruthy();
			expect(window.Cookies.get('stargateVersion')).toBe(stargateVersion);
			expect(window.localStorage.getItem('hybrid')).toBeTruthy();
			expect(window.localStorage.getItem('stargateVersion')).toBe(stargateVersion);

			expect(result).toBe(true);

			//request = jasmine.Ajax.requests.mostRecent();
			//request.respondWith(TestResponses.iap.success);
			//console.log("jasmine.Ajax.requests.mostRecent(): ",request);

			expect(cbFinish).toHaveBeenCalled();
			expect(cbFinish).toHaveBeenCalledWith(true);
    		expect(MFP.check).toHaveBeenCalled();
    		expect(MFP.check.calls.mostRecent().args[0]).toEqual({
                "motime_apikey": manifest_mock.stargateConf.motime_apikey,
                "namespace": manifest_mock.stargateConf.namespace,
                "label": manifest_mock.stargateConf.label,
                "country": conf.modules_conf.mfp.country,
            });
			done();
		});
		
	});
    
	
});