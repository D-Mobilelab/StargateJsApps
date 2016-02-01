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

    $ bower install https://github.com/BuongiornoMIP/StargateJsApps.git#~v0.1.4

==FIXME: in current builded package we have to remove bower dependencies that are included inside the main file.==

# Public interface

* Stargate.initialize(configurations, null, null, callback)
    
    Initialization of Stargate, you have to pass a configuration object and a callback that will be called when initialization is finished. Second and third are legacy and deprecated.
    ==FIXME: move callback to second parameter and work with both signature== 
    
    Return a promise fulfilled when initialization done.

* Stargate.isInitialized()
    
    get initialization status: true when initialization is already called
    
    Return boolean

* Stargate.isOpen()
    
    get initialization status: true when initialization is done

    Return boolean
* Stargate.openUrl(url)
    
    Open external url with InApp Browser

* Stargate.checkConnection(callbackSuccess, callbackError)

    Call callbackSuccess with an object with the network type like this:
    {'networkState': networkState}
    networkState got from navigator.connection.type of cordova-plugin-network-information plugin

* Stargate.getDeviceID(callbackSuccess, callbackError)
    
    Call callbackSuccess with an object with the device id like this:
    {'deviceID': deviceID}
    deviceID got from uuid of device plugin

* Stargate.setStatusbarVisibility(visibility, callbackSuccess, callbackError)

    Show/hide device status bar
    
    Parameter boolean visibility

* Stargate.facebookLogin(scope, callbackSuccess, callbackError)

    Facebook connect
    
    Parameter string scope: scope list separeted with comma

* Stargate.facebookShare(url, callbackSuccess, callbackError)

    Facebook sharing
    
    Parameter string url: shared url

* Stargate.inAppPurchaseSubscription(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

    IAP subscription
    
    

* Stargate.inAppRestore(callbackSuccess, callbackError, subscriptionUrl, returnUrl)

    IAP restore


* Stargate.getVersion()

    return current Stargate version

* ~~Stargate.googleLogin(callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.initialize(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.createBanner(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.hideBanner(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.removeBanner(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.showBannerAtSelectedPosition(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.showBannerAtGivenXY(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.registerAdEvents(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.prepareInterstitial(data,callbackSuccess, callbackError)~~

    not implemented
    
* ~~Stargate.ad.showInterstitial(data,callbackSuccess, callbackError)~~

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