"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.isConstructor=isConstructor;exports.notIsRegExp=exports.isRegExp=exports.stringToRegExp=exports.checkRegExp=exports.stringify=exports.isRequiredKey=exports.isOptionalKey=exports.optionalRegex=exports.isPrimitive=exports.parseToArray=exports.whatTypeIs=exports.isCustomValidator=exports.isFunctionHacked=exports.isFunction=exports.isClass=exports.checkConstructor=void 0;var _util=_interopRequireDefault(require("util"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}const isProxy=_util.default.types.isProxy;const checkConstructor=(type,val)=>val!==undefined&&val!==null&&val.constructor===type||Proxy===type&&isProxy(val);exports.checkConstructor=checkConstructor;const isClass=fn=>typeof fn==="function"&&/^\s*class\b/.test(fn.toString())&&!isFunctionHacked(fn);exports.isClass=isClass;const isFunction=fn=>typeof fn==="function"&&!isClass(fn)&&!isFunctionHacked(fn);exports.isFunction=isFunction;const isFunctionHacked=fn=>typeof fn==="function"&&fn.toString.toString()!=="function toString() { [native code] }";exports.isFunctionHacked=isFunctionHacked;const isCustomValidator=f=>f&&typeof f==="function"&&!isClass(f)&&(!f.name||f.name[0]===f.name[0].toLowerCase());exports.isCustomValidator=isCustomValidator;function isConstructor(f){if(!f)return false;if(f.name==="Symbol")return true;if(f.name==="BigInt")return true;if(f.name==="Promise")return true;if(f.name==="DataView")return true;if(f.name==="Proxy")return true;if(f.name==="URL")return true;if(isCustomValidator(f))return false;if(isClass(f))return true;try{new f;return true}catch(err){return false}}const whatTypeIs=type=>{if(checkConstructor(Object,type))return"schema";if(isPrimitive(type))return"primitive";if(isCustomValidator(type))return"function";if(Array.isArray(type))return"enum";if(checkConstructor(RegExp,type))return"regex";return"constructor"};exports.whatTypeIs=whatTypeIs;const parseToArray=itemOrArray=>{if(Array.isArray(itemOrArray)){return itemOrArray}else{return[itemOrArray]}};exports.parseToArray=parseToArray;const isPrimitive=value=>Object(value)!==value||value.constructor===Number||value.constructor===String;exports.isPrimitive=isPrimitive;const parser=()=>{const seen=new WeakMap;return(key,value)=>{if(typeof value==="object"&&value!==null){if(seen.has(value)){const oldKey=seen.get(value);return`[circular reference] -> ${oldKey||"rootObject"}`}seen.set(value,key)}if(typeof value==="function"&&isConstructor(value)){return value.name}if(typeof value==="function"){return value.toString()}if(checkConstructor(RegExp,value)){return value.toString()}return value}};const optionalRegex=/[?$]$/;exports.optionalRegex=optionalRegex;const isOptionalKey=(key="")=>optionalRegex.test(key);exports.isOptionalKey=isOptionalKey;const isRequiredKey=key=>notIsRegExp(key)&&!isOptionalKey(key);exports.isRequiredKey=isRequiredKey;const stringify=val=>JSON.stringify(val,parser());exports.stringify=stringify;const checkRegExp=(regExp,value)=>regExp.test(value);exports.checkRegExp=checkRegExp;const stringToRegExp=string=>new RegExp(eval(string));exports.stringToRegExp=stringToRegExp;const isRegExp=value=>value&&/^\/.+\/$/.test(value);exports.isRegExp=isRegExp;const notIsRegExp=value=>!isRegExp(value);exports.notIsRegExp=notIsRegExp;