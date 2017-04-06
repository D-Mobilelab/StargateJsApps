var iaplight = (function(){
    
	var protectedInterface = {};

    /*
     * inAppPurchase.getProducts(["com.mycompany.myproduct.weekly.v1"]).then(function(res){console.log("res:"+JSON.stringify(res))})
     * res:[
     *     {
     *         "productId": "com.mycompany.myproduct.weekly.v1",
     *         "title": "Abbonamento Premium CalcioStar Italia",
     *         "description": "Abonamento premium al catalogo CalcioStar Italia",
     *         "price": "€0,99"
     *     }
     * ]
     * 
     * inAppPurchase.subscribe("com.mycompany.myproduct.weekly.v1").then(function(res){console.log("res:"+JSON.stringify(res))}).catch(function(err){console.error(err)})
     * res:{
     *     "transactionId":"1000000221696692",
     *     "receipt":"MXXXX"
     * }
     * 
     * inAppPurchase.getReceiptBundle().then(function(res){console.log("res:"+JSON.stringify(res))})
     * res:{
     *     "originalAppVersion": "1.0",
     *     "appVersion": "0.1.0",
     *     "inAppPurchases": [
     *         {
     *             "transactionIdentifier":"1000000221696692",
     *             "quantity":1,
     *             "purchaseDate":"2016-07-05T10:15:21Z",
     *             "productId":"com.mycompany.myproduct.weekly.v1",
     *             "originalPurchaseDate":"2016-07-05T10:15:22Z",
     *             "subscriptionExpirationDate":"2016-07-05T10:18:21Z",
     *             "originalTransactionIdentifier":"1000000221696692",
     *             "webOrderLineItemID":-1497665198,
     *             "cancellationDate":null}
     *     ],
     *     "bundleIdentifier": "com.mycompany.myproduct"
     * }
    */

    /**
     * 
     * Initialization promise generated from window.inAppPurchase.getProducts
     * all public interface wait for this promise to resolve
     * 
     */
    var initPromise = null;
    

    /**
     * Array of in app products id requested by webapp
     */
    var productsId = [];

    /**
     * Array of in app product information, like this: 
     * [{
     *   "productId": "com.mycompany.myproduct.weekly.v1",
     *   "title": "Premium subscription to myproduct",
     *   "description": "Premium subscription to my beatiful product",
     *   "price": "€0,99"
     * }]
     */
    var productsInfo = [];

    /**
     * @param {object} initializeConf - configuration sent by
     * @return {boolean} - true if init ok
     */
	protectedInterface.initialize = function(initializeConf) {

        if (!window.inAppPurchase) {
            return Promise.reject("inAppPurchase not available, missing cordova plugin.");
        }

        if (initPromise !== null) {
            return initPromise;
        }

        if (initializeConf.productsIdAndroid || initializeConf.productsIdIos) {
            if (isRunningOnAndroid()) {
                productsId = initializeConf.productsIdAndroid;
            }
            else if (isRunningOnIos()) {
                productsId = initializeConf.productsIdIos;
            }
        }

        if (!productsId) {
            return Promise.reject("missing parameter productsId(Android|Ios)");
        }
        if (productsId && productsId.constructor !== Array) {
            return Promise.reject("parameter error, productsId(Android|Ios) must be an array");
        }
        if (productsId.length === 0) {
            return Promise.reject("parameter error, productsId(Android|Ios) must contains at least a productid");
        }
        

        initPromise = window.inAppPurchase.getProducts(productsId)
            .then(function(res){
                productsInfo = res;
                log("[IAPlight] getProducts ok", res);
                return res;
            })
            .catch(function(error) {
                err("[IAPlight] getProducts KO", error);
            });

        return initPromise;
    };

    protectedInterface.subscribe = function(productId) {
        
        if (initPromise === null) {
            return Promise.reject("Not initialized");
        }

        var subFunc = function() {
            return window.inAppPurchase.subscribe(
                productId
            )
            .then(function(res){
                log("[IAPlight] subscribe ok", res);
                return res;
            })
            .catch(function(error){
                err("[IAPlight] subscribe KO: "+error, error);
                //throw err;
            });
        };

        // wait for initPromise if it didn't complete
        return initPromise.then(subFunc);
    };

    protectedInterface.getExpireDate = function(productId) {
        
        if (initPromise === null) {
            return Promise.reject("Not initialized");
        }

        var receiptFunc = function() {
            return window.inAppPurchase.getReceiptBundle()
            .then(function(res){
                // return last purchase receipt (ordered by last subscriptionExpirationDate)

                log("[IAPlight] getExpireDate getReceiptBundle ok", res);

                /* res:{ "originalAppVersion": "1.0",
                *        "appVersion": "0.1.0",
                *        "inAppPurchases": [ {
                *                "transactionIdentifier":"123412341234",
                *                "quantity":1,
                *                "purchaseDate":"2016-07-05T10:15:21Z",
                *                "productId":"com.mycompany.myapp.weekly.v1",
                *                "originalPurchaseDate":"2016-07-05T10:15:22Z",
                *                "subscriptionExpirationDate":"2016-07-05T10:18:21Z",
                *                "originalTransactionIdentifier":"123412341234",
                *                "webOrderLineItemID":-1497665198,
                *                "cancellationDate":null}
                *        ],
                *        "bundleIdentifier": "com.mycompany.myapp" }
                */
                var lastPurchase = {};
                if (res.inAppPurchases && res.inAppPurchases.constructor === Array) {
                    res.inAppPurchases.forEach(function(inAppPurchase) {
                        
                        // filter out other productIds
                        if (inAppPurchase.productId == productId) {

                            // if 
                            if (!lastPurchase.subscriptionExpirationDate) {
                                lastPurchase = inAppPurchase;
                                return;
                            }

                            var lastExp = new Date(lastPurchase.subscriptionExpirationDate);
                            var currExp = new Date(inAppPurchase.subscriptionExpirationDate);

                            if (lastExp < currExp) {
                                lastPurchase = inAppPurchase;
                                return;
                            }
                        }
                    });
                }

                return lastPurchase;
            })
            .then(function(lastPurchase) {
                // return expiration date

                if (!lastPurchase.subscriptionExpirationDate) {
                    return null;
                }
                log("[IAPlight] getExpireDate lastPurchase ok", lastPurchase);

                var dt = new Date(lastPurchase.subscriptionExpirationDate);
                if ( Object.prototype.toString.call(dt) === "[object Date]" ) {
                    // it is a date
                    if ( isNaN( dt.getTime() ) ) {
                        return null;
                    }
                }
                else {
                    err("[IAPlight] getReceiptBundle invalid date: "+lastPurchase.subscriptionExpirationDate+" Date.toString:"+dt);
                    return null;
                }
                return dt;
            })
            .catch(function(error){
                err("[IAPlight] getReceiptBundle KO: "+error, error);
                //throw err;
            });
        };

        // wait for initPromise if it didn't complete
        return initPromise.then(receiptFunc);
    };

    protectedInterface.isSubscribed = function(productId) {
        
        if (initPromise === null) {
            return Promise.reject("Not initialized");
        }

        var isSubscribedFunc = function() {
            if (isRunningOnAndroid()) {

                return protectedInterface.restore()
                .then(function(resultsRestore){

                    var validSubscriptionFound = false;
                    if (resultsRestore && resultsRestore.constructor === Array) {
                        resultsRestore.forEach(function(resultRestore) {
                            
                            //log("[IAPlight] checking for valid suscription: ", {
                            //    productId: productId,
                            //    appPackageName: appPackageName,
                            //    parsedReceipt: JSON.parse(resultRestore.receipt),
                            //    resultRestore: resultRestore,
                            //});
                            
                            // filter out other productIds
                            if (resultRestore.productId == productId) {
                                
                                var parsedReceipt =  JSON.parse(resultRestore.receipt);
                                if ((parsedReceipt.productId == productId) && 
                                    (parsedReceipt.packageName == appPackageName) &&
                                    (parsedReceipt.purchaseState === 0)) {
                                    
                                    log("[IAPlight] valid suscription found: "+resultRestore.receipt, parsedReceipt);
                                    
                                    validSubscriptionFound = true;
                                }
                            }
                            else {
                                log("[IAPlight] productId mismatch: '"+resultRestore.productId+"' != '"+productId+"'");                            
                            }
                        });
                    }
                    return validSubscriptionFound;
                });

            } else if (isRunningOnIos()) {

                return protectedInterface.getExpireDate(productId)
                .then(function(expireDate){

                    log("[IAPlight] expireDate: "+expireDate, expireDate);

                    return ((expireDate !== null) && (new Date() < expireDate));
                });

            } else {
                return Promise.reject("Unsupported platform!");
            }
        };

        // wait for initPromise if it didn't complete
        return initPromise.then(isSubscribedFunc);
    };

    protectedInterface.restore = function() {
        
        if (initPromise === null) {
            return Promise.reject("Not initialized");
        }

        var restoreFunc = function() {
            return window.inAppPurchase.restorePurchases()
            .then(function(resultRestore){
                // resolves to an array of objects with the following attributes:
                //   productId
                //   state - the state of the product. On Android the statuses are: 0 - ACTIVE, 1 - CANCELLED, 2 - REFUNDED
                //   transactionId
                //   date - timestamp of the purchase
                //   productType - On Android it can be used to consume a purchase. On iOS it will be an empty string.
                //   receipt - On Android it can be used to consume a purchase. On iOS it will be an empty string.
                //   signature - On Android it can be used to consume a purchase. On iOS it will be an empty string.


                log("[IAPlight] restore restorePurchases ok", resultRestore);

                /* resultRestore: [
                        {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:27:21Z","transactionId":"1000000222595453","state":3},
                        {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:21:21Z","transactionId":"1000000222595454","state":3},
                        {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T11:10:50Z","transactionId":"1000000222595466","state":3}
                    ]
                */

                return resultRestore;
            })
            .catch(function(error){
                err("[IAPlight] restore restorePurchases KO: "+error, error);
                //throw err;
            });
        };

        // wait for initPromise if it didn't complete
        return initPromise.then(restoreFunc);
    };

    protectedInterface.getProductInfo = function(productId) {
        
        if (initPromise === null) {
            return Promise.reject("Not initialized");
        }

        // wait for initPromise if it didn't complete
        return initPromise.then(function(){

            var rightProductInfo = {};

            productsInfo.forEach(function(productInfo) {
                if (productInfo.productId == productId) {
                    rightProductInfo = productInfo;
                }
            });
            log("[IAPlight] getProductInfo(): product found:", rightProductInfo);

            return rightProductInfo;
        });
    };

    /**
     * 
     * Check that stargate is properly initialized befor calling the function innerMethod
     */
    var checkDecorator = function(innerMethod) {
        return function () {

            if (!isStargateInitialized) {
                return Promise.reject("Stargate not initialized, call Stargate.initialize first!");
            }
            if (!isStargateOpen) {
                return Promise.reject("Stargate closed, wait for Stargate.initialize to complete!");
            }

            return innerMethod.apply(null, arguments);
        };
    };

    protectedInterface.public = {
        "initialize": checkDecorator(protectedInterface.initialize),
        "restore": checkDecorator(protectedInterface.restore),
        "getProductInfo": checkDecorator(protectedInterface.getProductInfo),
        "subscribe": checkDecorator(protectedInterface.subscribe),
        "isSubscribed": checkDecorator(protectedInterface.isSubscribed)
    };

    protectedInterface.__clean__ = function() {
        initPromise = null;
    };

    return protectedInterface;
})();

stargatePublic.iaplight = iaplight.public;
