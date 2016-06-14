/**
 * EventBus module
 * @module src/modules/EventBus
 * @type {Object}
 */
/* globals ActiveXObject */
(function(_modules){

	"use strict";
	/**
	 * @class 
	 * */
	function EventBus(){
		this.events = {};
	}

	/**
	 * on function
	 * @param {String} eventType - if not exists it defines a new one
	 * @param {Function} func - the function to call when the event is triggered
	 */
	EventBus.prototype.on = function(eventType, func){
		if(!this.events[eventType]){ this.events[eventType] = [];}
		this.events[eventType].push(func);
	};

	/**
	 * trigger function
	 * @param {String} eventType - the eventType to trigger. if not exists nothing happens
	 * @param {Object} data - the object data to pass to the callback functions
	 */
	EventBus.prototype.trigger = function(eventType, data){
		if(!this.events[eventType] || this.events[eventType] < 1){ return; }
		
		this.events[eventType].map(function(func){
			func.call(null, data || {});
		});
	};

	/**
	 * remove function
	 * @param {String} eventType - the eventType
	 * @param {Function} func - the reference of the function to remove from the list of function
	 */
	EventBus.prototype.remove = function(eventType, func){
		if(!this.events[eventType]){ return; }

		var index = this.events[eventType].indexOf(func);
		if(index > -1){
			this.events[eventType].splice(index, 1);
		}
	};

	_modules.EventBus = EventBus;

})(stargateModules);