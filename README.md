[![Travis](http://img.shields.io/travis/D-Mobilelab/StargateJsApps.svg?branch=master&style=flat)](https://travis-ci.org/D-Mobilelab/StargateJsApps)

[![Coverage Status](https://coveralls.io/repos/D-Mobilelab/StargateJsApps/badge.svg?branch=master&service=github)](https://coveralls.io/github/D-Mobilelab/StargateJsApps?branch=master)



# StargateJsApps

[![Join the chat at https://gitter.im/D-Mobilelab/StargateJsApps](https://badges.gitter.im/D-Mobilelab/StargateJsApps.svg)](https://gitter.im/D-Mobilelab/StargateJsApps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

StargateJS hybridization library for HTML5 apps

# Introduction

StargateJsApps is an hybridization library for hosted apps built around ManifoldJS approach to hybrid application.

Hosted apps are hybrid application that have their files served remotely by a web server and that are described by a manifest (W3C specification)

ManifoldJS is Cordova plugin developed by Microsoft that inject all Cordova dependency after the page is loaded, decoupling the native platform implementation with the web app.

StargateJsApps take advantage of the manifest to store it's configuration, like features to enable or remote api information.

[Technical Documentation: http://d-mobilelab.github.io/StargateJsApps/dist/0.3.7/](http://d-mobilelab.github.io/StargateJsApps/0.3.4/docs/)

# Installation

### manual
use stargate.js or stargate.min.js in dist/ folder

### bower

Install stargate bower package and save to dependencies (not dev dependencies):


    $ bower install -S stargatejs-apps#~v0.2.2


# API Reference

## Stargate.initialize(configurations, callback)
    
Initialization of Stargate, you have to pass a configuration object and a callback that will be called when initialization has been finished.

Return a promise fulfilled when initialization has been finished.

If initialize has already been called then it will log a warning and will just execute the callback and return a promise that will be immediately fullfilled.

If initialize is called when we are outside hybrid environment (see [Stargate.isHybrid](#stargateishybrid)) then it will just execute the callback and return a promise that will be immediately fullfilled.

The callback is called with a boolean result indicating if we are inside hybrid environment or not (see [Stargate.isHybrid](#stargateishybrid)). Also the promise is fullfilled with the same boolean result.

### Configurations parameter

It's a javascript object with configurations.

Option|Type|Description|Default
--- | --- | --- | ---
*modules* | Array of string | List of modules to initialize | `["mfp","iapbase","appsflyer","game"]`
*modules_conf* | Object | Configuration of submodule| `{}`

#### modules configuration list

Value|Description
--- | --- 
*iap* | InApp purchase module
*iapbase* | InApp purchase module without refresh on initialize
*mfp* | Mobile Fingerprint purchase module
*appsflyer* | AppsFlyer module
*game* | Offline game module

#### modules_conf configuration object

Option|Description|Default
--- | --- | ---
*iap* | InApp purchase configuration object | `undefined`
*mfp* | Mobile Fingerprint configuration object | `undefined`

#### modules_conf mfp configuration configuration object

Option|Description|Example
--- | --- | ---
*country* | Country to use for mfp | `"it"`

There are two more variable needed for Mobile FingerPrint to work and these variable are retrieved from the manifest.json inside the app:

Value|Description
--- | --- 
*namespace* | namespace
*label* | label


#### modules_conf iap or iapbase configuration configuration object

Option|Description|Example
--- | --- | ---
*id* | Product id as registred on store | `"stargate.test.spec.subscription"`
*alias* | Product alias | `"Stargate Test Subscription"`
*type* | Type of product; it can be: FREE_SUBSCRIPTION, PAID_SUBSCRIPTION, CONSUMABLE, NON_CONSUMABLE | `"PAID_SUBSCRIPTION"`



### Example Usage
```javascript

var configurations = {
    modules: ["mfp", "appsflyer", "iapbase", "game"],
    modules_conf: {
        "iap": {
            "id": "stargate.test.spec.subscription",
            "alias": "Stargate Test Subscription",
            "type": "PAID_SUBSCRIPTION"
        },
        "mfp": {
            "country": "us"
        }
    }
};

var callback = function(result) {
    console.log("Stargate initialized with result: "+result);
};

// you can use the callback ...
Stargate.initialize(configurations, callback);

// ... or the promise interface
Stargate.initialize(configurations, function(){})
    .then(function(result) {
        console.log("Stargate initialized with result: "+result);
    })
    .fail(
    function(error) {
        console.error("Stargate initialization error: ", error);
    });

```




## Stargate.isInitialized()
    
get initialization status: true when initialization is already called

Return boolean

## Stargate.isOpen()
    
get initialization status: true when initialization is done

Return boolean

## Stargate.isHybrid()
    
get hybrid container status: true when we're running inside the hybrid app

> Internally it check if there is an url query parameter called "hybrid" with value 1, or if there is a cookie or a localStorage with the same name and value. 


Return boolean

## Stargate.openUrl(url)

Open external url with InApp Browser

## Stargate.setAnalyticsCallback(callBackFunction)

Set the callback to call when an analytic event need to be sent.

Please call this before [Stargate.initialize](#stargateinitializeconfigurations-callback), so it can track events logged on initialize too, like MFP.

## Stargate.setConversionDataCallback(callBackFunction)

Set the callback to call when converion data from AppsFlyer are received.
You may need to save the data you receive, becouse you'll only got that data the first time the app is run after installation.

Please call this before [Stargate.initialize](#stargateinitializeconfigurations-callback), so it can call you during initialize too.

## Stargate.checkConnection([callbackSuccess=function(){}], [callbackError=function(){}])
### Example Usage
```javascript
var info = Stargate.checkConnection();
Stargate.checkConnection(function(info){ console.log(info.networkState, info.type); });
// info is equal to: {'networkState': "wifi|3g|4g|none", type:"online|offline"}
```
The connection info object is updated to the last connection status change 
the networkState is retrieved from navigator.connection.type of cordova-plugin-network-information plugin

## Stargate.getDeviceID(callbackSuccess, callbackError)
    
Call callbackSuccess with an object with the device id like this:
{'deviceID': deviceID}
deviceID got from uuid of device plugin

## Stargate.setStatusbarVisibility(visibility, callbackSuccess, callbackError)

Show/hide device status bar

Parameter boolean visibility

## Stargate.facebookLogin(scope, callbackSuccess, callbackError)

Facebook connect

Parameter string scope: scope list separeted with comma

## Stargate.socialShare(options)

Share an url on a social network

### Parameters

#### options object

Options key|Description|Example
--- | --- | ---
*type* | String: social network to use (chooser, facebook, twitter, whatsapp) | chooser
*url* | String: url to share | "http://www.google.com/?utm_source=stargate"

### Returns

Promise fullfilled when sharing is done

## Stargate.socialShareAvailable(options)

Return a list of social networks application installed on user device

### Parameters

#### options object

Options key|Description|Example
--- | --- | ---
*socials* | Object with socials to check if available (facebook, twitter, whatsapp) | {"facebook": true, "twitter": true, "instagram": false }
*url* | String: url to share | "http://www.google.com/?utm_source=stargate"

### Returns

Promise fullfilled with an object with social networks availablility from the ones requested with parameter "option.socials"
For example:
    {
        "facebook": true,
        "twitter": true,
        "instagram": false
    }


## Stargate.facebookShare(url, callbackSuccess, callbackError)

@deprecated since 0.5.0

Facebook sharing

Parameter string url: shared url

## Stargate.inAppPurchaseSubscription(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

IAP subscription
    
    

## Stargate.inAppRestore(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

IAP restore

## Stargate.inAppProductInfo(productId, callbackSuccess, callbackError)

IAP product information

Call callbacks with information about a product got from store

productId - product id about to query for information on store

callbackSuccess - a function that will be called when information are ready

callbackError - a function that will be called in case of error


```javascript
// example of object sent to success callback
{
    "id": "stargate.test.spec.product1",
    "alias": "Test Spec Product 1",
    "title": "Test Spec Product 1",
    "description": "Test Spec Product 1",
    "currency": "EUR",
    "price": "0,99 €",
    "type": "paid subscription",
    "canPurchase": true,
    "downloaded": false,
    "downloading": false,
    "loaded": true,
    "owned": false,
    "state": "valid",
    "transaction": null,
    "valid": true
}
```

## Stargate.getVersion()

return current Stargate version

## Stargate.getAppInformation()

return {object} with this information:

Value|Description
--- | --- 
*cordova* | Cordova version
*manufacturer* | device manufacter
*model* | device model
*platform* | platform (Android, iOs, etc)
*deviceId* | device UUID
*version* | platform version
*packageVersion* | package version
*packageName* | package name ie: com.stargatejs.test
*packageBuild* | package build number
*stargate* | stargate version
*stargateModules* | modules initialized
*stargateError* | initialization error

## ~~Stargate.googleLogin(callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.initialize(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.createBanner(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.hideBanner(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.removeBanner(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.showBannerAtSelectedPosition(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.showBannerAtGivenXY(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.registerAdEvents(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.prepareInterstitial(data,callbackSuccess, callbackError)~~

not implemented
    
## ~~Stargate.ad.showInterstitial(data,callbackSuccess, callbackError)~~

not implemented
    




# Internal design

## stargate configuration
Inside manifest there is an object that holds all configuration options of Stargate. This configuration is loaded with ManifoldJS hostedwebapp plugin.

## initialization and device ready
1. Stargate.initialize() save user configuration sent as parameter and attach to the cordova deviceready event the internal function onDeviceReady()
2. onDeviceReady() request all needed data from plugin and internal async modules; wait for all request to complete, save the data received and call onPluginReady()
3. onPluginReady() is the main internal initialization function where all syncronous processing is performed

## gulp tasks

* build
* lint
* test
* karma
* watch

## release process

1. npm test
2. change version in package.json
3. gulp build
4. git commit -m "New revision x.x.x" dist/ package.json
5. git tag -a vx.x.x -m "Added xxxx. Changed xxxx. Fixed: xxxx"
6. git push --tags

==to automate==

## travis-ci

Travis build the project on every push and check for lint and test errors. It also send the test coverage to coveralls.io


# Contribute

* git clone
* npm install
* bower install
* gulp build