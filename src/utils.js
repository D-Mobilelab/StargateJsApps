

var ua = {
    Android: function() {
        return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function() {
        return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    Windows: function() {
        return /IEMobile/i.test(navigator.userAgent);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

// FIXME
//function reboot(){
//    window.location.href = 'index.html';
//}


var utils = {
    elementHasClass: function (element, selector) {
        var className = " " + selector + " ",
            rclass = "/[\n\t\r]/g",
            i = 0;
        if ( (" " + element.className + " ").replace(rclass, " ").indexOf(className) >= 0 ) {
            return true;
        }
        return false;
    },

    // a   url (naming it a, beacause it will be reused to store callbacks)
	// xhr placeholder to avoid using var, not to be used
	pegasus: function(a, xhr) {
	  xhr = new XMLHttpRequest();

	  // Open url
	  xhr.open('GET', a);

	  // Reuse a to store callbacks
	  a = [];

	  // onSuccess handler
	  // onError   handler
	  // cb        placeholder to avoid using var, should not be used
	  xhr.onreadystatechange = xhr.then = function(onSuccess, onError, cb) {

	    // Test if onSuccess is a function or a load event
	    if (onSuccess.call) a = [,onSuccess, onError];

	    // Test if request is complete
	    if (xhr.readyState == 4) {

	      // index will be:
	      // 0 if undefined
	      // 1 if status is between 200 and 399
	      // 2 if status is over
	      cb = a[0|xhr.status / 200];

	      // Safari doesn't support xhr.responseType = 'json'
	      // so the response is parsed
	      if (cb) {
	        try {
	          cb(JSON.parse(xhr.responseText), xhr);
	        } catch (e) {
	          cb(null, xhr);
	        }
	      }
	    }
	  };

	  // Send
	  xhr.send();

	  // Return request
	  return xhr;
	}
};



function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

