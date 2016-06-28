

stargatePublic.inAppPurchaseSubscription = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        callbackError("Stargate not initialized, call Stargate.initialize first!");
        return false;
    }
    if (!isStargateOpen) {
        callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }
    
    setBusy(true);

    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;
    
    /*
    if (isRunningOnAndroid() && appIsDebug) {
        var debugTransactionAndroid = {
            "id":IAP.id,
            "alias":"Stargate Debug IAP Mock",
            "type":"paid subscription",
            "state":"owned",
            "title":"Stargate Debug IAP Mock subscription",
            "description":"Stargate Debug IAP Mock subscription",
            "price":"€2.00",
            "currency":"EUR",
            "loaded":true,
            "canPurchase":false,
            "owned":true,
            "downloading":false,
            "downloaded":false,
            "transaction":{
                "type":"android-playstore",
                "purchaseToken":"dgdecoeeoodhalncipabhmnn.AO-J1OwM_emD6KWnZBjTCG2nTF5XWvuHzLCOBPIBj9liMlqzftcDamRFnUvEasQ1neEGK7KIxlPKMV2W09T4qAVZhw_aGbPylo-5a8HVYvJGacoj9vXbvKhb495IMIq8fmywk8-Q7H5jL_0lbfSt9SMVM5V6k3Ttew",
                "receipt":"{\"packageName\":\"stargate.test.package.id\",\"productId\":\"stargate.mock.subscription.weekly\",\"purchaseTime\":1460126549804,\"purchaseState\":0,\"purchaseToken\":\"dgdecoeeoodhalncipabhmnn.AO-J1OwM_emD6KWnZBjTCG2nTF5XWvuHzLCOBPIBj9liMlqzftcDamRFnUvEasQ1neEGK7KIxlPKMV2W09T4qAVZhw_aGbPylo-5a8HVYvJGacoj9vXbvKhb495IMIq8fmywk8-Q7H5jL_0lbfSt9SMVM5V6k3Ttew\",\"autoRenewing\":false}","signature":"UciGXv48EMVdUXICxoy+hBWTiKbn4VABteQeIUVlFG0GmJ/9p/k372RhPyprqve7tnwhk+vpZYos5Fwvm/SrYjsqKMMFgTzotrePwJ9spq2hzmjhkqNTKkxdcgiuaCp8Vt7vVH9yjCtSKWwdS1UBlZLPaJunA4D2KE8TP/qYnwgZTOCBvSf3rUbEzmwRuRbYqndNyoMfIXvRP71TDBsMcHM/3UrDYEf2k2/SJKnctcGmvU2/BW/WG96T9FuiJPpotax7iQmBdN5PmfuxlZiZiUyj9mFEgzPEIAMP2HCcdX2KlNBPhKhxm4vESozVljTbrI0+OGJjQJhaWBn9+aclmA=="
            },
            "valid":true
        };
        IAP.onProductOwned(debugTransactionAndroid);
        return true;
    }
    */

    IAP.inappPurchaseCalled = true;
    
    // execute createUser if data is already available
    if (IAP.lastCreateUserProduct && IAP.lastCreateUserToken) {
        IAP.createUser(IAP.lastCreateUserProduct, IAP.lastCreateUserToken);
        
        // no need to call refresh again
        return true;
    }
    
    IAP.doRefresh();
    window.store.order(IAP.id);
    return true;
};


stargatePublic.inAppRestore = function(callbackSuccess, callbackError, subscriptionUrl, returnUrl) {

    if (!isStargateInitialized) {
        return callbackError("Stargate not initialized, call Stargate.initialize first!");
    }
    if (!isStargateOpen) {
        return callbackError("Stargate closed, wait for Stargate.initialize to complete!");
    }

    // no set busy needed for restore as it's usually fast and 
    //  we cannot intercept error result, so the loader remain visible

    if (typeof subscriptionUrl !==  'undefined'){
        IAP.subscribeMethod = subscriptionUrl;
    }
    if (typeof returnUrl !==  'undefined'){
        IAP.returnUrl = returnUrl;
    }
    
    IAP.callbackSuccess = callbackSuccess;
    IAP.callbackError = callbackError;
    IAP.inappPurchaseCalled = true;
    
    IAP.doRefresh(true);
};

/**
 * Return information about a product got from store
 * 
 * @param {object} options - options object
 * @param {string} [options.productId=IAP.id] - product id about to query for information on store
 * @param {string} options.subscriptionUrl - api endpoint that will be called when IAP is completed @see createUser method
 * @param {function} options.callbackListingSuccess=function(){} - a function that will be called when information are ready
 * @param {function} options.callbackPurchaseSuccess=function(){} - a function that will be called when createUser complete (if the product is already owned)
 * @param {function} options.callbackError=function(){} - a function that will be called if an error occur 
 * 
 * @returns {boolean} - request result: true OK, false KO
 * */
stargatePublic.inAppProductInfo = function(options) {

    if (! options.productId) {
        options.productId = IAP.id;
    }
    
    if (typeof(options.callbackListingSuccess) !== "function") {
        options.callbackListingSuccess = function() {};
    }
    if (typeof(options.callbackPurchaseSuccess) !== "function") {
        options.callbackPurchaseSuccess = function() {};
    }
    if (typeof(options.callbackError) !== "function") {
        options.callbackError = function() {};
    }
    if (!options.subscriptionUrl) {
        err("[IAP] inAppProductInfo(): options.subscriptionUrl invalid");
        return false;
    }
    
    if (!isStargateInitialized) {
        options.callbackError("Stargate not initialized, call Stargate.initialize first!");
        return false;
    }
    if (!isStargateOpen) {
        options.callbackError("Stargate closed, wait for Stargate.initialize to complete!");
        return false;
    }
    
    IAP.subscribeMethod = options.subscriptionUrl;
    
    IAP.requestedListingProductId = options.productId;
    IAP.callbackListingSuccess = options.callbackListingSuccess;
    IAP.callbackPurchaseSuccess = options.callbackPurchaseSuccess;
    IAP.callbackListingError = options.callbackError;
    IAP.inappProductInfoCalled = true;

    // execute callback for product information if data is already available 
    if (IAP.productsInfo[options.productId]) {
        try {
            IAP.callbackListingSuccess(IAP.productsInfo[options.productId]);
        }
        catch (error) {
            err("[IAP] inAppProductInfo(): error on callbackListingSuccess!");
        }
    }
    
    // execute createUser if data is already available
    if (IAP.lastCreateUserProduct && IAP.lastCreateUserToken) {
        IAP.createUser(IAP.lastCreateUserProduct, IAP.lastCreateUserToken);
        
        // no need to call refresh again
        return true;
    }
    
    // call refresh then, when store will call stargate, we will call client callbacks
    IAP.doRefresh(true);    
    return true;    
};
