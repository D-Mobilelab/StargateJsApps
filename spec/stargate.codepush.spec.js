var MockSyncStatus = {
    0: "UP_TO_DATE",
    1: "UPDATE_INSTALLED",
    2: "UPDATE_IGNORED",
    3: "ERROR",
    4: "IN_PROGRESS",
    5: "CHECKING_FOR_UPDATE",
    6: "AWAITING_USER_ACTION",
    7: "DOWNLOADING_PACKAGE",
    8: "INSTALLING_UPDATE",
    AWAITING_USER_ACTION: 6,
    CHECKING_FOR_UPDATE: 5,
    DOWNLOADING_PACKAGE: 7,
    ERROR: 3,
    INSTALLING_UPDATE: 8,
    IN_PROGRESS: 4,
    UPDATE_IGNORED: 2,
    UPDATE_INSTALLED: 1,
    UP_TO_DATE: 0,
};

var MockCodePush = {
    _cbSync: null,
    _cbProbgress: null,
    sync: function(cbSync, options, cbProgress) {
        MockCodePush._cbSync = cbSync;
        MockCodePush._cbProbgress = cbProgress;
    }
};


describe("Code push", function() {
    
    beforeEach(function() {
		window.SyncStatus = MockSyncStatus;
		window.codePush = MockCodePush;
		
    });
	afterEach(function() {
		window.SyncStatus = undefined;
		window.codePush = undefined;

	});
    
	it("registerForNotification call cbs", function() {
		
		var cbSync = jasmine.createSpy('cbSync');
		var cbProgress = jasmine.createSpy('cbProgress');
        
        codepush.initialize();

		codepush.registerForNotification(
            MockSyncStatus.UPDATE_INSTALLED,
            cbSync
        );

        MockCodePush._cbSync(MockSyncStatus.UPDATE_INSTALLED);

		expect(cbSync).toHaveBeenCalled();
		expect(cbSync.calls.mostRecent().args[0]).toEqual(MockSyncStatus.UPDATE_INSTALLED);

	});
    
	
});