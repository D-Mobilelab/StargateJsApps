/*! AdStargate.JS - v0.0.1 - 2015-XX-XX
 *
 */
function AdStargate() {


    // FIXME remove postmessages

    this.initialize = function(data, callbackSuccess, callbackError){
    	 var msgId = Stargate.createMessageId();
         Stargate.messages[msgId] = new Message();
         Stargate.messages[msgId].msgId = msgId;
         Stargate.messages[msgId].exec = 'stargate.initializeAd';
         if (typeof data !== 'undefined'){
             Stargate.messages[msgId].data = data;
         }
         Stargate.messages[msgId].callbackSuccess = callbackSuccess;
         Stargate.messages[msgId].callbackError = callbackError;
         Stargate.messages[msgId].send();
    };

    this.createBanner = function(data, callbackSuccess, callbackError){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.createBanner';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();

    };

    this.hideBanner = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.hideBanner';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.removeBanner = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.removeBanner';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.showBannerAtSelectedPosition = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.showBannerAtSelectedPosition';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.showBannerAtGivenXY = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.showBannerAtGivenXY';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };

    this.registerAdEvents = function(eventManager){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.registerAdEvents';
        if (typeof eventManager !== 'undefined'){
            Stargate.messages[msgId].eventManager = eventManager;
        }
        Stargate.messages[msgId].send();

    };

    this.prepareInterstitial = function(data, callbackSuccess, callbackError){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.prepareInterstitial';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].callbackSuccess = callbackSuccess;
        Stargate.messages[msgId].callbackError = callbackError;
        Stargate.messages[msgId].send();
    };

    this.showInterstitial = function(data){
    	var msgId = Stargate.createMessageId();
        Stargate.messages[msgId] = new Message();
        Stargate.messages[msgId].msgId = msgId;
        Stargate.messages[msgId].exec = 'stargate.showInterstitial';
        if (typeof data !== 'undefined'){
            Stargate.messages[msgId].data = data;
        }
        Stargate.messages[msgId].send();

    };
    
	this.test = function(){
		alert("it works");
	}
};