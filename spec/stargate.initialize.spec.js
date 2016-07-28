var spec_hybrid_conf_expected = {
	"IAP": {
		"id": "stargate.test.spec.subscription",
		"alias": "Stargate Test Subscription",
		"type": "PAID_SUBSCRIPTION"
	},
    "mfp": {
        "country": "xx"
    }
};
var spec_hybrid_conf_uriencoded = "%7B%22IAP%22%3A%20%7B%22id%22%3A%22stargate.test.spec.subscription%22%2C%22alias%22%3A%22Stargate%20Test%20Subscription%22%2C%22type%22%3A%22PAID_SUBSCRIPTION%22%7D%7D";

var spec_configurations = {
	country: "xx",
	hybrid_conf: spec_hybrid_conf_uriencoded
};

var spec_modules_conf = {
	"iap": {
		"id": "stargate.test.spec.subscription",
		"alias": "Stargate Test Subscription",
		"type": "PAID_SUBSCRIPTION"
	},
    "mfp": {
        "country": "xx"
    }
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

var app_is_debug_mock = {
    debug: false
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
            "mfp": true,
            "gesturePlaymeVertical": false,
            "gplusconnect": false,
            "androidMenuPlayme": false,
            "inappPurchase": true,
            "deltadna" : false,
			"offline-game": false
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
            return Promise.resolve("0.0.1");
		},
        getPackageName: function() {
            return Promise.resolve("com.stargatejs.testapp");
		},
        getVersionCode: function() {
            return Promise.resolve("0.0.1-test");
		}
	},
    plugins: {
        AppIsDebug: {
            get: function(cbOk, cbErr) {
                cbOk(app_is_debug_mock);
            }
        }
    },
    require: function(module){
        if (module === 'cordova/channel'){
            return {
                onPluginsReady: {
                    subscribe: function(func){
                        func();
                    }
                }
            };
        }
        else if (module === 'cordova/exec') {
            return {
                setJsToNativeBridgeMode: function(){},
                jsToNativeModes: {
                    IFRAME_NAV: '1'
                }
            };
        }
    }
};


var statusbar_visibility = null;
var statusbar_color = null;
var statusbar_mock = {
	hide: function() {statusbar_visibility=false;},
	show: function() {statusbar_visibility=true;},
    backgroundColorByHexString: function(color) {statusbar_color=color;},
};

var navigator_splashscreen_mock = {
	hide: function() {}
};


var cookie_mock = {
	_val: {},
	get: function(name) { return cookie_mock._val[name] },
	set: function(name, value) { return cookie_mock._val[name] = value; }
};

var navigator_connection_mock = {
    type:'wifi',
    getInfo:function(cb, cbe){}
};

function SimulateEvent(eventName, attrs, time, target){
    var _target;

    if(target && target === "window"){
        _target = window;
    }else{
        _target = document;
    }

    var event = document.createEvent('CustomEvent');
    for(var key in attrs){
        if(!event.hasOwnProperty(key)){
            event[key] = attrs[key];
        }
    }
    event.initEvent(eventName, true, true);
    setTimeout(function(){
        _target.dispatchEvent(event);
    }, time || 1000);
}


