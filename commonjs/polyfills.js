"use strict";if(typeof globalThis==="undefined"){let getGlobal=function(){if(typeof self!=="undefined")return self;if(typeof window!=="undefined")return window;if(typeof global!=="undefined")return global;throw new Error("unable to locate global object")};let globalThis=getGlobal();globalThis.globalThis=globalThis}if(typeof AggregateError==="undefined"){class AggregateError extends Error{constructor(errors=[],message){super(message);this.errors=errors;this.name="AggregateError"}push(err){this.errors.push(err)}}globalThis.AggregateError=AggregateError}if(!Array.prototype.flat){Array.prototype.flat=function(depth){var flattend=[];(function flat(array,depth){for(let el of array){if(Array.isArray(el)&&depth>0){flat(el,depth-1)}else{flattend.push(el)}}})(this,Math.floor(depth)||1);return flattend}}if(!Array.prototype.flatMap){Array.prototype.flatMap=function(){return Array.prototype.map.apply(this,arguments).flat(1)}}