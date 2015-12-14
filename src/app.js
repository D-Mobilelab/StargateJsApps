/* globals facebookConnectPlugin, deltadna, StatusBar, Connection, device */


// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// 
// move all code to stargate.js
// 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 

var app = {

    height: '',
    width: '',
    appUrl: '',
    version: '',
    country: '',
    selector: '',
    api_selector: '',
    app_prefix: '',
    hybrid_conf: {},
    crypter: {},
    msgId: '',
    busy: false,
    back: 0,
    
    /*
    isBusy: function(){
        return app.busy;
    },
    
    setBusy: function(value){
        app.busy = value;
        if (value){
            startLoading();
        } else {
            stopLoading();
        }
    },
    
    hasFeature: function(feature){
        return (typeof CONFIGS.label.features[feature] !== 'undefined' && CONFIGS.label.features[feature]);
    },

    handshake: function() {
        appframe = document.getElementById('appframe');
        appframe.contentWindow.postMessage("{'exec':'handshake'}", '*');
    },
    
    initialUrl: function(requestedUrl) {
        var uri2process = requestedUrl || CONFIGS.label.url;

        var uri = new Uri(uri2process);

        if (CONFIGS.label.qps_fw && CONFIGS.label.qps_fw instanceof Array) {
            for (var i = 0; i < CONFIGS.label.qps_fw.length; i=i+2) {
                uri.addQueryParam( CONFIGS.label.qps_fw[i], CONFIGS.label.qps_fw[i+1] );
            }
        }
        if (CONFIGS.label.qps && CONFIGS.label.qps instanceof Array) {
            for (var i = 0; i < CONFIGS.label.qps.length; i=i+2) {
                uri.addQueryParam( CONFIGS.label.qps[i], CONFIGS.label.qps[i+1] );
            }
        }
        
        if(app.version){
            uri.addQueryParam('hv', app.version);
        }
        
        return uri.toString();
    },

    url: function() {
        if (!app.appUrl){
            app.appUrl = CONFIGS.label.url;
        }
        
        return app.appUrl;
    },

    // Application Constructor
    initialize: function() {
        document.title = CONFIGS.label.title;

        cordova.getAppVersion(function (version) {
            if(version){
                 app.version = version;
                 console.log("[app] got version: "+version);
            }
        });
        
        // if i don't have network connection on startup/loading
        // i show a page of error with a retry button
        if(navigator.network.connection.type == Connection.NONE){
            navigator.splashscreen.hide();
            window.location.href = 'retry.html';
            return;
        }
		StatusBar.hide();

        // save iframe reference
        app.iframe = document.getElementById("appframe");
        
        // -- bind events listener --
        if (device.platform == "iOS") {
			app.onOrientationChange();
            window.addEventListener('orientationchange', app.onOrientationChange, false);
        }
        window.addEventListener('message', app.onMessageReceived, false);
        
        // stargate crypter implementation with forge
        app.crypter = forge.pki.privateKeyFromPem(CONFIGS.label.privateKey);
        
        if (app.hasFeature('mfp')) {
            MFP.check();
        } else {
        	app.launch(app.url());
        }      
        
        // -- newton --
        var newton_device_id;
        
        if (app.hasFeature('newton')) {

            // get device id for newton from localstorage or calculate and save
            if (window.localStorage.getItem('newton_device_id')){
                newton_device_id = window.localStorage.getItem('newton_device_id');
            } else {
                newton_device_id = device.uuid;
                window.localStorage.setItem('newton_device_id', newton_device_id);
            }
            // set the user id
            window.newton.changeUser(newton_device_id, app.notificationListener, app.cordovaError);
        }
        // -- --

        if (app.hasFeature('deltadna')) {
            deltadna.startSDK(CONFIGS.label.deltadna.environmentKey, CONFIGS.label.deltadna.collectApi, CONFIGS.label.deltadna.engageApi, app.onDeltaDNAStartedSuccess, app.onDeltaDNAStartedError, CONFIGS.label.deltadna.settings);
        }
    },
    
    launch: function(url) {
        console.log('launch: ' + url);
        app.iframe.src = app.initialUrl(url);
    },

    onOrientationChange: function() {
        // FIXME
        var dim1 = screen.width,
            dim2 = screen.height;
        
        var banner = 0, marginTop = 0;
        
        switch (window.orientation) {
            case 90:
            case -90:
                //landscape
                if (dim1 > dim2){
                    app.width = dim1;
                    app.height = dim2 - marginTop;
                } else {
                    app.width = dim2;
                    app.height = dim1 - marginTop;
                }
                break;
            case 0:
            case 180:
                //portrait
                if (dim1 > dim2){
                    app.width = dim2;
                    app.height = dim1 - marginTop;
                } else {
                    app.width = dim1;
                    app.height = dim2 - marginTop;
                }
                break;
        }
        
        
        app.iframe.style.height = (app.height) + "px";
        app.iframe.style.width = (app.width) + "px";
        
        
        
        // DISPATCH RESIZE EVENT INSIDE GAMES
        if (app.iframe.contentWindow.cr_sizeCanvas) {
            app.iframe.contentWindow.cr_sizeCanvas(window.innerWidth, window.innerHeight);
        } else {
            var event = document.createEvent("OrientationEvent");
            event.initEvent("orientationchange", false, false);
            app.iframe.contentWindow.innerHeight = window.innerHeight;
            app.iframe.contentWindow.innerWidth = window.innerWidth;
            app.iframe.contentWindow.dispatchEvent(event);
            
            
        }
        
        // iframe inside game, set main window size
        if (app.iframe.contentDocument.getElementsByTagName("iframe").length > 0) {
            document.body.style.height = (app.height) + "px";
            document.body.style.width = (app.width) + "px";
        }
        else {
            document.body.style.height = "";
            document.body.style.width = "";
        }
        
        console.log("[app] onOrientationChange");
    },
	
	notificationListener: function(notification) {
        console.log("Received notification: ", notification);

        if ( !! window.localStorage.getItem('newton_disabled') ) {
            console.log("Push disabled, ignoring notification.");
            return;
        }
        
        var notifObj = {
            "push_id": notification.push_id
        };
        if (notification.title) {
            notifObj["title"] = notification.title;
        }
        if (notification.body) {
            notifObj["body"] = notification.body;
        }
        if (notification.custom_fields) {
            if (typeof notification.custom_fields === "object") {
                notifObj["custom_fields"] = notification.custom_fields;
            } else {
                try {
                    notifObj["custom_fields"] = JSON.parse(notification.custom_fields);
                }
                catch (e) {
                    notifObj["custom_fields"] = { "error": true, "errorType": "parseError", "errorMessage": e};
                }
            }
        }

        console.log("Parsed notification: ", notifObj);

        // FIXME change url of iframe
        if (notifObj.custom_fields.url) {
            app.launch( notifObj.custom_fields.url );
            return;
        }
        if (notifObj.custom_fields.eurl) {
            var ref = window.open(notifObj.custom_fields.eurl,
                '_system', 'location=no,toolbar=no');
            app.launch( app.appUrl );
            return;
        }
	},
    */
	cordovaError: function(err) {
        if (err === null) {
            // no result callback: isn't an error
            return;
        }
		console.error("Error from Cordova: "+err);
	},
    onMessageReceived: function (event) {
        
        if ( event.origin !== CONFIGS.label.origin ) {
			console.log("postMessage received from invalid origin", event);
            return;
        }
        
        var message = {};

        try {
            message = JSON.parse(event.data);
        }
        catch (e) {
            console.log("Json error: ", event.data);
            return;
        }
        
        if (app.isBusy() && message.exec !== 'ready'){
            console.log("Message received but the app is busy, ignoring");
            return;
        }

        switch(message.exec){
            case 'system':
                window.open(message.url, "_system");
                break;

            /*
            case 'ready':
				navigator.splashscreen.hide();
                app.setBusy(false);

                if(message.country){
					app.country = message.country;
				}
				if(message.selector){
					app.selector = message.selector;
				}
				if(message.api_selector){
					app.api_selector = message.api_selector;
				}
				if(message.app_prefix){
					app.app_prefix = message.app_prefix;
				}
				if(message.hybrid_conf){
                    if (typeof message.hybrid_conf === 'object') {
                        app.hybrid_conf = message.hybrid_conf;
                    } else {
                        app.hybrid_conf = JSON.parse(decodeURIComponent(message.hybrid_conf));
                    }
				}
				if (ua.iOS()){
                    app.onOrientationChange();
                }
                if(message.msgId){
                    // Stargate ready: Handshake
                    app.sendBackToStargate('handshake', message.msgId, true, {});
                }
				IAP.initialize();
				break;
                */
            case 'stargate.facebookLogin':
                app.setBusy(true);
                app.msgId = message.msgId;

                facebookConnectPlugin.login(message.scope.split(","),
                    app.onFbLoginSuccessStargate,
                    function (error) {
                        app.setBusy(false);
                        // error.errorMessage
                        console.log("Got FB login error:", error);
                        app.sendBackToStargate('stargate.facebooklogin', app.msgId, false, {'error':error}, true);
                    }
                );
                break;
			case 'stargate.facebookShare':
                app.setBusy(true);
                app.msgId = message.msgId;

				var options = {
					method: "share",
					href: message.url
				};
				
				facebookConnectPlugin.showDialog(options, 
					function(message){
						app.sendBackToStargate('stargate.facebookShare', app.msgId, true, {'message':message}, false);
					}, 
					function(error){
						app.setBusy(false);
                        // error.errorMessage
                        console.log("Got FB share error:", error);
                        app.sendBackToStargate('stargate.facebookShare', app.msgId, false, {'error':error}, false);
					}
				);
				break;
            case 'fblogin':
            	startLoading();
                app.appUrl = message.url;
                facebookConnectPlugin.login(message.scope.split(","),
                                            app.onFbLoginSuccess,
                                            function (error) {
                                                // error.errorMessage
                                                console.log("Got FB login error:", error);
                                                stopLoading();
                                            }
                                            );
                break;
            case 'googlelogin':
            	startLoading();
				app.appUrl = message.url;
				window.plugins.googleplus.login(
					{'androidApiKey':CONFIGS.label.google_client_id},
					app.onGoogleLoginSuccess,
					function (error) {
						console.log('Got Google login error: ' + error);
						stopLoading();
					}
				);
				break;
            case 'purchase':
				startLoading();
				if (message.url){
					app.appUrl = message.url;
				}
				store.order(IAP.id);
				store.refresh();
				break;
            case 'stargate.purchase.subscription':
                app.setBusy(true);
                app.msgId = message.msgId;

                if (message.returnUrl){
                    app.appUrl = message.returnUrl;
                }
                if (typeof message.subscriptionUrl !==  'undefined'){
                	IAP.subscribeMethod = message.subscriptionUrl;
				}
                
                // TODO: callback error (to be modified inside IAP plugin),
                store.order(IAP.id);
                store.refresh();
                break;
			case 'restore':
				startLoading();
				if (message.url){
					app.appUrl = message.url;
				}
				store.refresh();
				storekit.restore();
				break;
            case 'stargate.restore':
                app.setBusy(true);
                app.msgId = message.msgId;
                
                if (message.returnUrl){
                    app.appUrl = message.returnUrl;
                }
                if (typeof message.subscriptionUrl ===  'undefined'){
                    IAP.subscribeMethod = 'stargate';
                }
                
                // TODO: callback error (to be modified inside IAP plugin),
                store.refresh();
                storekit.restore();
                break;
            case 'stargate.googleLogin':
                console.log(message);
                // BUSY
                app.setBusy(true);
                app.msgId = message.msgId;
                window.plugins.googleplus.login(
                    {'androidApiKey':CONFIGS.label.google_client_id},
                    app.onGoogleLoginSuccessStargate,
                    function (error) {
                        console.log('Got Google login error: ' + error);
                        app.sendBackToStargate('stargate.googleLogin', app.msgId, false, {'error':error});
                        app.setBusy(false);
                    }
                );
                break;
			case 'stargate.checkConnection':
                app.msgId = message.msgId;
				var networkState = navigator.connection.type;
				app.sendBackToStargate('stargate.checkConnection', app.msgId, true, {'networkState' : networkState});
                break;
			case 'stargate.getDeviceID':
                app.msgId = message.msgId;
				var deviceID = device.uuid;
				app.sendBackToStargate('stargate.getDeviceId', app.msgId, true, {'deviceID' : deviceID});
                break;
            case 'stargate.createBanner':
                app.setBusy(true);
                app.msgId = message.msgId;
				var advConf = null;
				
				if(message.data){
                    if (typeof message.data === 'object') {
                        advConf = message.data;
                    } else {
                        advConf = JSON.parse(decodeURIComponent(message.data));
                    }
				}
				
				AdManager.createBanner(advConf);
                app.setBusy(false);
                break;
            case 'stargate.hideBanner':
                app.setBusy(true);
                app.msgId = message.msgId;
				var advConf = null;
				
				if(message.data){
                    if (typeof message.data === 'object') {
                        advConf = message.data;
                    } else {
                        advConf = JSON.parse(decodeURIComponent(message.data));
                    }
				}
				
				AdManager.hideBanner(advConf);
                app.setBusy(false);
                break;
            case 'stargate.removeBanner':
                app.setBusy(true);
                app.msgId = message.msgId;
				var advConf = null;
				
				if(message.data){
                    if (typeof message.data === 'object') {
                        advConf = message.data;
                    } else {
                        advConf = JSON.parse(decodeURIComponent(message.data));
                    }
				}
				
				AdManager.removeBanner(advConf);
                app.setBusy(false);
                break;
            }
    },
    
    onFbLoginSuccess: function (userData) {
    	facebookConnectPlugin.getAccessToken(function(token) {
            app.appUrl = app.appUrl + '&apk_fb_user_token='+token;
            app.launch(app.appUrl);
        }, function(err) {
            console.log("Could not get access token: " + err);
            reboot();
        });
    },
    onGoogleLoginSuccess: function (userData) {
				
		if(window.localStorage.getItem('googleRefreshToken_'+userData.userId)){
			app.appUrl = app.appUrl + '&apk_google_user_token='+window.localStorage.getItem('googleRefreshToken_'+userData.userId);
			app.launch(app.appUrl);		
		}
		else {

			window.plugins.googleplus.token(
				{'email':userData.email,
				'androidApiKey':CONFIGS.label.google_client_id},
				function (userToken) {
					app.onGoogleTokenSuccess(userToken, userData);
				},
				function (error) {
					console.log('Got Google login error: ' + error);
					stopLoading();
				}
			);
		}
		
    },
	onGoogleTokenSuccess: function (userToken, userData) {
				
		if(userToken.oauthToken){
							
			var xmlhttp;
		
			if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp=new XMLHttpRequest();
			} else {// code for IE6, IE5
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}		
			
			// network info	
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4){
					if(xmlhttp.status === 200) {
						try {
							var serverResponse = JSON.parse(xmlhttp.responseText);							
							var refresh_token = serverResponse.refresh_token;
							
							if(refresh_token){
								window.localStorage.setItem('googleRefreshToken_'+userData.userId, refresh_token);
								app.appUrl = app.appUrl + '&apk_google_user_token='+refresh_token;
								app.launch(app.appUrl);
							}
							else {
								console.log("Could not get refresh token");
								reboot();
							}		
							
						}
						catch(e){
							// display error message
							console.log("Error app.onGoogleLoginSuccess reading the response: " + e.toString());
							reboot();
						}
					}
					else {
						console.log("Error app.onGoogleLoginSuccess", xmlhttp.statusText);
						app.launch(app.url());
					}
				}
			};
			
			var url = CONFIGS.api.googleToken;
			
			xmlhttp.open("POST",url,true);
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			var params = "client_id="+CONFIGS.label.google_client_id+"&client_secret="+CONFIGS.label.google_client_secret+"&code="+userToken.oauthToken+"&redirect_uri=&grant_type=authorization_code";
			xmlhttp.send(params);
		
		}
		else {
            console.log("Could not get google code");
            reboot();
        }
		
    },
    onFbLoginSuccessStargate: function (userData, msgId) {
		app.setBusy(false);
        facebookConnectPlugin.getAccessToken(function(token) {
            app.sendBackToStargate('stargate.facebooklogin', app.msgId, true, {'accessToken' : token});
        }, function(err) {
            app.sendBackToStargate('stargate.facebooklogin', app.msgId, false, {'error':err});
        });
    },
    onGoogleLoginSuccessStargate: function (userData) {
        console.log(userData, CONFIGS.label.google_client_id);

            app._userData = userData;
            window.plugins.googleplus.token(
                {'email':userData.email,
                 'androidApiKey':CONFIGS.label.google_client_id},
                function (userToken) {
                    app.onGoogleTokenSuccess(userToken, app._userData);
                },
                function (error) {
                    app.sendBackToStargate('stargate.googleLogin',
                                            app.msgId,
                                            false,
                                            {'error':error}
                    );
                    console.log('Got Google login error: ' + error);
                    app.setBusy(false);
                }
            );
    },
    onDeltaDNAStartedSuccess: function(){
        deltadna.registerPushCallback(
			app.onDeltaDNAPush
		); 
    },
    onDeltaDNAStartedError: function(){
        
    },
    onDeltaDNAPush: function(pushDatas){
        if(ua.Android() && pushDatas.payload && pushDatas.payload.url && !pushDatas.foreground){
			app.appUrl = pushDatas.payload.url;
			app.launch(app.appUrl);				
		}
        if(ua.iOS() && pushDatas.url){
            app.appUrl = pushDatas.url;
            app.launch(app.appUrl);
        }
    },
    sendBackToStargate:function(exec, originalMsgId, success, cbParams, keepBusy){
        /*
          Send back message to Stargate
        * @param {String} exec <action>  where action can be 'stargate.facebookLogin' for example
        * @param {String} originalMsgId
        * @param {boolean} success
        * @param {object} cbParams : an object with callback parameters
        * */
        var pm = {};
        pm.exec = exec;
        pm.originalMsgId = originalMsgId;
        pm.success = success;
        pm.callbackParams = cbParams;
        pm.timestamp = Date.now();
        
        var md = forge.md.sha1.create();
        md.update(pm.originalMsgId + pm.exec + pm.timestamp + (pm.success ? 'OK' : 'KO'), 'utf8');
        pm.signature = ''; //app.crypter.sign(md);

        //Send back but first append the signature ArrayBuffer
        app.iframe.contentWindow.postMessage(JSON.stringify(pm), '*');
		if(!keepBusy) app.setBusy(false);
    }
};
