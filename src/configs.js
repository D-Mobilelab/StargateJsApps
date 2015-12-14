var CONFIGS = {

    api: {
        networkInfo: 'http://api.playme.info/xradio/network.info?apikey=%apikey%&country=it&format=json',
        dictPlayme: 'http://api.playme.info/%api_selector%/dictionary.get',
        mfpSet: '/mfpset.php?url=%url%%pony%',
        mfpGet: 'http://api.motime.com/v01/mobileFingerprint.get?apikey=%apikey%&contents_inapp=%contents_inapp%&country=%country%&expire=%expire%',
        googleToken: 'https://accounts.google.com/o/oauth2/token',
        userCreate: '%domain%/%country%/%selector%/%app_prefix%/store/usercreate/'
    },
    
    iap_android: {
        id: 'test_subscription_trial',
        alias: 'PlayMe Subscription',
        type: 'PAID_SUBSCRIPTION',
        verbosity: 'DEBUG',
        paymethod: 'gwallet'
    },
    
    iap_ios: {
        id: 'playme.subscription.monthly',
        alias: 'PlayMe Subscription',
        type: 'PAID_SUBSCRIPTION',
        verbosity: 'DEBUG',
        paymethod: 'itunes'
    }
};

CONFIGS.getText = function (str){
    console.error("CONFIGS.getText is deprecated!");
    return str;
};