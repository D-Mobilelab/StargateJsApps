/* globals store, accountmanager */

var IAP = {

	id: '',
	alias: '',
	type: '',
	verbosity: '',
	paymethod: '',
    subscribeMethod: 'stargate',
	
	initialize: function () {
        if (!window.store) {
            console.log('Store not available');
            return;
        }
		
		IAP.id = (app.hybrid_conf.IAP.id) ? app.hybrid_conf.IAP.id : ((ua.Android())?CONFIGS.iap_android.id:CONFIGS.iap_ios.id);
		IAP.alias = (app.hybrid_conf.IAP.alias) ? app.hybrid_conf.IAP.alias : ((ua.Android())?CONFIGS.iap_android.alias:CONFIGS.iap_ios.alias);
		IAP.type = (app.hybrid_conf.IAP.type) ? app.hybrid_conf.IAP.type : ((ua.Android())?CONFIGS.iap_android.type:CONFIGS.iap_ios.type);
		IAP.verbosity = (app.hybrid_conf.IAP.verbosity) ? app.hybrid_conf.IAP.verbosity : ((ua.Android())?CONFIGS.iap_android.verbosity:CONFIGS.iap_ios.verbosity);
		IAP.paymethod = (app.hybrid_conf.IAP.paymethod) ? app.hybrid_conf.IAP.paymethod : ((ua.Android())?CONFIGS.iap_android.paymethod:CONFIGS.iap_ios.paymethod);		
		
        console.log('IAP initialize id: '+IAP.id);
		
		if(ua.Android()){
			IAP.getGoogleAccount();
		}
        store.verbosity = store[IAP.verbosity];
        // store.validator = ... TODO
        
        store.register({
                   id:    IAP.id,
                   alias: IAP.alias,
                   type:  store[IAP.type]
                   });
        
        store.when(IAP.alias).approved(function(p){IAP.onPurchaseApproved(p);});
        store.when(IAP.alias).verified(function(p){IAP.onPurchaseVerified(p);});
        store.when(IAP.alias).updated(function(p){IAP.onProductUpdate(p);});
		store.when(IAP.alias).owned(function(p){IAP.onProductOwned(p);});
		store.when(IAP.alias).cancelled(function(p){IAP.onCancelledProduct(p); });
		store.when(IAP.alias).error(function(err){IAP.error(JSON.stringify(err));});
        store.ready(function(){ IAP.onStoreReady();});
        store.when("order "+IAP.id).approved(function(order){IAP.onOrderApproved(order);});
    },

    getPassword: function (transactionId){
        return md5('iap.'+transactionId+'.playme').substr(0,8);
    },
	
	getGoogleAccount: function(){
		window.accountmanager.getAccounts(IAP.checkGoogleAccount, IAP.error, "com.google");	
	},
	
	checkGoogleAccount: function(result){
		
		if(result) {
			console.log('accounts');
			console.log(result);
			
			for(var i in result){
				window.localStorage.setItem('googleAccount', result[i].email);
				return result[i].email;
			}
		}	
	},
 
    onProductUpdate: function(p){
        console.log('IAP> Product updated.');
        console.log(JSON.stringify(p));
        if (p.owned) {
            console.log('Subscribed!');
        } else {
            console.log('Not Subscribed');
        }
    },
    
    onPurchaseApproved: function(p){
        console.log('IAP> Purchase approved.');
        console.log(JSON.stringify(p));
        //p.verify(); TODO before finish		
        p.finish();
    },
    onPurchaseVerified: function(p){
        console.log("subscription verified");
        //p.finish(); TODO
    },
    onStoreReady: function(){
        console.log("\\o/ STORE READY \\o/");
        /*store.ask(IAP.alias)
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
    
    onProductOwned: function(p){
        console.log('IAP > Product Owned.');
        if (!p.transaction.id && ua.iOS()){
            console.log('IAP > no transaction id');
            return false;
        }
        window.localStorage.setItem('product', p);
		if(ua.iOS()){
			window.localStorage.setItem('transaction_id', p.transaction.id);
		}
        
        if (ua.Android()){
            var purchase_token = p.transaction.purchaseToken + '|' + CONFIGS.label.id + '|' + IAP.id;
            console.log('Purchase Token: '+purchase_token);
            
            if(!window.localStorage.getItem('user_account')){
                IAP.createUser(p, purchase_token);
            }
            
        } else {
        
            storekit.loadReceipts(function (receipts) {
                console.log('appStoreReceipt: ' + receipts.appStoreReceipt);
                
                if (IAP.subscribeMethod == 'callback'){
                    // next generation subscription management
                    var pm = {};
                    pm.exec = 'stargate.purchase.subscription';
                    pm.originalMsgId = app.msgId;
                    pm.callbackParams = {
                        'product' : p,
                        'purchase_token': purchase_token,
                        'paymethod': IAP.paymethod,
                    };
                    pm.success = true;
                    appframe = document.getElementById('appframe');
                    appframe.contentWindow.postMessage(JSON.stringify(pm), '*');
                    return;
                }
                                  
                if(!window.localStorage.getItem('user_account')){
                    IAP.createUser(p, receipts.appStoreReceipt);
                }
            });
        }
        
    },
    
    onCancelledProduct: function(p){
		app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, {'iap_cancelled' : 1, 'return_url' : app.appUrl}, false);
        console.log('IAP > Purchase cancelled ##################################');
    },
    
    onOrderApproved: function(order){
       console.log("ORDER APPROVED "+IAP.id);
       order.finish();
    },
	
	error: function(error) {
		app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, {'iap_error' : 1, 'return_url' : app.appUrl}, false);
		console.log('error');	
	},
	
	createUser: function(product, purchaseToken){
	
		window.localStorage.setItem('user_account', ua.Android() ? (window.localStorage.getItem('googleAccount') ? window.localStorage.getItem('googleAccount') : purchaseToken+'@google.com') : product.transaction.id+'@itunes.com');
		
		var url = IAP.subscribeMethod;		
		
		if (IAP.subscribeMethod == 'stargate'){
		
			url = CONFIGS.api.userCreate;
		
			if(app.app_prefix)
				url = url.replace('%app_prefix%', app.app_prefix).replace('%selector%', app.selector);
			else
				url = url.replace('%app_prefix%/', '').replace('%selector%/', '');
			
			url = url.replace('%domain%', app.url()).replace('%country%', app.country);
		}
		
		$.ajax({
		  type: "POST",
		  url: url,
		  data: "paymethod="+IAP.paymethod+"&user_account="+window.localStorage.getItem('user_account')+"&purchase_token="+encodeURIComponent(purchaseToken)+"&return_url="+encodeURIComponent(app.url())+"&inapp_pwd="+IAP.getPassword(purchaseToken)+"&hybrid=1",
		  dataType: "json",
		  success: function(user)
		  {
			console.log(user);
			user.device_id = device.uuid;
			if(window.localStorage.getItem('transaction_id')){
				user.transaction_id = window.localStorage.getItem('transaction_id');
			}
			app.sendBackToStargate('stargate.purchase.subscription', app.msgId, true, user, false);
		  },
		  error: function(err)
		  {
			console.log("Chiamata fallita, si prega di riprovare...", err);
			var error = {"iap_error" : "1", "return_url" : app.url()};
			app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, error, false);
		  }
		});
	}
};