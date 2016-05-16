/**
 * Decoratos module
 * @module src/modules/Decorators
 * @type {Object} 
 * @requires ./Utils.js
 */
(function(_modules){
    
    /**
     * Decorator function: 
     * @private
     * @param {Boolean|Function} param - the require param or function. the function should return a boolean 
     * @param {Function} fn - the function to decorate     
     * @param {Object} [context=null] - the optional this-context. default to null
     * @param {String} [message="NoMessage"]
     * @param {String} [type="warn"]
     * @returns {Function} 
     */
    function requireCondition(param, afterFunction, context, message, type){ 
        return function(){
            if(typeof param === "function"){
                param = param.call(null);
            }
            if(param){
                return afterFunction.apply(context || null, arguments); 
            } else {
                message = message || "NoMessage";
                switch(type){
                    case "warn":
                        console.warn(message);
                        break;
                    case "error":
                        console.error(message);
                        break;
                    case "info":
                        console.info(message);
                        break;
                    default:
                        console.log(message);
                }
                
            }
        };
    }    
    
    _modules.Decorators = {
        requireCondition:requireCondition
    };
    
})(stargateModules)
