



describe("Stargate public interface", function() {
	it("Stargate exists", function() {
		expect(stargatePublic).toBeDefined();
	});

	it("pubKey exists", function() {
		expect(window.pubKey).toBeDefined();
	});

	it("forge exists", function() {
		expect(window.forge).toBeDefined();
	});

});


describe("Stargate initialization required", function() {

    function SimulateEvent(eventName, attrs, time){
        var event = new Event(eventName);

        for(var key in attrs){
            event[key] = attrs[key];
        }
        setTimeout(function(){
            document.dispatchEvent(event);
        }, time || 3000);
    }

	it("isInitialized is false", function() {
		expect(stargatePublic.isInitialized()).toBeFalsy();
	});

	it("isOpen is false", function() {
		expect(stargatePublic.isOpen()).toBeFalsy();
	});

	it("openUrl require initialization", function() {
		
		err = jasmine.createSpy();

		expect(stargatePublic.openUrl()).toBeFalsy();
		expect(err).toHaveBeenCalled();
	});

	it("googleLogin require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.googleLogin(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});


	it("checkConnection require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.checkConnection(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("getDeviceID require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.getDeviceID(cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

	it("setStatusbarVisibility require initialization", function() {
		var cbSuccess = jasmine.createSpy('cbSuccess');
		var cbError = jasmine.createSpy('cbError');

		stargatePublic.setStatusbarVisibility(true, cbSuccess, cbError);

		expect(cbError).toHaveBeenCalled();
		expect(cbError.calls.mostRecent().args[0]).toMatch(/not initialized/);
	});

});


describe("Stargate version", function() {

	it("getVersion return correct string", function() {

		expect(stargatePublic.getVersion()).toBe("0.0.0-test");
	});

});

describe("Stargate loader cordova plugin check", function() {
    
	it("startLoading return error", function() {
        var result = startLoading();
        
		expect(result).not.toBe(true);
        expect(err).toHaveBeenCalled();
		expect(err.calls.mostRecent().args[0]).toMatch(/cordova plugin missing/);
	});
    
    it("stopLoading return error", function() {
        var result = stopLoading();
        
		expect(result).not.toBe(true);
        expect(err).toHaveBeenCalled();
		expect(err.calls.mostRecent().args[0]).toMatch(/cordova plugin missing/);
	});
    
    it("changeLoadingMessage return error", function() {
        var result = changeLoadingMessage();

		expect(result).not.toBe(true);
        expect(err).toHaveBeenCalled();
		expect(err.calls.mostRecent().args[0]).toMatch(/cordova plugin missing/);
	});

});


describe("Stargate loader", function() {
    var spinnerVisible = false;
    var spinnerMessage = null;
    
    beforeEach(function() {
		window.SpinnerDialog = {
            
            show: function(p1, p2, p3) {
                spinnerVisible = true;
                spinnerMessage = p2;
            },
            
            hide: function() {
                spinnerVisible = false;
            }
        };

    });
	afterEach(function() {
		
	});

	it("startLoading return true", function() {
        var result = startLoading();
        
		expect(result).toBe(true);
	});
    
    it("stopLoading return true", function() {
        var result = stopLoading();
        
		expect(result).toBe(true);
	});
    
    it("changeLoadingMessage return true", function() {
        var result = changeLoadingMessage();

		expect(result).toBe(true);
	});

});
