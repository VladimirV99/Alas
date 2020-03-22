import {
  SPACE_MATCH, SPACE_REPLACE, RADIX_REPLACE, NumberTypes, UOARNumber, PRECISION, PRECISION_NUMBER,
  getValueAt, toValue, getSign, removeSign, addZeroesBefore, isValidUOARNumber, isValidNumber,
  trimNumber, standardizeUOARNumber, getSignMultiplierForNumber, fractionToLength
} from './uoar_core.mjs';
import { complement } from './uoar_arithmetic.mjs';
import { isValidBase } from './util.mjs';
import { addToStackTrace } from './output.mjs';

/**
 * Converts a UOARNumber to an integer
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Number converted to an integer
 */
export function UOARNumberToDecimalInteger(number, standardized=false, log=true){
  if(number===null){
    addToStackTrace("UOARNumberToDecimalInteger", "Number is null", log);
    return null;
  }
  if(!isValidUOARNumber(number)){
    addToStackTrace("UOARNumberToDecimalInteger", "Invalid number \"" + number.toString() + "\"", log);
    return null;
  }
  number = number.copy();
  let sign_mult = getSignMultiplierForNumber(number, standardized);
  if(sign_mult==0){
    return null;
  }else if(sign_mult==-1){
    switch(number.number_type){
      case NumberTypes.UNSIGNED:
      case NumberTypes.SIGNED:
      case NumberTypes.SMR:
        break;
      case NumberTypes.OC:
      case NumberTypes.TC:
        number = complement(number);
        break;
      default:
        return null;
    }
  }
  let res = 0;
  for(let i=0; i<number.whole.length; i++){
    res = res * number.base + getValueAt(number.whole, i, log);
  }
  res *= sign_mult;
  return res;
}

/**
 * Converts a string to an integer
 * @param {string} number Number to convert 
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {number} Number converted to an integer
 */
export function baseToDecimalInteger(number, base, number_type, log=true){
  number = number.split(RADIX_REPLACE)[0];
  let sign = getSign(number, base, number_type, log);
  let whole = removeSign(number, base, number_type, log);
  let num = new UOARNumber(sign, whole, "", base, number_type);
  return UOARNumberToDecimalInteger(num, false, log);
}

/**
 * Converts given nimber to base 10
 * @param {UOARNumber} number Standardized Signed Number to convert
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to base 10
 */
export function toDecimal(number, standardized=false, log=true){
  if(number===null){
    addToStackTrace("toDecimal", "Number is null", log);
    return null;
  }
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), log);
    if(standardized_number === null){
      addToStackTrace("toDecimal", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number =  standardized_number;
  } else {
    number = number.copy();
  }
  if(number.base==10){
    return number;
  }

  let sign = "";
  let toComplement = false;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      break;
    case NumberTypes.SIGNED:
      sign = number.sign;
      break;
    case NumberTypes.SMR:
      if(number.sign.charAt(0)==toValue(number.base-1, false))
        sign = "9";
      else
        sign = "0";
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      sign = "0";
      if(number.sign.charAt(0)==toValue(number.base-1, false)){
        number = complement(number, true, log);
        toComplement = true;
      }
      break;
    default:
      return null;
  }

  let whole = 0;
  for(let i = 0; i<number.whole.length; i++){
    whole = whole * number.base + getValueAt(number.whole, i, log);
  }
  whole = whole.toString();

  let fraction = 0;
  let precision = PRECISION_NUMBER / number.base;
  for(let i = 0; i<number.fraction.length; i++){
    fraction += Math.floor(getValueAt(number.fraction, i, log) * precision);
    precision = precision / number.base;
  }
  fraction = fraction.toString();
  
  let res = new UOARNumber(sign, whole, fraction, 10, number.number_type);
  if(toComplement){
    res = complement(res, true, log);
  }
  return trimNumber(res);
}

/**
 * Converts given standardized signed nimber from base 10 to the given base
 * @param {UOARNumber} number Number to convert from decimal 
 * @param {number} base Base to convert to
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to specified base
 */
export function fromDecimal(number, base, standardized=false, log=true){
  if(number===null){
    addToStackTrace("fromDecimal", "Number is null", log);
    return null;
  }
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), log);
    if(standardized_number === null){
      addToStackTrace("fromDecimal", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  } else {
    number = number.copy();
  }
  if(number.base!=10){
    addToStackTrace("fromDecimal", "Number isn't decimal", log);
    return null;
  }
  if(!isValidBase(base)){
    addToStackTrace("fromDecimal", "Invalid base \"" + base + "\"", log);
    return null;
  }
  if(base==10){
    return number;
  }

  let sign = "";
  let toComplement = false;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      break;
    case NumberTypes.SIGNED:
      sign = number.sign;
      break;
    case NumberTypes.SMR:
      if(number.sign.charAt(0)=="9")
        sign = toValue(base-1, false);
      else
        sign = "0";
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      sign = "0";
      if(number.sign.charAt(0)==toValue(number.base-1, false)){
        number = complement(number, true, log);
        toComplement = true;
      }
      break;
    default:
      return null;
  }
  
  let whole = "";
  let whole_dec = baseToDecimalInteger(number.whole, number.base, NumberTypes.UNSIGNED, log);
  do {
    whole = toValue(whole_dec%base, false).concat(whole);
    whole_dec = Math.floor(whole_dec/base);
  } while(whole_dec>0);

  let fraction = "";
  if(number.fraction!=""){
    number = fractionToLength(number, PRECISION, log);
    let fraction_dec = baseToDecimalInteger(number.fraction, number.base, NumberTypes.UNSIGNED, log);
    let limit = 0;
    let temp = 0;
    while(fraction_dec>0 && limit<PRECISION){
      fraction_dec = fraction_dec*base;
      temp = Math.floor(fraction_dec/PRECISION_NUMBER);
      fraction_dec -= temp*PRECISION_NUMBER;
      fraction = fraction.concat(toValue(temp, false));
      limit++;
    }
  }

  let res = new UOARNumber(sign, whole, fraction, base, number.number_type);
  if(toComplement){
    res = complement(res, true, log);
  }
  return res;
}

