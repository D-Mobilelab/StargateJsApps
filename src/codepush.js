var codepush = (function(){
    
	var protectedInterface = {};

    var registeredCallbacks = {};
    
    var onSyncStatus = function(status) {
        log("[CodePush] syncStatus: " + 
            protectedInterface.syncStatus[status]);
        
        if (registeredCallbacks[status] && Array === registeredCallbacks[status].constructor) {
            registeredCallbacks[status].forEach(function(cb){
                cb(status);
            });
        }
    };

    /**
     * SyncStatus.UP_TO_DATE
     * Result status - the application is up to date.
     * 
     * SyncStatus.UPDATE_INSTALLED
     * Result status - an update is available, it has been downloaded, unzipped and copied to the deployment folder.
     * After the completion of the callback invoked with SyncStatus.UPDATE_INSTALLED, the application will be reloaded with the updated code and resources.
     *   
     * SyncStatus.UPDATE_IGNORED
     * Result status - an optional update is available, but the user declined to install it. The update was not downloaded.
     * 
     * SyncStatus.ERROR
     * Result status - an error happened during the sync operation. This might be an error while communicating with the server, downloading or unziping the update.
     * The console logs should contain more information about what happened. No update has been applied in this case.
     * 
     * SyncStatus.IN_PROGRESS
     * Result status - there is an ongoing sync in progress, so this attempt to sync has been aborted.
     * 
     * SyncStatus.CHECKING_FOR_UPDATE
     * Intermediate status - the plugin is about to check for updates.
     * 
     * SyncStatus.AWAITING_USER_ACTION
     * Intermediate status - a user dialog is about to be displayed. This status will be reported only if user interaction is enabled.
     * 
     * SyncStatus.DOWNLOADING_PACKAGE
     * Intermediate status - the update packages is about to be downloaded.
     * 
     * SyncStatus.INSTALLING_UPDATE
     * Intermediate status - the update package is about to be installed.
     */
    protectedInterface.syncStatus = {
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

    protectedInterface.registerForNotification = function(status, callback) {
        if (!status) {
            err("[CodePush] registerForNotification: undefined status requested");
            return false;
        }
        if (typeof callback !== "function") {
            err("[CodePush] registerForNotification: callback is not a function");
            return false;
        }
        if (!registeredCallbacks[status]) {
            registeredCallbacks[status] = [];
        }

        registeredCallbacks[status].push(callback);
        return true;        
    };

    var onDownloadProgress = function(downloadProgress) {
        if (downloadProgress) {
            // Update "downloading" modal with current download %
            log("[CodePush] Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes);
        }
    };

    protectedInterface.initialize = function() {
        if (typeof window.codePush === "undefined") {
            err("[CodePush] missing cordova plugin!");
            return false;
        }

        protectedInterface.syncStatus = window.SyncStatus;

        // Silently check for the update, but
        // display a custom downloading UI
        // via the SyncStatus and DowloadProgress callbacks
        window.codePush.sync(onSyncStatus, null, onDownloadProgress);
    };

    return protectedInterface;
})();