describe("Stargate initialize", function() {

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

		jasmine.Ajax.install();
        document.removeEventListener("deviceready",onDeviceReady, false);

    });
	afterEach(function() {
		cookie_mock._val = {};
		window.localStorage.clear();
		jasmine.Ajax.uninstall();
	});

	it("initialize with hybrid_conf as string", function() {
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(hybrid_conf).toEqual(spec_hybrid_conf_expected);
	});

	it("initialize with hybrid_conf as object", function() {
		spec_configurations.hybrid_conf = spec_hybrid_conf_expected;
		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(hybrid_conf).toEqual(spec_hybrid_conf_expected);
	});
    
    it("initialize with modules_conf", function() {
		var conf = {
            modules_conf: spec_modules_conf
        };
		stargatePublic.initialize(conf, pubKey, forge, function(){});

		expect(modules_conf).toEqual(spec_modules_conf);
	});

	it("initialize return promise", function() {
		var res = stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});

		expect(res.then).toBeDefined();
	});

	it("initialize called again show warn and call back", function() {

		stargatePublic.initialize(spec_configurations, pubKey, forge, function(){});		
		expect(isStargateInitialized).toBe(true);

		war = jasmine.createSpy();

		var cbFinish = jasmine.createSpy('cbFinish');

		stargatePublic.initialize(spec_configurations, pubKey, forge, cbFinish);
		expect(war).toHaveBeenCalled();
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
		
        SimulateEvent("deviceready", {}, 200);

		expect(isStargateInitialized).toBe(true);
		expect(isStargateRunningInsideHybrid).toBe(true);

		expect(document.addEventListener).toHaveBeenCalled();
		expect(document.addEventListener).toHaveBeenCalledWith('deviceready', jasmine.any(Function), false);

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
		//spyOn(console, 'error');
		//spyOn(console, 'log');

		var cbFinish = jasmine.createSpy('cbFinish');

		var res = stargatePublic.initialize(spec_configurations, cbFinish);

		expect(res.then).toBeDefined();
        
        
		res.then(function() {
            expect(isStargateInitialized).toBe(true);
		    expect(isStargateRunningInsideHybrid).toBeFalsy();
			expect(cbFinish).toHaveBeenCalled();
			done();
		});
		
	});

    it("checkConnection info object online", function(done) {
        var timeout = 100;
        isStargateInitialized = true;
        isStargateOpen = true;
        navigator_connection_mock.type = "wifi";
        SimulateEvent("online",{networkState:"wifi"}, timeout, "document");

        setTimeout(function() {
            var connectionInfo = stargatePublic.checkConnection(function(){}, function(){});
            expect(connectionInfo.type).toBeDefined();
            expect(connectionInfo.type).toEqual("online");
            expect(connectionInfo.networkState).toBeDefined();
            expect(connectionInfo.networkState).toEqual("wifi");
            isStargateInitialized = false;
            done();
        }, timeout + 10);
    });

    it("checkConnection info object offline", function(done) {
        var timeout = 100;
        isStargateInitialized = true;
        isStargateOpen = true;
        navigator_connection_mock.type = "none";
        SimulateEvent("offline", {networkState:"none"}, timeout, "document");
        setTimeout(function() {
            var connectionInfo = stargatePublic.checkConnection(function(){}, function(){});
            expect(connectionInfo.type).toBeDefined();
            expect(connectionInfo.type).toEqual("offline");
            expect(connectionInfo.networkState).toBeDefined();
            expect(connectionInfo.networkState).toEqual("none");
            isStargateInitialized = false;
            done();
        }, timeout + 10);
    });

    it("checkConnection without functions callback", function(done) {
        var timeout = 100;
        isStargateInitialized = true;
        isStargateOpen = true;
        navigator_connection_mock.type = "none";
        SimulateEvent("offline", {networkState:"none"}, timeout, "document");
        setTimeout(function() {
            var connectionInfo = stargatePublic.checkConnection();
            expect(connectionInfo.type).toBeDefined();
            expect(connectionInfo.type).toEqual("offline");
            expect(connectionInfo.networkState).toBeDefined();
            expect(connectionInfo.networkState).toEqual("none");
            isStargateInitialized = false;
            done();
        }, timeout + 10);
    });

    it("stargate addListener on OFFLINE event", function(done) {
        isStargateInitialized = true;
        isStargateOpen = true;
        navigator_connection_mock.type = "none";

        stargatePublic.addListener("connectionchange", function(connection){
            //console.log("Connection", connection);
            expect(connection.type).toEqual("offline");
            expect(connection.networkState).toBeDefined();
            done();
        });

        SimulateEvent("offline", {networkState:"none"}, 1);
    });

    it("stargate addListener on ONLINE event", function(done) {
        isStargateInitialized = true;
        isStargateOpen = true;
        navigator_connection_mock.type = "wifi";

        stargatePublic.addListener("connectionchange", function(connection){
            //console.log("Connection", connection);
            expect(connection.type).toEqual("online");
            expect(connection.networkState).toBeDefined();
            expect(connection.networkState).toEqual("wifi");
            done();
        });

        SimulateEvent("online", {networkState:"wifi"}, 1);
    });
	
});