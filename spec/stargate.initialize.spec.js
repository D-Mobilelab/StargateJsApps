var spec_hybrid_conf_expected = {
	"IAP": {
		"id": "stargate.test.spec.subscription",
		"alias": "Stargate Test Subscription",
		"type": "PAID_SUBSCRIPTION",
		"verbosity": "DEBUG"
	}
};
var spec_hybrid_conf_uriencoded = "%7B%22IAP%22%3A%20%7B%22id%22%3A%20%22stargate.test.spec.subscription%22%2C%22alias%22%3A%20%22Stargate%20Test%20Subscription%22%2C%22type%22%3A%20%22PAID_SUBSCRIPTION%22%2C%22verbosity%22%3A%20%22DEBUG%22%7D%7D";

var spec_configurations = {
	country: "xx",
	hybrid_conf: spec_hybrid_conf_uriencoded
};

var spec_device_mock = {
	available: true,
    cordova: "0.0.0",
    manufacturer: "stargate",
    model: "one",
    platform: "iOS",
    uuid: "xxxxxxxxxxxxx",
    version: "0.0.2"
};

var manifest_mock = {

	"stargateConf": {
        "title": "Stargate Demo",
        "url_match_app": "",
        "country": "xx",
        
        "url_scheme": "stargate://",
        "version": "1",
        "androidVersionCode": "1",
        "motime_apikey": "1234567890",
        "namespace": "mynamespace",
        "label": "xx-label",
        "billing_key": "idufvweifviwenviwonviwuntgurntio",
        
        "features": {
            "newton": false,
            "facebookconnect": true,
            "mfp": false,
            "gesturePlaymeVertical": false,
            "gplusconnect": false,
            "androidMenuPlayme": false,
            "inappPurchase": true,
            "deltadna" : false
        },

        "api": {
            "mfpSetUriTemplate": "{protocol}://{hostname}/mfpset.php{?url,domain,_PONY}",
            "mfpGetUriTemplate": "http://fixme/v01/mobileFingerprint.get{?apikey,contents_inapp,country,expire}",
            "googleToken": "https://accounts.google.com/o/oauth2/token",
            "userCreate": "%domain%/%country%/%selector%/%app_prefix%/store/usercreate/"
        },

        "statusbar": {
            "hideOnUrlPattern": [
                ".*"
            ]
        },

        "deltadna" : {
            "environmentKey": "111111111111111111111",
            "collectApi": "http://123123123.deltadna.net/collect/api",
            "engageApi": "http://113123123.deltadna.net",
            "settings" : {
                "onStartSendGameStartedEvent":true,
                "onFirstRunSendNewPlayerEvent":false
            }
        }
    }
};

var hostedwebapp_mock = {
	getManifest: function(cbOk, cbErr) {
		cbOk(manifest_mock);
	}
};

var cordova_mock = {
	getAppVersion: {
		getVersionNumber: function() {
			var deferred = Q.defer();
		    setTimeout(deferred.resolve("0.0.1"), 1);
		    return deferred.promise;
		}
	}
};

var statusbar_mock = {
	hide: function() {},
	show: function() {}
};

var navigator_splashscreen_mock = {
	hide: function() {}
};



var cookie_mock = {
	_val: {},
	get: function(name) { return cookie_mock._val[name] },
	set: function(name, value) { return cookie_mock._val[name] = value; }
};



describe("Stargate initialize", function() {

	beforeEach(function() {
		hybrid_conf = null;
		country = null;
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
		window.store = store_mock;
		window.storekit = storekit_mock;

		jasmine.Ajax.install();

	});
	afterEach(function() {
		cookie_mock._val = {};
		window.localStorage.clear();
		jasmine.Ajax.uninstall();
	});

	it("initialize with hybrid_conf as string", function() {
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(hybrid_conf).toEqual(spec_hybrid_conf_expected);
		expect(country).toEqual(spec_configurations.country);
	});

	it("initialize with hybrid_conf as object", function() {
		spec_configurations.hybrid_conf = spec_hybrid_conf_expected;
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(hybrid_conf).toEqual(spec_hybrid_conf_expected);
		expect(country).toEqual(spec_configurations.country);
	});

	it("initialize return promise", function() {
		var res = stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(res.then).toBeDefined();
	});

	it("initialize called again show error and call back", function() {

		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});		
		expect(isStargateInitialized).toBe(true);

		spyOn(console, 'error');

		var cbFinish = jasmine.createSpy('cbFinish');

		stargatePublic.initialize(spec_configurations, pubKey, forge, cbFinish);
		expect(console.error).toHaveBeenCalled();
		expect(cbFinish).toHaveBeenCalled();
	});

	it("initialize promise fulfilled/callback called", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// suppress console messages
		spyOn(console, 'error');
		spyOn(console, 'log');

		var cbFinish = jasmine.createSpy('cbFinish');

		var res = stargatePublic.initialize(spec_configurations, pubKey, forge, cbFinish);
		
		// dispatch deviceready event
		var deviceReadyEvent = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
		deviceReadyEvent.initCustomEvent('deviceready', false, false, null);

		document.dispatchEvent(deviceReadyEvent);

		expect(isStargateInitialized).toBe(true);
		expect(isStargateRunningInsideHybrid).toBe(true);

		expect(document.addEventListener).toHaveBeenCalled();
		expect(document.addEventListener).toHaveBeenCalledWith('deviceready', onDeviceReady, false);

		expect(res.then).toBeDefined();

		res.then(function() {
			expect(cbFinish).toHaveBeenCalled();
			done();
		});
		
	});

	it("initialize new version promise fulfilled/callback called", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// suppress console messages
		spyOn(console, 'error');
		spyOn(console, 'log');

		var cbFinish = jasmine.createSpy('cbFinish');

		var res = stargatePublic.initialize(spec_configurations, cbFinish);
		
		// dispatch deviceready event
		var deviceReadyEvent = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
		deviceReadyEvent.initCustomEvent('deviceready', false, false, null);

		document.dispatchEvent(deviceReadyEvent);

		expect(isStargateInitialized).toBe(true);
		expect(isStargateRunningInsideHybrid).toBe(true);
		expect(document.addEventListener).toHaveBeenCalled();
		expect(document.addEventListener).toHaveBeenCalledWith('deviceready', onDeviceReady, false);

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
			done();
		});
		
	});
	
	it("initialize outside hybrid fulfilled/callback called", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// set outside hybrid
		delete cookie_mock._val.hybrid;
		//spyOn(window.Cookies, 'get').and.callThrough();

		
		// suppress console messages
		spyOn(console, 'error');
		spyOn(console, 'log');

		var cbFinish = jasmine.createSpy('cbFinish');

		var res = stargatePublic.initialize(spec_configurations, cbFinish);

		expect(isStargateInitialized).toBe(true);
		expect(isStargateRunningInsideHybrid).toBeFalsy();

		expect(res.then).toBeDefined();

		res.then(function() {
			expect(cbFinish).toHaveBeenCalled();
			done();
		});
		
	});
	
});