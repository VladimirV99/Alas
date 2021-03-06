import { PLUS, MINUS, UOARNumber, NumberTypes, toValue, standardizeUOARNumber } from './uoar_core.mjs';
import { complement, addToLowestPoint } from './uoar_arithmetic.mjs';
import { addToStackTrace } from './output.mjs';

/**
 * Converts given number to the specified type
 * @param {UOARNumber} number Number to convert 
 * @param {NumberType} type Type to convert to
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to the specified type
 */
export function convertToType(number, type, standardized=false, log=true) {
  if (number.number_type == type)
    return number.copy();
  switch (type) {
    case NumberTypes.UNSIGNED:
      return convertToUnsigned(number, standardized, log);
    case NumberTypes.SIGNED:
      return convertToSigned(number, standardized, log);
    case NumberTypes.SMR:
      return convertToSMR(number, standardized, log);
    case NumberTypes.OC:
      return convertToOC(number, standardized, log);
    case NumberTypes.TC:
      return convertToTC(number, standardized, log);
    default:
      addToStackTrace("convertToType", "Invalid number type", log);
      return null;
  }
}

/**
 * Converts given number to an unsigned number
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to an unsigned number
 */
export function convertToUnsigned(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), false);
    if(standardized_number===null){
      addToStackTrace("convertToUnsigned", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      return number;
    case NumberTypes.SIGNED:
      if(number.sign==MINUS){
        addToStackTrace("convertToUnsigned", "Warning! Converting negative number to unsigned", log);
      }
      number.sign = "";
      number.number_type = NumberTypes.UNSIGNED;
      return number;
    case NumberTypes.SMR:
      if(number.sign!="0"){
        addToStackTrace("convertToUnsigned", "Warning! Converting negative number to unsigned", log);
      }
      number.sign = "";
      number.number_type = NumberTypes.UNSIGNED;
      return number;
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(number.sign!="0"){
        number = complement(number, true, false);
        addToStackTrace("convertToUnsigned", "Warning! Converting negative number to unsigned", log);
      }
      number.sign = "";
      number.number_type = NumberTypes.UNSIGNED;
      return number;
    default:
      addToStackTrace("convertToUnsigned", "Invalid number type", log);
      return null;
  }
}

/**
 * Converts given number to a signed number
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to a signed number
 */
export function convertToSigned(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), false);
    if(standardized_number===null){
      addToStackTrace("convertToSigned", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.SIGNED;
      number.sign = PLUS;
      return number;
    case NumberTypes.SIGNED:
      return number;
    case NumberTypes.SMR:
      number.number_type = NumberTypes.SIGNED;
      if(number.sign=="0"){
        number.sign = PLUS;
      }else{
        number.sign = MINUS;
      }
      return number;
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(number.sign=="0"){
        number.sign = PLUS;
      }else{
        number = complement(number, true, false);
        number.sign = MINUS;
      }
      number.number_type = NumberTypes.SIGNED;
      return number;
    default:
      addToStackTrace("convertToSigned", "Invalid number type", log);
      return null;
  }
}

/**
 * Converts given number to Signed Magnitude Representation
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to Signed Magnitude Representation
 */
export function convertToSMR(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), false);
    if(standardized_number===null){
      addToStackTrace("convertToSMR", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.SMR;
      number.sign = "0";
      return number;
    case NumberTypes.SIGNED:
      number.number_type = NumberTypes.SMR;
      if(number.sign == MINUS){
        number.sign = toValue(number.base-1, false);
      }else{
        number.sign = "0";
      }
      return number;
    case NumberTypes.SMR:
      return number;
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(number.sign!="0"){
        number = complement(number, true, false);
        number.sign = toValue(number.base-1, true, false);
      }
      number.number_type = NumberTypes.SMR;
      return number;
    default:
      addToStackTrace("convertToSMR", "Invalid number type", log);
      return null;
  }
}

/**
 * Converts given number to One's complement
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to One's complement 
 */
export function convertToOC(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), log);
    if(standardized_number===null){
      addToStackTrace("convertToOC", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.OC;
      number.sign = "0";
      return number;
    case NumberTypes.SIGNED:
      number.number_type = NumberTypes.OC;
      if(number.sign==MINUS){
        number.sign = "0";
        number = complement(number, true, false);
      }else{
        number.sign = "0";
      }
      return number;
    case NumberTypes.SMR:
      number.number_type = NumberTypes.OC;
      if(number.sign!="0"){
        number.sign = "0";
        number = complement(number, true, false);
      }
      return number;
    case NumberTypes.OC:
      return number;
    case NumberTypes.TC:
      number.number_type = NumberTypes.OC;
      if(number.sign!="0"){
        number = addToLowestPoint(number, -1, false);
      }
      return number;
    default:
      addToStackTrace("convertToOC", "Invalid number type", log);
      return null;
  }
}

/**
 * Converts given number to Two's complement
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to Two's complement 
 */
export function convertToTC(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), log);
    if(standardized_number===null){
      addToStackTrace("convertToTC", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.TC;
      number.sign = "0";
      return number;
    case NumberTypes.SIGNED:
      number.number_type = NumberTypes.TC;
      if(number.sign == MINUS){
        number.sign = "0";
        number = complement(number, true, false);
      }else{
        number.sign = "0";
      }
      return number;
    case NumberTypes.SMR:
      number.number_type = NumberTypes.TC;
      if(number.sign!="0"){
        number.sign = "0";
        number = complement(number, true, false);
      }
      return number;
    case NumberTypes.OC:
      number.number_type = NumberTypes.TC;
      if(number.sign!="0"){
        number = addToLowestPoint(number, 1, false);
      }
      return number;
    case NumberTypes.TC:
      return number;
    default:
      addToStackTrace("convertToTC", "Invalid number type", log);
      return null;
  }
}