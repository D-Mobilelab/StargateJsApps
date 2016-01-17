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
	api_selector: "myapi_selector",
	country: "xx",
	hybrid_conf: spec_hybrid_conf_uriencoded,
	selector: "iphone",
	app_prefix: "myapp_prefix"
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
			id: ''
		}
	},

	when: function(id) {
		return {
			approved: function(cb) {cb(store_mock._mock_cb_par)},
			verified: function(cb) {cb(store_mock._mock_cb_par)},
			updated: function(cb) {cb(store_mock._mock_cb_par)},
			owned: function(cb) {cb(store_mock._mock_cb_par)},
			cancelled: function(cb) {cb(store_mock._mock_cb_par)},
			error: function(cb) {cb(store_mock._mock_cb_par)}
		};
	},
	ready: function(cb) {cb()},
	register: function(productData) {this._mockProductData = productData}
};

describe("Stargate initialize", function() {

	beforeEach(function() {
		hybrid_conf = null;
		country = null;
		selector = null;
		api_selector = null;
		app_prefix = null;
		isStargateInitialized = false;

		specTestMock = {
			onDeviceReady: function() {
				return onDeviceReady();
			}
		};

		window.device = spec_device_mock;
		window.hostedwebapp = hostedwebapp_mock;
		window.cordova = cordova_mock;
		window.StatusBar = statusbar_mock;
		navigator.splashscreen = navigator_splashscreen_mock;
		window.store = store_mock;

	});
	afterEach(function() {});

	it("initialize with hybrid_conf as string", function() {
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(hybrid_conf).toEqual(spec_hybrid_conf_expected);
		expect(country).toEqual(spec_configurations.country);
		expect(selector).toEqual(spec_configurations.selector);
		expect(api_selector).toEqual(spec_configurations.api_selector);
		expect(app_prefix).toEqual(spec_configurations.app_prefix);
	});

	it("initialize with hybrid_conf as object", function() {
		spec_configurations.hybrid_conf = spec_hybrid_conf_expected;
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(hybrid_conf).toEqual(spec_hybrid_conf_expected);
		expect(country).toEqual(spec_configurations.country);
		expect(selector).toEqual(spec_configurations.selector);
		expect(api_selector).toEqual(spec_configurations.api_selector);
		expect(app_prefix).toEqual(spec_configurations.app_prefix);
	});

	it("initialize return promise", function() {
		var res = stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(res.then).toBeDefined();
	});

	it("initialize cannot be called again", function() {
		
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});
		
		expect(isStargateInitialized).toBe(true);

		spyOn(console, 'error');

		expect(stargatePublic.initialize(spec_configurations, pubKey, forge, function(){})).toBeFalsy();
		expect(console.error).toHaveBeenCalled();
	});

	it("initialize promise fulfilled", function(done) {
		spyOn(document, 'addEventListener').and.callThrough();
		spyOn(specTestMock, 'onDeviceReady').and.callThrough();

		// suppress console messages
		spyOn(console, 'error');
		spyOn(console, 'log');

		var cbFinish = jasmine.createSpy('cbFinish');

		var res = stargatePublic.initialize(spec_configurations, pubKey, forge, cbFinish);
		
		// dispatch deviceready event
		var deviceReadyEvent = new CustomEvent("deviceready", {});
		document.dispatchEvent(deviceReadyEvent);

		expect(isStargateInitialized).toBe(true);
		expect(document.addEventListener).toHaveBeenCalled();
		expect(document.addEventListener).toHaveBeenCalledWith('deviceready', onDeviceReady, false);

		expect(res.then).toBeDefined();

		res.then(function() {
			expect(cbFinish).toHaveBeenCalled();
			done();
		});
		
	});
	
});