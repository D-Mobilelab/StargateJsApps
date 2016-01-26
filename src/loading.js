/*  */

var stargateLoader = (function(){

var loaderCss = 
"#holdon-overlay {\n"+
"    filter: alpha(opacity=80);\n"+
"    position:fixed; \n"+
"    width:100%; \n"+
"    height:100%;\n"+
"    left: 0;\n"+
"    top: 0;\n"+
"    bottom: 0;\n"+
"    right: 0;\n"+
"    background: #000;\n"+
"    opacity: 0;\n"+
"    z-index: 9999;\n"+
"    transition: opacity 300ms linear;\n"+
"    -moz-transition: opacity 300ms linear;\n"+
"    -webkit-transition: opacity 300ms linear;\n"+
"}\n"+

"#holdon-overlay.show {\n"+
"  opacity: 0.8;\n"+
"}\n"+

"#holdon-content-container{\n"+
"    width: 100%;\n"+
"    padding: 0;\n"+
"    vertical-align: middle;\n"+
"    display: table-cell !important;\n"+
"    margin: 0;\n"+
"    text-align: center;\n"+
"}\n"+

"#holdon-content {\n"+
"    text-align: center;\n"+
"    width: 50px;\n"+
"    height: 57px;\n"+
"    position: absolute;\n"+
"    top: 50%;\n"+
"    left: 50%;\n"+
"    margin: -28px 0 0 -25px;\n"+
"}\n"+

"#holdon-message {\n"+
"    width:100%;\n"+
"    text-align: center;\n"+
"    position: absolute;\n"+
"    top: 55%;\n"+
"    color:white;\n"+
"}\n"+


".sk-rect {\n"+
"  width: 50px;\n"+
"  height: 40px;\n"+
"  text-align: center;\n"+
"  font-size: 10px;\n"+
"}\n"+

".sk-rect > div {\n"+
"  background-color: #333;\n"+
"  height: 100%;\n"+
"  width: 6px;\n"+
"  display: inline-block;\n"+
"  -webkit-animation: sk-rect-anim 1.2s infinite ease-in-out;\n"+
"  animation: sk-rect-anim 1.2s infinite ease-in-out;\n"+
"}\n"+

".sk-rect .rect2 {\n"+
"  -webkit-animation-delay: -1.1s;\n"+
"  animation-delay: -1.1s;\n"+
"}\n"+

".sk-rect .rect3 {\n"+
"  -webkit-animation-delay: -1.0s;\n"+
"  animation-delay: -1.0s;\n"+
"}\n"+

".sk-rect .rect4 {\n"+
"  -webkit-animation-delay: -0.9s;\n"+
"  animation-delay: -0.9s;\n"+
"}\n"+

".sk-rect .rect5 {\n"+
"  -webkit-animation-delay: -0.8s;\n"+
"  animation-delay: -0.8s;\n"+
"}\n"+

"@-webkit-keyframes sk-rect-anim {\n"+
"  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }  \n"+
"  20% { -webkit-transform: scaleY(1.0) }\n"+
"}\n"+

"@keyframes sk-rect-anim {\n"+
"  0%, 40%, 100% { \n"+
"    transform: scaleY(0.4);\n"+
"    -webkit-transform: scaleY(0.4);\n"+
"  }  20% { \n"+
"    transform: scaleY(1.0);\n"+
"    -webkit-transform: scaleY(1.0);\n"+
"  }\n"+
"}\n"+





".sk-cube {\n"+
"  width: 50px;\n"+
"  height: 40px;\n"+
"  text-align: center;\n"+
"  font-size: 10px;\n"+
"}\n"+

".sk-cube1, .sk-cube2 {\n"+
"  background-color: #333;\n"+
"  width: 15px;\n"+
"  height: 15px;\n"+
"  position: absolute;\n"+
"  top: 0;\n"+
"  left: 0;\n"+
"  \n"+
"  -webkit-animation: sk-cube 1.8s infinite ease-in-out;\n"+
"  animation: sk-cube 1.8s infinite ease-in-out;\n"+
"}\n"+

".sk-cube2 {\n"+
"  -webkit-animation-delay: -0.9s;\n"+
"  animation-delay: -0.9s;\n"+
"}\n"+

"@-webkit-keyframes sk-cube {\n"+
"  25% { -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5) }\n"+
"  50% { -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg) }\n"+
"  75% { -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5) }\n"+
"  100% { -webkit-transform: rotate(-360deg) }\n"+
"}\n"+

"@keyframes sk-cube {\n"+
"  25% { \n"+
"    transform: translateX(42px) rotate(-90deg) scale(0.5);\n"+
"    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);\n"+
"  } 50% { \n"+
"    transform: translateX(42px) translateY(42px) rotate(-179deg);\n"+
"    -webkit-transform: translateX(42px) translateY(42px) rotate(-179deg);\n"+
"  } 50.1% { \n"+
"    transform: translateX(42px) translateY(42px) rotate(-180deg);\n"+
"    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);\n"+
"  } 75% { \n"+
"    transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);\n"+
"    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);\n"+
"  } 100% { \n"+
"    transform: rotate(-360deg);\n"+
"    -webkit-transform: rotate(-360deg);\n"+
"  }\n"+
"}\n"+
".sk-dot {\n"+
"    width: 50px;\n"+
"    height: 40px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+

"    -webkit-animation: sk-dot-rotate 2.0s infinite linear;\n"+
"    animation: sk-dot-rotate 2.0s infinite linear;\n"+
"}\n"+
".sk-dot1, .sk-dot2 {\n"+
"  width: 60%;\n"+
"  height: 60%;\n"+
"  display: inline-block;\n"+
"  position: absolute;\n"+
"  top: 0;\n"+
"  background-color: #333;\n"+
"  border-radius: 100%;\n"+
"  \n"+
"  -webkit-animation: sk-dot-bounce 2.0s infinite ease-in-out;\n"+
"  animation: sk-dot-bounce 2.0s infinite ease-in-out;\n"+
"}\n"+

".sk-dot2 {\n"+
"  top: auto;\n"+
"  bottom: 0;\n"+
"  -webkit-animation-delay: -1.0s;\n"+
"  animation-delay: -1.0s;\n"+
"}\n"+

"@-webkit-keyframes sk-dot-rotate { 100% { -webkit-transform: rotate(360deg) }}\n"+
"@keyframes sk-dot-rotate { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg) }}\n"+

"@-webkit-keyframes sk-dot-bounce {\n"+
"  0%, 100% { -webkit-transform: scale(0.0) }\n"+
"  50% { -webkit-transform: scale(1.0) }\n"+
"}\n"+

"@keyframes sk-dot-bounce {\n"+
"  0%, 100% { \n"+
"    transform: scale(0.0);\n"+
"    -webkit-transform: scale(0.0);\n"+
"  } 50% { \n"+
"    transform: scale(1.0);\n"+
"    -webkit-transform: scale(1.0);\n"+
"  }\n"+
"}\n"+



".sk-bounce {\n"+
"    width: 60px;\n"+
"    height: 40px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+
"}\n"+

".sk-bounce > div {\n"+
"  width: 18px;\n"+
"  height: 18px;\n"+
"  background-color: #333;\n"+

"  border-radius: 100%;\n"+
"  display: inline-block;\n"+
"  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n"+
"  animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n"+
"}\n"+

".sk-bounce .bounce1 {\n"+
"    -webkit-animation-delay: -0.32s;\n"+
"    animation-delay: -0.32s;\n"+
"}\n"+

".sk-bounce .bounce2 {\n"+
"  -webkit-animation-delay: -0.16s;\n"+
"  animation-delay: -0.16s;\n"+
"}\n"+

"@-webkit-keyframes sk-bouncedelay {\n"+
"  0%, 80%, 100% { -webkit-transform: scale(0) }\n"+
"  40% { -webkit-transform: scale(1.0) }\n"+
"}\n"+

"@keyframes sk-bouncedelay {\n"+
"  0%, 80%, 100% { \n"+
"    -webkit-transform: scale(0);\n"+
"    transform: scale(0);\n"+
"  } 40% { \n"+
"    -webkit-transform: scale(1.0);\n"+
"    transform: scale(1.0);\n"+
"  }\n"+
"}\n"+




".sk-circle {\n"+
"    width: 60px;\n"+
"    height: 40px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+
"}\n"+
".sk-circle .sk-child {\n"+
"  width: 100%;\n"+
"  height: 100%;\n"+
"  position: absolute;\n"+
"  left: 0;\n"+
"  top: 0;\n"+
"}\n"+
".sk-circle .sk-child:before {\n"+
"  content: '';\n"+
"  display: block;\n"+
"  margin: 0 auto;\n"+
"  width: 15%;\n"+
"  height: 15%;\n"+
"  background-color: #333;\n"+
"  border-radius: 100%;\n"+
"  -webkit-animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;\n"+
"          animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;\n"+
"}\n"+
".sk-circle .sk-circle2 {\n"+
"  -webkit-transform: rotate(30deg);\n"+
"      -ms-transform: rotate(30deg);\n"+
"          transform: rotate(30deg); }\n"+
".sk-circle .sk-circle3 {\n"+
"  -webkit-transform: rotate(60deg);\n"+
"      -ms-transform: rotate(60deg);\n"+
"          transform: rotate(60deg); }\n"+
".sk-circle .sk-circle4 {\n"+
"  -webkit-transform: rotate(90deg);\n"+
"      -ms-transform: rotate(90deg);\n"+
"          transform: rotate(90deg); }\n"+
".sk-circle .sk-circle5 {\n"+
"  -webkit-transform: rotate(120deg);\n"+
"      -ms-transform: rotate(120deg);\n"+
"          transform: rotate(120deg); }\n"+
".sk-circle .sk-circle6 {\n"+
"  -webkit-transform: rotate(150deg);\n"+
"      -ms-transform: rotate(150deg);\n"+
"          transform: rotate(150deg); }\n"+
".sk-circle .sk-circle7 {\n"+
"  -webkit-transform: rotate(180deg);\n"+
"      -ms-transform: rotate(180deg);\n"+
"          transform: rotate(180deg); }\n"+
".sk-circle .sk-circle8 {\n"+
"  -webkit-transform: rotate(210deg);\n"+
"      -ms-transform: rotate(210deg);\n"+
"          transform: rotate(210deg); }\n"+
".sk-circle .sk-circle9 {\n"+
"  -webkit-transform: rotate(240deg);\n"+
"      -ms-transform: rotate(240deg);\n"+
"          transform: rotate(240deg); }\n"+
".sk-circle .sk-circle10 {\n"+
"  -webkit-transform: rotate(270deg);\n"+
"      -ms-transform: rotate(270deg);\n"+
"          transform: rotate(270deg); }\n"+
".sk-circle .sk-circle11 {\n"+
"  -webkit-transform: rotate(300deg);\n"+
"      -ms-transform: rotate(300deg);\n"+
"          transform: rotate(300deg); }\n"+
".sk-circle .sk-circle12 {\n"+
"  -webkit-transform: rotate(330deg);\n"+
"      -ms-transform: rotate(330deg);\n"+
"          transform: rotate(330deg); }\n"+
".sk-circle .sk-circle2:before {\n"+
"  -webkit-animation-delay: -1.1s;\n"+
"          animation-delay: -1.1s; }\n"+
".sk-circle .sk-circle3:before {\n"+
"  -webkit-animation-delay: -1s;\n"+
"          animation-delay: -1s; }\n"+
".sk-circle .sk-circle4:before {\n"+
"  -webkit-animation-delay: -0.9s;\n"+
"          animation-delay: -0.9s; }\n"+
".sk-circle .sk-circle5:before {\n"+
"  -webkit-animation-delay: -0.8s;\n"+
"          animation-delay: -0.8s; }\n"+
".sk-circle .sk-circle6:before {\n"+
"  -webkit-animation-delay: -0.7s;\n"+
"          animation-delay: -0.7s; }\n"+
".sk-circle .sk-circle7:before {\n"+
"  -webkit-animation-delay: -0.6s;\n"+
"          animation-delay: -0.6s; }\n"+
".sk-circle .sk-circle8:before {\n"+
"  -webkit-animation-delay: -0.5s;\n"+
"          animation-delay: -0.5s; }\n"+
".sk-circle .sk-circle9:before {\n"+
"  -webkit-animation-delay: -0.4s;\n"+
"          animation-delay: -0.4s; }\n"+
".sk-circle .sk-circle10:before {\n"+
"  -webkit-animation-delay: -0.3s;\n"+
"          animation-delay: -0.3s; }\n"+
".sk-circle .sk-circle11:before {\n"+
"  -webkit-animation-delay: -0.2s;\n"+
"          animation-delay: -0.2s; }\n"+
".sk-circle .sk-circle12:before {\n"+
"  -webkit-animation-delay: -0.1s;\n"+
"          animation-delay: -0.1s; }\n"+

"@-webkit-keyframes sk-circleBounceDelay {\n"+
"  0%, 80%, 100% {\n"+
"    -webkit-transform: scale(0);\n"+
"            transform: scale(0);\n"+
"  } 40% {\n"+
"    -webkit-transform: scale(1);\n"+
"            transform: scale(1);\n"+
"  }\n"+
"}\n"+

"@keyframes sk-circleBounceDelay {\n"+
"  0%, 80%, 100% {\n"+
"    -webkit-transform: scale(0);\n"+
"            transform: scale(0);\n"+
"  } 40% {\n"+
"    -webkit-transform: scale(1);\n"+
"            transform: scale(1);\n"+
"  }\n"+
"}\n"+




".sk-cube-grid {\n"+
"    width: 60px;\n"+
"    height: 60px;\n"+
"    text-align: center;\n"+
"    font-size: 10px;\n"+
"}\n"+

".sk-cube-grid .sk-cube-child {\n"+
"  width: 33%;\n"+
"  height: 33%;\n"+
"  background-color: #333;\n"+
"  float: left;\n"+
"  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;\n"+
"          animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out; \n"+
"}\n"+
".sk-cube-grid .sk-cube-grid1 {\n"+
"  -webkit-animation-delay: 0.2s;\n"+
"          animation-delay: 0.2s; }\n"+
".sk-cube-grid .sk-cube-grid2 {\n"+
"  -webkit-animation-delay: 0.3s;\n"+
"          animation-delay: 0.3s; }\n"+
".sk-cube-grid .sk-cube-grid3 {\n"+
"  -webkit-animation-delay: 0.4s;\n"+
"          animation-delay: 0.4s; }\n"+
".sk-cube-grid .sk-cube-grid4 {\n"+
"  -webkit-animation-delay: 0.1s;\n"+
"          animation-delay: 0.1s; }\n"+
".sk-cube-grid .sk-cube-grid5 {\n"+
"  -webkit-animation-delay: 0.2s;\n"+
"          animation-delay: 0.2s; }\n"+
".sk-cube-grid .sk-cube-grid6 {\n"+
"  -webkit-animation-delay: 0.3s;\n"+
"          animation-delay: 0.3s; }\n"+
".sk-cube-grid .sk-cube-grid7 {\n"+
"  -webkit-animation-delay: 0s;\n"+
"          animation-delay: 0s; }\n"+
".sk-cube-grid .sk-cube-grid8 {\n"+
"  -webkit-animation-delay: 0.1s;\n"+
"          animation-delay: 0.1s; }\n"+
".sk-cube-grid .sk-cube-grid9 {\n"+
"  -webkit-animation-delay: 0.2s;\n"+
"          animation-delay: 0.2s; }\n"+

"@-webkit-keyframes sk-cubeGridScaleDelay {\n"+
"  0%, 70%, 100% {\n"+
"    -webkit-transform: scale3D(1, 1, 1);\n"+
"            transform: scale3D(1, 1, 1);\n"+
"  } 35% {\n"+
"    -webkit-transform: scale3D(0, 0, 1);\n"+
"            transform: scale3D(0, 0, 1); \n"+
"  }\n"+
"}\n"+

"@keyframes sk-cubeGridScaleDelay {\n"+
"  0%, 70%, 100% {\n"+
"    -webkit-transform: scale3D(1, 1, 1);\n"+
"            transform: scale3D(1, 1, 1);\n"+
"  } 35% {\n"+
"    -webkit-transform: scale3D(0, 0, 1);\n"+
"            transform: scale3D(0, 0, 1);\n"+
"  } \n"+
"}\n"+


".sk-folding-cube {\n"+
"  margin: 20px auto;\n"+
"  width: 40px;\n"+
"  height: 40px;\n"+
"  position: relative;\n"+
"  -webkit-transform: rotateZ(45deg);\n"+
"          transform: rotateZ(45deg);\n"+
"}\n"+

".sk-folding-cube .sk-cube-parent {\n"+
"  float: left;\n"+
"  width: 50%;\n"+
"  height: 50%;\n"+
"  position: relative;\n"+
"  -webkit-transform: scale(1.1);\n"+
"      -ms-transform: scale(1.1);\n"+
"          transform: scale(1.1); \n"+
"}\n"+
".sk-folding-cube .sk-cube-parent:before {\n"+
"  content: '';\n"+
"  position: absolute;\n"+
"  top: 0;\n"+
"  left: 0;\n"+
"  width: 100%;\n"+
"  height: 100%;\n"+
"  background-color: #333;\n"+
"  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;\n"+
"          animation: sk-foldCubeAngle 2.4s infinite linear both;\n"+
"  -webkit-transform-origin: 100% 100%;\n"+
"      -ms-transform-origin: 100% 100%;\n"+
"          transform-origin: 100% 100%;\n"+
"}\n"+
".sk-folding-cube .sk-cubechild2 {\n"+
"  -webkit-transform: scale(1.1) rotateZ(90deg);\n"+
"          transform: scale(1.1) rotateZ(90deg);\n"+
"}\n"+
".sk-folding-cube .sk-cubechild3 {\n"+
"  -webkit-transform: scale(1.1) rotateZ(180deg);\n"+
"          transform: scale(1.1) rotateZ(180deg);\n"+
"}\n"+
".sk-folding-cube .sk-cubechild4 {\n"+
"  -webkit-transform: scale(1.1) rotateZ(270deg);\n"+
"          transform: scale(1.1) rotateZ(270deg);\n"+
"}\n"+
".sk-folding-cube .sk-cubechild2:before {\n"+
"  -webkit-animation-delay: 0.3s;\n"+
"          animation-delay: 0.3s;\n"+
"}\n"+
".sk-folding-cube .sk-cubechild3:before {\n"+
"  -webkit-animation-delay: 0.6s;\n"+
"          animation-delay: 0.6s; \n"+
"}\n"+
".sk-folding-cube .sk-cubechild4:before {\n"+
"  -webkit-animation-delay: 0.9s;\n"+
"          animation-delay: 0.9s;\n"+
"}\n"+
"@-webkit-keyframes sk-foldCubeAngle {\n"+
"  0%, 10% {\n"+
"    -webkit-transform: perspective(140px) rotateX(-180deg);\n"+
"            transform: perspective(140px) rotateX(-180deg);\n"+
"    opacity: 0; \n"+
"  } 25%, 75% {\n"+
"    -webkit-transform: perspective(140px) rotateX(0deg);\n"+
"            transform: perspective(140px) rotateX(0deg);\n"+
"    opacity: 1; \n"+
"  } 90%, 100% {\n"+
"    -webkit-transform: perspective(140px) rotateY(180deg);\n"+
"            transform: perspective(140px) rotateY(180deg);\n"+
"    opacity: 0; \n"+
"  } \n"+
"}\n"+

"@keyframes sk-foldCubeAngle {\n"+
"  0%, 10% {\n"+
"    -webkit-transform: perspective(140px) rotateX(-180deg);\n"+
"            transform: perspective(140px) rotateX(-180deg);\n"+
"    opacity: 0; \n"+
"  } 25%, 75% {\n"+
"    -webkit-transform: perspective(140px) rotateX(0deg);\n"+
"            transform: perspective(140px) rotateX(0deg);\n"+
"    opacity: 1; \n"+
"  } 90%, 100% {\n"+
"    -webkit-transform: perspective(140px) rotateY(180deg);\n"+
"            transform: perspective(140px) rotateY(180deg);\n"+
"    opacity: 0; \n"+
"  }\n"+
"}\n";


	function addcss(css){
		var head = document.getElementsByTagName('head')[0];
		var s = document.createElement('style');
		s.setAttribute('type', 'text/css');
		if (s.styleSheet) {   // IE
			s.styleSheet.cssText = css;
		} else {                // the world
			s.appendChild(document.createTextNode(css));
		}
		head.appendChild(s);
	}

	var cssAdded = false;


	var createElement = function(html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		//var elements = div.childNodes;
		//var element = div.firstChild
		return div.firstChild;
	};

    
	var sgl = {};
    
    sgl.start = function(properties){

    	if (!cssAdded) {
			addcss(loaderCss);
			cssAdded = true;
		}

    	var oldOverlay = document.querySelector('#holdon-overlay');
    	if (oldOverlay) {
    		oldOverlay.parentNode.removeChild(oldOverlay);
    		oldOverlay = null;
    	}

        var theme = "sk-rect";
        var content = "";
        var message = "";
        
        if(properties){
            if(properties.hasOwnProperty("theme")){//Choose theme if given
                theme = properties.theme;
            }
            
            if(properties.hasOwnProperty("message")){//Choose theme if given
                message = properties.message;
            }
        }
        
        switch(theme){
            case "custom":
                content = '<div style="text-align: center;">' + properties.content + "</div>";
            break;
            case "sk-dot":
                content = '<div class="sk-dot"> <div class="sk-dot1"></div> <div class="sk-dot2"></div> </div>';
            break;
            case "sk-rect":
                content = '<div class="sk-rect"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>';
            break;
            case "sk-cube":
                content = '<div class="sk-cube"> <div class="sk-cube1"></div> <div class="sk-cube2"></div> </div>';
            break;
            case "sk-bounce":
                content = '<div class="sk-bounce"> <div class="bounce1"></div> <div class="bounce2"></div> <div class="bounce3"></div> </div>';
            break;
            case "sk-circle":
                content = '<div class="sk-circle"> <div class="sk-circle1 sk-child"></div> <div class="sk-circle2 sk-child"></div> <div class="sk-circle3 sk-child"></div> <div class="sk-circle4 sk-child"></div> <div class="sk-circle5 sk-child"></div> <div class="sk-circle6 sk-child"></div> <div class="sk-circle7 sk-child"></div> <div class="sk-circle8 sk-child"></div> <div class="sk-circle9 sk-child"></div> <div class="sk-circle10 sk-child"></div> <div class="sk-circle11 sk-child"></div> <div class="sk-circle12 sk-child"></div> </div>';
            break;
            case "sk-cube-grid":
                content = '<div class="sk-cube-grid"> <div class="sk-cube-child sk-cube-grid1"></div> <div class="sk-cube-child sk-cube-grid2"></div> <div class="sk-cube-child sk-cube-grid3"></div> <div class="sk-cube-child sk-cube-grid4"></div> <div class="sk-cube-child sk-cube-grid5"></div> <div class="sk-cube-child sk-cube-grid6"></div> <div class="sk-cube-child sk-cube-grid7"></div> <div class="sk-cube-child sk-cube-grid8"></div> <div class="sk-cube-child sk-cube-grid9"></div> </div>';
            break;
            case "sk-folding-cube":
                content = '<div class="sk-folding-cube"> <div class="sk-cubechild1 sk-cube-parent"></div> <div class="sk-cubechild2 sk-cube-parent"></div> <div class="sk-cubechild4 sk-cube-parent"></div> <div class="sk-cubechild3 sk-cube-parent"></div> </div>';
            break;
            default:
                content = '<div class="sk-rect"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>';
                err("[loading] " + theme + " doesn't exist");
            break;
        }
        
        var HolderHtml = '<div id="holdon-overlay">\n'+
                         '   <div id="holdon-content-container">\n'+
                         '       <div id="holdon-content">'+content+'</div>\n'+
                         '       <div id="holdon-message">'+message+'</div>\n'+
                         '   </div>\n'+
                         '</div>';
        
        var body = document.getElementsByTagName('body')[0];
        var holderElement = createElement(HolderHtml);

        if(properties){
            if(properties.backgroundColor){
            	holderElement.style.backgroundColor = properties.backgroundColor;
            	holderElement.querySelector('#holdon-message').style.color = properties.textColor;
            }
        }

        body.appendChild(holderElement);
        
        holderElement = null;

        // fade in
        setTimeout(
	        function() {
	        	// remove
				var ho = document.getElementById('holdon-overlay');
				ho.classList.add('show');
	        },
	        1
	    );
        
        
    };
    
    sgl.stop = function(){
    	var holdonOverlay = document.querySelector('#holdon-overlay');
    	if (holdonOverlay) {

        	holdonOverlay.classList.remove('show');

    		setTimeout(
		        function() {
		        	// remove
    				holdonOverlay.parentNode.removeChild(holdonOverlay);
    				holdonOverlay = null;
		        },
		        500
		    );
    	}
    };

	return sgl;

})();





var startLoading = function(properties) {
	if (typeof properties !== 'object') {
		properties = {};
	}
	if (! properties.theme) {
		properties.theme = 'sk-circle';
	}
	stargateLoader.start(properties);
};

var stopLoading = function() {
	stargateLoader.stop();
};

var changeLoadingMessage = function(newMessage) {
	var hom = document.querySelector('#holdon-message');
	if (hom) {
		hom.textContent = newMessage;
		return true;
	}
	return false;
};


// ----- FIXME ---- only for testing purposes ----
if (typeof stargatePublic.test !== 'object') {
	stargatePublic.test = {};
}
if (typeof stargatePublic.test.loading !== 'object') {
	stargatePublic.test.loading = {};
}

stargatePublic.test.loading.start = startLoading;
stargatePublic.test.loading.stop = stopLoading;
stargatePublic.test.loading.change = changeLoadingMessage;
// ------------------------------------------------




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
