// test


var test = (function(w, s){

	var t = {};

	_onInitDone = function() {
		_hideInitButton();
		_toggleReceived();
	};
	_hideInitButton = function() {
		document.getElementById('init').setAttribute('style', 'display:none;');
		document.getElementById('initIap').setAttribute('style', 'display:none;');
		document.getElementById('initAndroidBack').setAttribute('style', 'display:none;');
	};
	_toggleReceived = function() {
		var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
	};

	_init = function() {
		document.getElementById('initDelta').addEventListener("click",function(){
			t.initStargate();
		},false);
		document.getElementById('initIap').addEventListener("click",function(){
			console.error("TODO");
		},false);
		document.getElementById('initAndroidBack').addEventListener("click",function(){
			console.error("TODO");
		},false);
		
	};

	t.initStargate = function() {
		console.error("TODO");
	};

	t.testInit = function() {
		
		
	};

	

	document.addEventListener("DOMContentLoaded", function(event) {
		_init();
	});
	

	return t;

})(window, Stargate);
