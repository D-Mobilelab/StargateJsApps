
/**
 * @namespace
 *
 * @description
 * Analytics is a module to track events sending it to a webapp callback.
 * It's used internally in Stargate to track events like MFP get.
 * Before using it you need to set the callback calling {@link Stargate#setAnalyticsCallback}
 * 
 */
var analytics = (function(){

	var cb;
	var ana = {};

	/**
     * @name analytics#track
     * @memberof analytics
     *
     * @description Send an event to webapp analytics callback if it's defined
     *
     * @param {object} event
     */
	ana.track = function(event) {

		if (typeof cb !== 'function') {
			return log("[analytics] callback not set!");
		}

		// send it
		cb(event);
	};

	/**
     * @name analytics#setCallback
     * @memberof analytics
     *
     * @description Save webapp analytics callback to be called when an event is tracked
     *
     * @param {function} callback
     */
	ana.setCallback = function(callback) {
		cb = callback;
	};

	return ana;
})();


/**
 * @name Stargate#setAnalyticsCallback
 * @memberof Stargate
 *
 * @description Save webapp analytics callback to be called when an event inside Stargaed need to be tracked
 *
 * @param {function} callback
 */
stargatePublic.setAnalyticsCallback = function(callback) {

	analytics.setCallback(callback);
};