/**
 * Converts a number to base base_to
 * @param {UOARNumber} number Number to convert
 * @param {number} base_to Base to convert to
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to base base_to
 */
export function convertBases(number, base_to, standardized=false, log=true){
  if(number===null){
    addToStackTrace("convertBases", "Number is null", log);
    return null;
  }
  if(!isValidBase(base_to)){
    addToStackTrace("convertBases", "Invalid base \"" + base_to + "\"", log);
    return null;
  }
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), log);
    if(standardized_number === null){
      addToStackTrace("convertBases", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  } else {
    number = number.copy();
  }
  
  if(number.base==base_to){
    return number;
  }
  let res = fromDecimal(toDecimal(number, true, log), base_to, true, log);
  if(res===null){
    addToStackTrace("convertBases", "Conversion error, result null", log);
  }
  return res;
}

/**
 * Converts the specified digit from the number to binary
 * @param {string} number Number whose digit to convert
 * @param {number} index Index of the digit to convert
 * @param {boolean} [log=true] Should log
 * @returns {string} Digit converted to binary
 */
export function digitToBinary(number, index, log=true){
  if(index<0 || number.length <= index){
    addToStackTrace("digitToBinary", "Index out of bounds " + index + " for \"" + number + "\"", log);
    return null;
  }
  let val = getValueAt(number, index, false);
  if(val===null){
    addToStackTrace("digitToBinary", "Invalid digit \"" + number.charAt(index) + "\"", log);
    return null;
  }
  let res = "";
  do{
    res = toValue(val%2, log).concat(res);
    val = Math.floor(val/2);
  } while(val>0);
  return res;
}

/**
 * Converts the given number to binary
 * @param {number} number Number to convert
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted to binary
 */
export function numberToBinary(number, log=true){
  if(number<0){
    addToStackTrace("numberToBinary", "Cannot convert negative number", log);
    return null;
  }
  let res = "";
  do {
    res = toValue(number%2).concat(res);
    number = Math.floor(number/2);
  } while(number>0);
  return res;
}

/**
 * Converts the given number from binary
 * @param {string} number Number to convert
 * @param {boolean} [log=true] Should log
 * @returns {number} Number converted from binary
 */
export function binaryToNumber(number, log=true){
  if(!isValidNumber(number, 2, NumberTypes.UNSIGNED)){
    addToStackTrace("binaryToNumber", "Invalid number \"" + number + "\"", log);
    return null;
  }
  let res = 0;
  let temp;
  for(let i=0; i<number.length; i++){
    if(SPACE_MATCH.test(number.charAt(i)))
      continue;
    temp = getValueAt(number, i, false);
    res = res*2 + temp;
  }
  return res;
}

/**
 * Convert given decimal number to 8421
 * @param {string} number Decimal number to convert
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted to 8421 
 */
export function decimalTo8421(number, log=true){
  let res = "";
  let temp;
  for(let i=0; i<number.length; i++){
    if(SPACE_MATCH.test(number.charAt(i)))
      continue;
    temp = getValueAt(number, i, log);
    if(temp===null || temp>9){
      addToStackTrace("decimalTo8421", "Invalid value in \"" + number + "\"", log);
      return null;
    }
    temp = addZeroesBefore(numberToBinary(temp), 2, NumberTypes.UNSIGNED, 4, log);
    res = res.concat(temp);
  }
  return res;
}

/**
 * Convert given 8421 number to decimal
 * @param {string} number 8421 number to convert
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted to decimal 
 */
export function decimalFrom8421(number, log=true){
  number = number.replace(SPACE_REPLACE, '');
  let res = "";
  let temp;
  for(let i=0; i<number.length; i+=4){
    temp = binaryToNumber(number.substr(i, 4), false);
    if(temp===null){
      addToStackTrace("decimalFrom8421", "Invalid number", log);
      return null;
    }
    if(temp>15){
      addToStackTrace("decimalFrom8421", "Digit out of bounds", log);
      return null;
    }
    temp = toValue(temp, false);
    res = res.concat(temp);
  }
  return res;
}