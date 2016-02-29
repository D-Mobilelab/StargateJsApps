/**
 * Logger module
 * @module src/modules/Logger
 * @type {Object}
 */
(function(stargateModules){

    /**
     * @constructor
     * @alias module:src/modules/Logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * @param {String} tag - a tag to identify a log group. it will be prepended to any log function
     * @example
     * var myLogger = new Logger("ALL", "TAG");
     * myLogger.i("Somenthing", 1); // output will be > ["TAG"], "Somenthing", 1
     * myLogger.setLevel("off") // other values OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    function Logger(label, tag){
        this.level = Logger.levels[label.toUpperCase()];
        this.tag = tag;
    }

    //Logger.prototype.group
    //OFF < DEBUG < INFO < WARN < ERROR < ALL
    // 0  < 1  < 2 < 3 < 4 < 5
    Logger.levels = {
        ALL:5,
        ERROR:4,
        WARN:3,
        INFO:2,
        DEBUG:1,
        OFF:0
    };

    /**
     * Error Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.e = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.ERROR){
            window.console.error.apply(console, _arguments);
        }
    };

    /**
     * Info Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.i = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.WARN){
            window.console.info.apply(console, _arguments);
        }
    };

    /**
     * Warn Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.w = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.INFO){
            window.console.warn.apply(console, _arguments);
        }
    };

    /**
     * Debug Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.d = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.DEBUG){
            window.console.log.apply(console, _arguments);
        }
    };

    /**
     * Set the level of the logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    Logger.prototype.setLevel = function(label){
        this.level = Logger.levels[label];
    };


    /**
     * A module representing a Logger class
     * @exports Logger
     */
    if (stargateModules) {
        stargateModules.Logger = Logger;
    } else {
        window.Logger = Logger;
    }
})(stargateModules);