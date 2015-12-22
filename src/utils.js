

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

