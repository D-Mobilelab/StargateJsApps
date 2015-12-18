/* globals store, accountmanager */

var IAP = {

	id: '',
	alias: '',
	type: '',
	verbosity: '',
	paymethod: '',
    subscribeMethod: 'stargate',
    returnUrl: '',
	
	initialize: function () {
        if (!window.store) {
            log('Store not available');
            return;
        }
		
        if (hybrid_conf.IAP.id) {
            IAP.id = hybrid_conf.IAP.id;
        }

        if (hybrid_conf.IAP.alias) {
            IAP.alias = hybrid_conf.IAP.alias;
        }

        if (hybrid_conf.IAP.type) {
            IAP.type = hybrid_conf.IAP.type;
        }

        if (hybrid_conf.IAP.verbosity) {
            IAP.verbosity = hybrid_conf.IAP.verbosity;
        }

        if (hybrid_conf.IAP.paymethod) {
            IAP.paymethod = hybrid_conf.IAP.paymethod;
        }

        log('IAP initialize id: '+IAP.id);
		
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
			log('accounts');
			log(result);
			
			for(var i in result){
				window.localStorage.setItem('googleAccount', result[i].email);
				return result[i].email;
			}
		}	
	},
 
    onProductUpdate: function(p){
        log('IAP> Product updated.');
        log(JSON.stringify(p));
        if (p.owned) {
            log('Subscribed!');
        } else {
            log('Not Subscribed');
        }
    },
    
    onPurchaseApproved: function(p){
        log('IAP> Purchase approved.');
        log(JSON.stringify(p));
        //p.verify(); TODO before finish		
        p.finish();
    },
    onPurchaseVerified: function(p){
        log("subscription verified");
        //p.finish(); TODO
    },
    onStoreReady: function(){
        log("\\o/ STORE READY \\o/");
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
            var purchase_token = p.transaction.purchaseToken + '|' + stargateConf.id + '|' + IAP.id;
            log('Purchase Token: '+purchase_token);
            
            if(!window.localStorage.getItem('user_account')){
                IAP.createUser(p, purchase_token);
            }
            
        } else {
        
            storekit.loadReceipts(function (receipts) {
                log('appStoreReceipt: ' + receipts.appStoreReceipt);
                                  
                if(!window.localStorage.getItem('user_account')){
                    IAP.createUser(p, receipts.appStoreReceipt);
                }
            });
        }
        
    },
    
    onCancelledProduct: function(p){
        err("UN-IMPLEMENTED!");
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 

		//app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, {'iap_cancelled' : 1, 'return_url' : app.appUrl}, false);
        log('IAP > Purchase cancelled ##################################');
    },
    
    onOrderApproved: function(order){
       log("ORDER APPROVED "+IAP.id);
       order.finish();
    },
	
	error: function(error) {
		err("UN-IMPLEMENTED!");
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        
        //app.sendBackToStargate('stargate.purchase.subscription', app.msgId, false, {'iap_error' : 1, 'return_url' : app.appUrl}, false);
		log('error');	
	},
	
	createUser: function(product, purchaseToken){
	
		window.localStorage.setItem('user_account', ua.Android() ? (window.localStorage.getItem('googleAccount') ? window.localStorage.getItem('googleAccount') : purchaseToken+'@google.com') : product.transaction.id+'@itunes.com');
		
        err("UN-IMPLEMENTED!");
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        // FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
        
        /*
		var url = IAP.subscribeMethod;		
		
		
		
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
        */
	}
};



