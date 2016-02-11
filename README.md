[![Travis](http://img.shields.io/travis/BuongiornoMIP/StargateJsApps.svg?branch=master&style=flat)](https://travis-ci.org/BuongiornoMIP/StargateJsApps)

[![Coverage Status](https://coveralls.io/repos/BuongiornoMIP/StargateJsApps/badge.svg?branch=master&service=github)](https://coveralls.io/github/BuongiornoMIP/StargateJsApps?branch=master)


# StargateJsApps

StargateJS hybridization library for HTML5 apps

# Introduction

StargateJsApps is an hybridization library for hosted apps built around ManifoldJS approach to hybrid application.

Hosted apps are hybrid application that have their files served remotely by a web server and that are described by a manifest (W3C specification)

ManifoldJS is Cordova plugin developed by Microsoft that inject all Cordova dependency after the page is loaded, decoupling the native platform implementation with the web app.

StargateJsApps take advantage of the manifest to store it's configuration, like features to enable or remote api information.

# Installation

### manual
use stargate.js or stargate.min.js in dist/ folder

### bower

Install stargate bower package and save to dependencies (not dev dependencies):


    $ bower install -S https://github.com/BuongiornoMIP/StargateJsApps.git#~v0.1.4


# API Reference

## Stargate.initialize(configurations, callback)
    
Initialization of Stargate, you have to pass a configuration object and a callback that will be called when initialization has been finished.

Return a promise fulfilled when initialization has been finished.

If initialize has already been called then it will log a warning and will just execute the callback and return a promise that will be immediately fullfilled.

If initialize is called when we are outside hybrid environment (see [Stargate.isHybrid](#stargateishybrid)) then it will just execute the callback and return a promise that will be immediately fullfilled.

The callback is called with a boolean result indicating if we are inside hybrid environment or not (see [Stargate.isHybrid](#stargateishybrid)). Also the promise is fullfilled with the same boolean result.

### Configurations parameter

It's a javascript object with configurations.

Option|Submodule|Description|Default
--- | --- | --- | ---
*country* | MFP | MFP api configuration | `undefined`
*hybrid_conf* | - | Additional configuration object| `{}`

#### hybrid_conf configuration object

Option|Description|Default
--- | --- | ---
*IAP* | IAP configuration object | `undefined`

#### hybrid_conf IAP configuration configuration object

Option|Description|Example
--- | --- | ---
*id* | Product id as registred on store | `"stargate.test.spec.subscription"`
*alias* | Product alias | `"Stargate Test Subscription"`
*type* | Type of product; it can be: FREE_SUBSCRIPTION, PAID_SUBSCRIPTION, CONSUMABLE, NON_CONSUMABLE | `"PAID_SUBSCRIPTION"`
*verbosity* | It can be: DEBUG, INFO, WARNING, ERROR, QUIET | `"DEBUG"`



### Example Usage
```javascript

var configurations = {
    country: "xx",
    hybrid_conf: {
        "IAP": {
            "id": "stargate.test.spec.subscription",
            "alias": "Stargate Test Subscription",
            "type": "PAID_SUBSCRIPTION",
            "verbosity": "DEBUG"
        }
    }
};

// hybrid_conf inside configurations can also be uri encoded
//  if you need to save it in a configuration file for example
var hybrid_conf_uriencoded = encodeURIComponent(JSON.stringify({"example": "conf"}));


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

Please call this before [Stargate.initialize](#stargateinitialize), so it can track events logged on initialize too, like MFP.


## Stargate.checkConnection(callbackSuccess, callbackError)

Call callbackSuccess with an object with the network type like this:
{'networkState': networkState}
networkState got from navigator.connection.type of cordova-plugin-network-information plugin

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

## Stargate.facebookShare(url, callbackSuccess, callbackError)

Facebook sharing

Parameter string url: shared url

## Stargate.inAppPurchaseSubscription(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

IAP subscription
    
    

## Stargate.inAppRestore(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

IAP restore


## Stargate.getVersion()

return current Stargate version

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
4. git commit -m "New revision x.x.x" dist/
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