/* global ProgressIndicator */

function startLoading(){
    ProgressIndicator.showSimple(true);
}
function stopLoading(){
    ProgressIndicator.hide();
}
function timeoutLoading(t){
    startLoading();
    setTimeout(function(){stopLoading();}, t);
}