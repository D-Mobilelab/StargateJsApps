/* global ProgressIndicator */


var startLoading = function() {
    ProgressIndicator.showSimple(true);
};
var stopLoading = function() {
    ProgressIndicator.hide();
};

// - not used, enable if needed -
//var timeoutLoading = function(t) {
//    startLoading();
//    setTimeout(
//        function(){
//            stopLoading();
//        },
//        t
//    );
//};

// FIXME: used inside store.js
window.startLoading = startLoading;
window.stopLoading = stopLoading;
