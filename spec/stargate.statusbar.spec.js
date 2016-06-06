

describe("Stargate statusbar", function() {
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
        
        if (statusbar_mock.show.calls) {
            statusbar_mock.show.calls.reset();
        }
        if (statusbar_mock.hide.calls) {
            statusbar_mock.hide.calls.reset();
        }
        if (statusbar_mock.backgroundColorByHexString.calls) {
            statusbar_mock.backgroundColorByHexString.calls.reset();
        }
        
    });
    
	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("setStatusbarVisibility require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.setStatusbarVisibility(true, cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

    
    it("setStatusbarVisibility require opened stargate", function() {
		
        isStargateInitialized = true;
        
        var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.setStatusbarVisibility(true, cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/Stargate closed/);
	});

    it("setStatusbarVisibility show statusbar", function() {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');
        
        spyOn(statusbar_mock, "hide").and.callThrough();
        spyOn(statusbar_mock, "show").and.callThrough();
        
		stargatePublic.setStatusbarVisibility(true, cbSuccess, cbError);

		expect(cbSuccess).toHaveBeenCalled();
		expect(cbSuccess.calls.mostRecent().args[0]).toMatch(/statusbar shown/);
        expect(statusbar_mock.show).toHaveBeenCalled();
		expect(statusbar_visibility).not.toBeFalsy();
	});
    
    it("setStatusbarVisibility hide statusbar", function() {
		
        isStargateInitialized = true;
        isStargateOpen = true;
        
        var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

        spyOn(statusbar_mock, "hide").and.callThrough();
        spyOn(statusbar_mock, "show").and.callThrough();
        
		stargatePublic.setStatusbarVisibility(false, cbSuccess, cbError);

		expect(cbSuccess).toHaveBeenCalled();
		expect(cbSuccess.calls.mostRecent().args[0]).toMatch(/statusbar hided/);
        expect(statusbar_mock.hide).toHaveBeenCalled();
        expect(statusbar_visibility).toBeFalsy();
	});

    
	it("statusbar initialized on stargate initialize", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		//spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// suppress console messages
		//spyOn(console, 'error');
		//spyOn(console, 'log');
        
        spyOn(statusbar_mock, "hide").and.callThrough();
        spyOn(statusbar_mock, "show").and.callThrough();
        
        var cbFinish = jasmine.createSpy('cbFinish');
        var conf = {
            modules: [],
            modules_conf: {
                "statusbar": {
                    "color": "#333333",
                    "hideOnUrlPattern": [".*"]
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
    		expect(statusbar_mock.hide).toHaveBeenCalled();
            expect(statusbar_visibility).toBeFalsy();
			done();
		});
		
	});
    
    it("statusbar initialized with old conf", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		//spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// suppress console messages
		//spyOn(console, 'error');
		//spyOn(console, 'log');
        
        spyOn(statusbar_mock, "hide").and.callThrough();
        spyOn(statusbar_mock, "show").and.callThrough();
        
        statusbar_mock.show.calls.reset();
        statusbar_mock.hide.calls.reset();
        
        var cbFinish = jasmine.createSpy('cbFinish');
        var conf = {
            modules: [],
            modules_conf: {
            }
        };
        
		var res = stargatePublic.initialize(conf, cbFinish);
        SimulateEvent("deviceready", 300);

		expect(isStargateInitialized).toBe(true);
		expect(isStargateRunningInsideHybrid).toBe(true);
		expect(manifest_mock.stargateConf.statusbar).toBeDefined();
		expect(manifest_mock.stargateConf.statusbar.hideOnUrlPattern).toBeDefined();
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
    		expect(statusbar_mock.hide).toHaveBeenCalled();
            expect(statusbar_visibility).toBeFalsy();
			done();
		});
		
	});
    
    it("statusbar initialized with no hide", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		//spyOn(specTestMock, 'onDeviceReady').and.callThrough();

        
		// suppress console messages
		//spyOn(console, 'error');
		//spyOn(console, 'log');
        
        spyOn(statusbar_mock, "hide").and.callThrough();
        spyOn(statusbar_mock, "show").and.callThrough();
        spyOn(statusbar_mock, "backgroundColorByHexString").and.callThrough();
        
        statusbar_mock.show.calls.reset();
        statusbar_mock.hide.calls.reset();
        statusbar_mock.backgroundColorByHexString.calls.reset();
        
        var cbFinish = jasmine.createSpy('cbFinish');
        var conf = {
            modules: [],
            modules_conf: {
                "statusbar": {
                    "color": "#333333"
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

			expect(cbFinish).toHaveBeenCalled();
			expect(cbFinish).toHaveBeenCalledWith(true);
    		expect(statusbar_mock.hide).not.toHaveBeenCalled();
    		expect(statusbar_mock.show).not.toHaveBeenCalled();
    		expect(statusbar_mock.backgroundColorByHexString).toHaveBeenCalled();
            expect(statusbar_mock.backgroundColorByHexString.calls.mostRecent().args[0]).toEqual(conf.modules_conf.statusbar.color);
			done();
		});
		
	});
	
});