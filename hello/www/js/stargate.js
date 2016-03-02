(function(root){

    root.Stargate = function(a){
        console.log("hi there, i'm Stargate");
        document.addEventListener("deviceready",function ready(ready){
            console.log("Stargate ready", ready);
            if(root.StatusBar) root.StatusBar.hide();
        });

        document.addEventListener("backbutton", function(){
            var exit = confirm("do you really want to exit?");
            if(exit){
                window.history.back();
            }
        });

    };
    root.Stargate();
})(window);

