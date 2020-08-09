"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"AsyncFunction",{enumerable:true,get:function(){return _constructors.AsyncFunction}});Object.defineProperty(exports,"GeneratorFunction",{enumerable:true,get:function(){return _constructors.GeneratorFunction}});exports.default=exports.isValidOrThrow=exports.isValidOrThrowAllErrors=exports.isValidOrThrowAll=exports.isValidOrLogAllErrors=exports.isValidOrLogAll=exports.hasErrors=exports.isValidOrLog=exports.isValid=exports.SerieValidationError=exports.SchemaValidationError=exports.EnumValidationError=exports.TypeValidationError=void 0;var _helpers=require("./helpers.js");var _constructors=require("./constructors.js");const formatErrorMessage=data=>{const{type,value,path,kind}=data;let typeString=(0,_helpers.stringify)(type);typeString=kind==="serie"?typeString.replace(/[\[\]]/g,""):typeString;return`${path.length?`on path /${path.join("/")} `:""}value ${(0,_helpers.stringify)(value)} do not match ${kind||(0,_helpers.whatTypeIs)(type)} ${typeString}`};const descriptor=data=>({value:data,writable:false,enumerable:false,configurable:false});class TypeValidationError extends TypeError{constructor(msg,data){super(msg);this.name="TypeValidationError";Object.defineProperty(this,"raw",descriptor(data))}}exports.TypeValidationError=TypeValidationError;class EnumValidationError extends AggregateError{constructor(errors,msg,data){super(errors,msg);this.name="EnumValidationError";Object.defineProperty(this,"raw",descriptor(data))}}exports.EnumValidationError=EnumValidationError;class SchemaValidationError extends AggregateError{constructor(errors,msg,data){super(errors,msg);this.name="SchemaValidationError";Object.defineProperty(this,"raw",descriptor(data))}}exports.SchemaValidationError=SchemaValidationError;class SerieValidationError extends AggregateError{constructor(errors,msg,data){super(errors,msg);this.name="SerieValidationError";Object.defineProperty(this,"raw",descriptor(data))}}exports.SerieValidationError=SerieValidationError;const createError=data=>{data.$Error=data.$Error||TypeValidationError;data.path=data.path||[];data.message=formatErrorMessage(data);return new data.$Error(data.message,data)};const createAggregateError=(errors,data)=>{data.$Error=data.$Error;data.path=data.path||[];data.message=formatErrorMessage(data);return new data.$Error(errors,data.message,data)};const throwError=data=>{throw createError(data)};const throwErrors=(errors,data)=>{if(errors.length===1)throw errors[0];throw createAggregateError(errors,data)};const mapError=(error,data)=>{if(!error.raw)return error;data.path=data.path||[];const overriddenPath={...error.raw,path:[...data.path,...error.raw.path],$Error:error.constructor};if(error instanceof AggregateError){const errors=error.errors.map(e=>mapError(e,data));return createAggregateError(errors,overriddenPath)}else{return createError(overriddenPath)}};const reThrowError=(error,data)=>{throw mapError(error,data)};const validOrThrow=(input,data)=>{if(input)return true;throwError(data)};const onValidDefault=()=>true;const onInvalidDefault=error=>{throw error};const validSchemaOrThrow=data=>{const{conf,type:schema,value:object,root=object,path=[]}=data;if(!(object instanceof Object||typeof object==="string")){return throwError(data)}let requiredErrors=[];const requiredKeys=Object.keys(schema).filter(_helpers.isRequiredKey);for(const keyName of requiredKeys){try{const currentPath=[...path,keyName];isValidTypeOrThrow({conf,type:schema[keyName],value:object[keyName],root,keyName,path:currentPath})}catch(error){if(!conf.collectAllErrors){throw error}requiredErrors.push(error)}}const optionalError=[];const optionalKeys=Object.keys(schema).filter(_helpers.isOptionalKey).filter(key=>!requiredKeys.includes(key.replace(_helpers.optionalRegex,"")));for(const keyName of optionalKeys){try{const keyNameStripped=keyName.replace(_helpers.optionalRegex,"");const currentPath=[...path,keyNameStripped];let type=schema[keyName];let value=object[keyNameStripped];(0,_helpers.isNullish)(value)||isValidTypeOrThrow({conf,type,value,root,keyName:keyNameStripped,path:currentPath})}catch(error){if(!conf.collectAllErrors){throw error}optionalError.push(error)}}let regexErrors=[];const regexKeys=Object.keys(schema).filter(_helpers.isRegExp);const untestedKeys=Object.keys(object).filter(key=>!requiredKeys.includes(key)).filter(key=>!optionalKeys.map(k=>k.replace(_helpers.optionalRegex,"")).includes(key));for(const regexpString of regexKeys){let keys=untestedKeys.filter(keyName=>(0,_helpers.stringToRegExp)(regexpString).test(keyName));for(const keyName of keys){try{const currentPath=[...path,keyName];isValidTypeOrThrow({conf,type:schema[regexpString],value:object[keyName],root,keyName,path:currentPath})}catch(error){if(!conf.collectAllErrors){throw error}regexErrors.push(error)}}}const errors=[...regexErrors,...requiredErrors,...optionalError];if(errors.length>0){throwErrors(errors,{...data,$Error:SchemaValidationError,kind:"schema"})}return true};const validMainValidatorOrThrow=data=>{const{type:fn,value}=data;try{let newConf={...data.conf,onValid:onValidDefault,onInvalid:onInvalidDefault};return fn(value,{[_helpers.configurationSymbol]:newConf})}catch(error){if(error.raw){reThrowError(error,data)}throw error}};const validCustomValidatorOrThrow=data=>{const{type:fn,value,root,keyName}=data;return validOrThrow(fn(value,root,keyName),data)};const validConstructorOrThrow=data=>validOrThrow((0,_helpers.checkConstructor)(data.type,data.value),data);const validPrimitiveOrThrow=data=>validOrThrow(data.value===data.type,data);const validRegExpOrThrow=data=>validOrThrow(data.value.constructor===String&&(0,_helpers.checkRegExp)(data.type,data.value),data);const validSeriesOrThrow=(conf,types,value)=>{const errors=[];for(const type of types){try{isValidTypeOrThrow({conf,type,value})}catch(error){errors.push(error);if(!conf.collectAllErrors)break}}if(errors.length>0){throwErrors(errors,{type:types,value,$Error:SerieValidationError,kind:"serie"})}return true};const validEnumOrThrow=data=>{const{conf,type:types,value,root,keyName,path}=data;const errors=[];for(const type of types){try{return isValidTypeOrThrow({conf,type,value,root,keyName,path})}catch(error){errors.push(error)}}throwErrors(errors,{...data,$Error:EnumValidationError,kind:"enum"})};const isValidTypeOrThrow=data=>{switch((0,_helpers.whatTypeIs)(data.type)){case"regex":return validRegExpOrThrow(data);case"primitive":return validPrimitiveOrThrow(data);case"constructor":return validConstructorOrThrow(data);case"enum":return validEnumOrThrow(data);case"schema":return validSchemaOrThrow(data);case"validator":return validCustomValidatorOrThrow(data);case"main-validator":return validMainValidatorOrThrow(data);case"invalid":throw new SyntaxError(`checking with validator ${(0,_helpers.stringify)(data.type)} not supported`);}};const run=conf=>(...types)=>{function validator(value,secretArg){let currentConf=conf;if(secretArg&&secretArg[_helpers.configurationSymbol]){currentConf=secretArg[_helpers.configurationSymbol]}try{validSeriesOrThrow(currentConf,types,value)}catch(error){return currentConf.onInvalid(error)}return currentConf.onValid(value)}validator[_helpers.validatorSymbol]=true;return validator};const config=({collectAllErrors=false,onValid=onValidDefault,onInvalid=onInvalidDefault})=>run({collectAllErrors,onValid,onInvalid});const logErrorsAndReturnFalse=error=>{const errors=flatAggregateError(error);errors.forEach(e=>console.error(e&&e.message||e));return false};const isValid=config({onInvalid:()=>false});exports.isValid=isValid;const isValidOrLog=config({onInvalid:logErrorsAndReturnFalse});exports.isValidOrLog=isValidOrLog;const flatAggregateError=error=>{if(error instanceof AggregateError){let errors=error.errors.flatMap(flatAggregateError);return errors}else{return[error]}};const hasErrors=config({onInvalid:error=>flatAggregateError(error),onValid:()=>null,collectAllErrors:true});exports.hasErrors=hasErrors;const isValidOrLogAll=config({onInvalid:logErrorsAndReturnFalse,collectAllErrors:true});exports.isValidOrLogAll=isValidOrLogAll;const isValidOrLogAllErrors=isValidOrLogAll;exports.isValidOrLogAllErrors=isValidOrLogAllErrors;const isValidOrThrowAll=config({collectAllErrors:true});exports.isValidOrThrowAll=isValidOrThrowAll;const isValidOrThrowAllErrors=isValidOrThrowAll;exports.isValidOrThrowAllErrors=isValidOrThrowAllErrors;const isValidOrThrow=config({});exports.isValidOrThrow=isValidOrThrow;var _default=isValidOrThrow;exports.default=_default;