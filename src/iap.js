
var IAP = {

	                                        id: '',
	                                        alias: '',
	                                        type: '',
	                                        verbosity: '',
	                                        paymethod: '',
  subscribeMethod: '',
  returnUrl: '',
    /**
     * callbackSuccess for inapppurchase and inapprestore
     */
  callbackSuccess: function() {log("[IAP] Undefined callbackSuccess");},
    /**
     * callbackSuccess for inapppurchase and inapprestore
     */
  callbackError: function() {log("[IAP] Undefined callbackError");},
  callbackListingSuccess: function() {log("[IAP] Undefined callbackListingSuccess");},
  callbackListingError: function() {log("[IAP] Undefined callbackListingError");},
    /**
     * callbackPurchaseSuccess for inAppProductInfo
     */
  callbackPurchaseSuccess: function() {log("[IAP] Undefined callbackPurchaseSuccess");},
  requestedListingProductId: '',
    /**
     * true when inapppurchase is requested by the user
     */
  inappPurchaseCalled: false,
    /**
     * true when inappproductinfo is requested by the user
     */
  inappProductInfoCalled: false,
  lastCreateUserProduct: null,
  lastCreateUserToken: null,

  refreshDone: false,
  lastCreateuserUrl: '',
  lastCreateuserData: '',
  createUserAttempt: 0,
  maxCreateUserAttempt: 6,

  refreshInProgress: false,
  productsInfo: {},

    /**
     * @param {object} initializeConf - configuration sent by
     * @return {boolean} - true if init ok
     */
	                                        initialize: function(initializeConf) {
  if (!window.store) {
    err("[IAP] Store not available, missing cordova plugin.");
    return false;
  }

        // initialize with current url
  IAP.returnUrl = document.location.href;

  if (initializeConf.id) {
    IAP.id = initializeConf.id;
  } else {
    if (isRunningOnAndroid()) {
      IAP.id = initializeConf.id_android;
    }
    else if (isRunningOnIos()) {
      IAP.id = initializeConf.id_ios;
    }
  }

  if (!IAP.id) {
    err("[IAP] Configuration error, missing product id!");
    return false;
  }

        //
  if (initializeConf.alias) {
    IAP.alias = initializeConf.alias;
  }

        //  --- type ---
        // store.FREE_SUBSCRIPTION = "free subscription";
        // store.PAID_SUBSCRIPTION = "paid subscription";
        // store.CONSUMABLE        = "consumable";
        // store.NON_CONSUMABLE    = "non consumable";
  if (initializeConf.type) {
    IAP.type = initializeConf.type;
  }

  if (initializeConf.api_createuser) {
    IAP.subscribeMethod = initializeConf.api_createuser;
  }

        // Available values: DEBUG, INFO, WARNING, ERROR, QUIET
  IAP.verbosity = 'INFO';

  IAP.paymethod = isRunningOnAndroid() ? 'gwallet' : 'itunes';


  log('IAP initialize id: ' + IAP.id);

		                                        if (isRunningOnAndroid()) {
			                                        IAP.getGoogleAccount();
		}
  window.store.verbosity = window.store[IAP.verbosity];
        // store.validator = ... TODO

  window.store.register({
    id: IAP.id,
    alias: IAP.alias,
    type: window.store[IAP.type]
  });

  window.store.when(IAP.alias).approved(function(p) {IAP.onPurchaseApproved(p);});
  window.store.when(IAP.alias).verified(function(p) {IAP.onPurchaseVerified(p);});
  window.store.when(IAP.alias).updated(function(p) {IAP.onProductUpdate(p);});
		                                        window.store.when(IAP.alias).owned(function(p) {IAP.onProductOwned(p);});
		                                        window.store.when(IAP.alias).cancelled(function(p) {IAP.onCancelledProduct(p); });
		                                        window.store.when(IAP.alias).error(function(errorPar) {IAP.error(JSON.stringify(errorPar));});
  window.store.ready(function() { IAP.onStoreReady();});
  window.store.when("order " + IAP.id).approved(function(order) {IAP.onOrderApproved(order);});

        // When any product gets updated, refresh the HTML.
  window.store.when("product").updated(function(p) { IAP.saveProductInfo(p); });

  return true;
},

  saveProductInfo: function(params) {
    IAP.refreshInProgress = false;
    if (typeof params !== "object") {
      err("[IAP] saveProductInfo() got invalid data");
      return;
    }

    if ("id" in params) {
      IAP.productsInfo[params.id] = params;

    } else {
      err("[IAP] saveProductInfo() got invalid data, id undefined");
      return;
    }

    if (IAP.requestedListingProductId === params.id) {

      IAP.callbackListingSuccess(params);
    }
  },

  doRefresh: function(force) {
    if (IAP.refreshInProgress) {
      war("[IAP] doRefresh() refresh in progress, skipping...");
    }
    if (!IAP.refreshDone || force) {
      window.store.refresh();
      IAP.refreshDone = true;
      IAP.refreshInProgress = true;
      log("[IAP] doRefresh() refreshing...");
    }
  },

  getPassword: function(transactionId) {
    return md5('iap.' + transactionId + '.playme').substr(0, 8);
  },

	                                        getGoogleAccount: function() {
		                                        window.accountmanager.getAccounts(IAP.checkGoogleAccount, IAP.error, "com.google");
	},

	                                        checkGoogleAccount: function(result) {

		                                        if (result) {
			                                        log('[IAP] accounts');
			                                        log(result);

			                                        for (var i in result) {
				                                        window.localStorage.setItem('googleAccount', result[i].email);
				                                        return result[i].email;
			}
		}
	},

  onProductUpdate: function(p) {
    log('IAP> Product updated.');
    log(JSON.stringify(p));
    if (p.owned) {
      log('[IAP] Subscribed!');
    } else {
      log('[IAP] Not Subscribed');
    }
  },

  onPurchaseApproved: function(p) {
    log('IAP> Purchase approved.');
    log(JSON.stringify(p));
        // p.verify(); TODO before finish
    p.finish();
  },
  onPurchaseVerified: function(p) {
    log("subscription verified ", p);
        // p.finish(); TODO
  },
  onStoreReady: function() {
    log("\\o/ STORE READY \\o/");
        /* store.ask(IAP.alias)
        .then(function(data) {
              console.log('Price: ' + data.price);
              console.log('Description: ' + data.description);
              })
        .error(function(err) {
               // Invalid product / no connection.
               console.log('ERROR: ' + err.code);
               console.log('ERROR: ' + err.message);
               });*/
  },

  onProductOwned: function(p) {
    log('[IAP] > Product Owned.');
    if (!p.transaction.id && isRunningOnIos()) {
      err('[IAP] > no transaction id');
      return false;
    }
    window.localStorage.setItem('product', p);
		                                                                                  if (isRunningOnIos()) {
			                                        window.localStorage.setItem('transaction_id', p.transaction.id);
		}

    if (isRunningOnAndroid()) {
      var purchase_token = p.transaction.purchaseToken + '|' + appPackageName + '|' + IAP.id;
      log('[IAP] Purchase Token: ' + purchase_token);

      if (!window.localStorage.getItem('user_account')) {
        IAP.createUser(p, purchase_token);
      }

    } else {

      window.storekit.loadReceipts(function(receipts) {

        if (!window.localStorage.getItem('user_account')) {
          if (!!!receipts.appStoreReceipt) {
            log('[IAP] appStoreReceipt empty, ignoring request');
          }
          else {
            log('[IAP] appStoreReceipt: ' + receipts.appStoreReceipt);
            IAP.createUser(p, receipts.appStoreReceipt);
          }
        }
      });
    }

  },

  onCancelledProduct: function(p) {
    setBusy(false);
    IAP.callbackError({'iap_cancelled': 1, 'return_url': IAP.returnUrl});
    log('[IAP] > Purchase cancelled ##################################', p);
  },

  onOrderApproved: function(order) {
    log("[IAP] ORDER APPROVED " + IAP.id);
    order.finish();
  },

	                                        error: function(error) {
  setBusy(false);
		                                        err('[IAP] error: ' + error);

  IAP.callbackError({'iap_error': 1, 'return_url': IAP.returnUrl});
	},



	                                        createUser: function(product, purchaseToken) {
  log('[IAP] createUser start ');

        // if i'm here before user request inapp purchase/restore
        //  or in app product info
        //  i save data for calling again me when requested.
  if (!IAP.inappProductInfoCalled && !IAP.inappPurchaseCalled) {
    IAP.lastCreateUserProduct = product;
    IAP.lastCreateUserToken = purchaseToken;
    return;
  }


  if (!IAP.subscribeMethod) {
    err("[IAP] createUser configuration error: missing api url.");
    return;
  }

		                                        window.localStorage.setItem('user_account',
            isRunningOnAndroid() ?
                (window.localStorage.getItem('googleAccount') ?
                    window.localStorage.getItem('googleAccount')
                    : purchaseToken + '@google.com')
                : product.transaction.id + '@itunes.com');

  var url = IAP.subscribeMethod;

  var formData = {
    "paymethod": IAP.paymethod,
    "user_account": window.localStorage.getItem('user_account'),
    "purchase_token": purchaseToken,
    "return_url": IAP.returnUrl,
    "inapp_pwd": IAP.getPassword(purchaseToken),
    "hybrid": 1
  };

  IAP.lastCreateuserUrl = url;
  IAP.lastCreateuserData = formData;

  var onCreateError = function(error) {
    if (IAP.createUserAttempt <= IAP.maxCreateUserAttempt) {
      err("[IAP] createUser failed " + IAP.createUserAttempt +
                    " times, trying again... last error: " + JSON.stringify(error)
                );

                // trying again
      createUserAjaxCall();
    }
    else {
                // no more try, fail to webapp callbackerror

      err('[IAP] createUser onCreateError: removing user_account');
      window.localStorage.removeItem('user_account');

      var stargateResponseError = {"iap_error": "1", "return_url": IAP.returnUrl};
      setBusy(false);

      if (IAP.inappPurchaseCalled) {
        IAP.callbackError(stargateResponseError);
      } else if (IAP.inappProductInfoCalled) {
        IAP.callbackListingError(stargateResponseError);
      }
    }
  };

  var onCreateSuccess = function(user) {
    log('[IAP] createUser success ', user);
    try {
      user.device_id = runningDevice.uuid;
      if (window.localStorage.getItem('transaction_id')) {
        user.transaction_id = window.localStorage.getItem('transaction_id');
      }
      setBusy(false);
      IAP.callbackSuccess(user);

      if (IAP.inappPurchaseCalled) {
        IAP.callbackSuccess(user);
      } else if (IAP.inappProductInfoCalled) {
        IAP.callbackPurchaseSuccess(user);
      }
    }
            catch (error) {
              onCreateError(error);
            }
  };

  var startTimeoutSeconds = 10;

  var createUserAjaxCall = function() {
    setTimeout(function() {
      IAP.createUserAttempt = IAP.createUserAttempt + 1;

      log('[IAP] createUser attempt: ' + IAP.createUserAttempt +
                        ' with timeout: ' + startTimeoutSeconds + 'sec.');

      log("[IAP] POST createUser: " + IAP.lastCreateuserUrl +
                        " params: " + JSON.stringify(IAP.lastCreateuserData) +
                        " timeout: " + startTimeoutSeconds * 1000);

      window.aja()
                        .method('POST')
                        .url(IAP.lastCreateuserUrl)
                        .cache(false)
                        .timeout(startTimeoutSeconds * 1000) // milliseconds
                        .data(IAP.lastCreateuserData)
                        .on('success', function(user) {
                          onCreateSuccess(user);
                        })
                        .on('error', function(error) {
                          onCreateError(error);
                        })
                        .on('4xx', function(error) {
                          onCreateError(error);
                        })
                        .on('5xx', function(error) {
                          onCreateError(error);
                        })
                        .on('timeout', function() {
                          onCreateError("timeout");
                        })
                        .on('end', function() {
                          log("[IAP] createUser end");
                          setBusy(false);
                        })
                        .go();

                    // more timeout
      startTimeoutSeconds = startTimeoutSeconds + 5;

    },
                10 // millisecond after it's executed (when the thread that called setTimeout() has terminated)
            );
  };

  IAP.createUserAttempt = 0;

        // start first attempt
  createUserAjaxCall();

	}
};



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

  if (typeof returnUrl !== 'undefined') {
    IAP.returnUrl = returnUrl;
  }
  if (typeof subscriptionUrl !== 'undefined') {
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

  if (typeof subscriptionUrl !== 'undefined') {
    IAP.subscribeMethod = subscriptionUrl;
  }
  if (typeof returnUrl !== 'undefined') {
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

  if (!options.productId) {
    options.productId = IAP.id;
  }

  if (typeof (options.callbackListingSuccess) !== "function") {
    options.callbackListingSuccess = function() {};
  }
  if (typeof (options.callbackPurchaseSuccess) !== "function") {
    options.callbackPurchaseSuccess = function() {};
  }
  if (typeof (options.callbackError) !== "function") {
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
