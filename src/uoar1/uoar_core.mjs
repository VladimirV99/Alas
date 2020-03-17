import { isValidBase, createConstantString, createZeroString } from './util.mjs'
import { addToStackTrace } from './output.mjs';

const ASCII_0 = '0'.charCodeAt(0);
const ASCII_A = 'A'.charCodeAt(0);
const SPACE_MATCH = /^[ \t\n]$/;
const SPACE_REPLACE = /[ \t\n]/g;
const RADIX_MATCH = /^[.,]$/;
const RADIX_REPLACE = /[.,]/g;
export const PLUS = '+';
export const MINUS = '-';

export const PRECISION = 8;
export const PRECISION_NUMBER = Math.pow(10, PRECISION);

/** 
 * Number type enum
 * @readonly
 * @typedef {number} NumberType
 * @enum {NumberType}
*/
export const NumberTypes = Object.freeze({
  UNSIGNED: 0,
  SIGNED: 1,
  SMR: 2,
  OC: 3,
  TC: 4,
  EK: 5
});

/**
 * @typedef {Object} UOARNumber
 * @property {string} sign
 * @property {string} whole
 * @property {string} fraction
 * @property {number} base
 * @property {NumberType} number_type
 */
export class UOARNumber{
  constructor(sign, whole, fraction, base, number_type){
    this.sign = sign.trim();
    this.whole = whole.trim();
    this.fraction = fraction.trim();
    this.base = base;
    this.number_type = number_type;
  }
  toSigned(){
    let res = this.sign + this.whole;
    if(this.fraction!=""){
      res = res.concat("." + this.fraction);
    }
    return res;
  }
  toUnsigned(){
    let res = this.whole;
    if(this.fraction!=""){
      res = res.concat("." + this.fraction);
    }
    return res;
  }
  toWhole(){
    return this.sign + this.whole + this.fraction;
  }
  copy(){
    return new UOARNumber(this.sign, this.whole, this.fraction, this.base, this.number_type);
  }
  toString(){
    let res = this.sign + this.whole;
    if(this.fraction!=""){
      res = res.concat("." + this.fraction);
    }
    res = res.concat(" ("+this.base+")");
    return res;
  }
}

/**
 * Converts the character at the given index of the given string to its Decimal Value.
 * @param {string} number The Number
 * @param {number} index Characters index in the String
 * @param {boolean} [log=true] Should log errors
 * @returns {number} Character's Decimal Value if Valid, null otherwise.
 */
export function getValueAt(number, index, log=true){
  if(index<0 || number.length <= index){
    addToStackTrace("getValueAt", "Index out of bounds " + index + " in \"" + number + "\"", log);
    return null;
  }
  let valCode = number.charCodeAt(index);
  let res = valCode - ASCII_0;
  if(res<0 || res > 9){
    res = valCode - ASCII_A;
    if(res < 0 || res > 25){
      addToStackTrace("getValueAt", "Invalid symbol in \"" + number + "\" at index " + index, log); 
      return null;
    }
    res = res + 10;
  }
  return res;
}

/**
 * Converts the first character of the given string to its Decimal Value.
 * @param {string} number The Number
 * @param {boolean} [log=true] Should log errors
 * @returns {number} Character's Decimal Value if Valid, null otherwise.
 */
export function getValue(number, log=true){
  return getValueAt(number, 0, log);
}

/**
 * Converts the given value to a Character
 * @param {number} value Value to convert
 * @param {boolean} [log=true] Should log errors
 * @returns {string} If value is valid returns appropriate string, null otherwise
 */
export function toValue(value, log=true){
  if(value<0 || value>35){
    addToStackTrace("toValue", "Value Out of Bounds + \"" + value + "\"", log);
    return null;
  }
  if(value<10){
    return String.fromCharCode(value+ASCII_0);
  }else{
    return String.fromCharCode(value+ASCII_A-10);
  }
}

/**
 * Checks if the given string has a radix point at specified index
 * @param {string} number Number to check
 * @param {number} index Index to check at
 * @returns {boolean} true if number has a radix point at index, false otherwise
 */
function isRadixPointAt(number, index){
  return RADIX_MATCH.test(number.charAt(index));
}

/**
 * Checks if the given string is a radix point
 * @param {string} character Character to check
 * @returns {boolean} true if character is a radix point, false otherwise
 */
function isRadixPoint(character){
  return isRadixPointAt(character, 0);
}

/**
 * Checks if the given string has a sign at specified index
 * @param {string} number Number to check
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {number} index Index to check at
 * @returns {boolean} true if number has a sign at index, false otherwise
 */
function isSignAt(number, base, number_type, index){
  if(!isValidBase(base)){
    addToStackTrace("isSignAt", "Invalid base \"" + base + "\"", log);
    return false;
  }
  if(index<0 || number.length <= index){
    addToStackTrace("isSignAt", "Index out of bounds " + index + " in \"" + number + "\"", log);
    return false;
  }
  let temp = number.charAt(index);
  switch(number_type){
    case NumberTypes.UNSIGNED:
      return false;
    case NumberTypes.SIGNED:
      return temp==PLUS || temp==MINUS;
    case NumberTypes.SMR:
    case NumberTypes.OC:
    case NumberTypes.TC:
      return index==0 && (temp==toValue(0, false) || temp==toValue(base-1, false));
    default:
      return false;
  }
}

/**
 * Checks if the given string is a sign
 * @param {string} character Character to check
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @returns {boolean} true if character is a sign, false otherwise
 */
function isSign(character, base, number_type){
  return isSignAt(character, base, number_type, 0);
}

/**
 * Gets the fist index after the sign
 * @param {string} number Number to operate on
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {number} Length of the sign
 */
function getSignEnd(number, base, number_type, log=true){
  switch(number_type){
    case NumberTypes.UNSIGNED:
      return 0;
    case NumberTypes.SIGNED:
      let i;
      for(i=0; i<number.length; i++){
        if(!isSignAt(number, base, number_type, i) && !SPACE_MATCH.test(number.charAt(i))){
          break;
        }
      }
      return i;
    case NumberTypes.SMR:
    case NumberTypes.OC:
    case NumberTypes.TC:
      let j;
      for(j=0; j<number.length; j++)
        if(!SPACE_MATCH.test(number.charAt(j)))
          break;
      let first_char = getValue(number.charAt(j), log);
      if(first_char===null)
        return -1;
      else if(first_char==0 || first_char==base-1){
        if(number_type==NumberTypes.SMR)
          return j+1;
        for(; j<number.length; j++)
          if(number.charAt(j)!=first_char && !SPACE_MATCH.test(number.charAt(j)))
            break;
        return j;
      }
      return 0;
  }
  return -1;
}

/**
 * Gets sign from number
 * @param {string} number Number to remove sign from
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {string} Sign of the number
 */
export function getSign(number, base, number_type, log=true){
  let sign_end = getSignEnd(number, base, number_type, log);
  if(sign_end===-1)
    return null;
  if(sign_end==0){
    switch(number_type){
      case NumberTypes.UNSIGNED:
        return "";
      case NumberTypes.SIGNED:
        addToStackTrace("getSign", "Missing sign for signed number \"" + number + "\", assuming positive", log);
        return PLUS;
      case NumberTypes.SMR:
      case NumberTypes.OC:
      case NumberTypes.TC:
        addToStackTrace("getSign", "Missing sign for signed number \"" + number + "\", assuming positive", log);
        return "0";
      default:
        return null;
    }
  }
  return number.substr(0, sign_end).replace(SPACE_REPLACE, '');
}

/**
 * Removes sign from number
 * @param {string} number Number to remove sign from
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {string} Number without the sign
 */
export function removeSign(number, base, number_type, log=true){
  let sign_end = getSignEnd(number, base, number_type, log);
  if(sign_end===-1)
    return null;
  if(sign_end==number.length){
    addToStackTrace("removeSign", "Missing whole for number \"" + number + "\", assuming zero", log);
    return "0";
  }
  return number.substr(sign_end);
}

/**
 * Checks if sign is valid
 * @param {string} sign Sign to check
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidSign(sign, base, number_type){
  sign = sign.replace(SPACE_REPLACE, '');
  if(sign.length==0){
    return number_type==NumberTypes.UNSIGNED;
  }
  switch(number_type){
    case NumberTypes.SIGNED:
      for(let i=0; i<sign.length; i++){
        if(!isSign(sign.charAt(i), base, number_type))
          return false;
      }
      return true;
    case NumberTypes.SMR:
      return sign.length==1 && isSign(sign.charAt(0), base, number_type);
    case NumberTypes.OC:
    case NumberTypes.TC:
      let temp = sign.charAt(0);
      if(!isSign(temp, base, number_type))
        return false;
      for(let i=1; i<sign.length; i++){
        if(sign.charAt(i) != temp)
          return false;
      }
      return true;
    default:
      return false;
  }
}

/**
 * Gets sign multiplier of a number
 * @param {UOARNumber} number Number to operate on
 * @param {boolean} [standardized=false] Treat as standardized 
 * @returns {number} 1 if positive, -1 if negative, 0 if invalid
 */
export function getSignMultiplierForNumber(number, standardized=false){
  return getSignMultiplier(number.sign, number.base, number.number_type, standardized);
}

/**
 * Gets sign multiplier of a number
 * @param {string} sign Sign to operate on
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [standardized=false] Treat as standardized 
 * @returns {number} 1 if positive, -1 if negative, 0 if invalid
 */
function getSignMultiplier(sign, base, number_type, standardized=false){
  switch(number_type){
    case NumberTypes.UNSIGNED:
      return 1;
    case NumberTypes.SIGNED:
      if(standardized){
        if(sign==MINUS){
          return -1;
        } else if(sign==PLUS){
          return 1;
        }
        break;
      }else{
        let sign_dec = 1;
        for(let i = 0; i<sign.length; i++){
          if(sign.charAt(i)==MINUS){
            sign_dec *= -1;
          }else if(sign.charAt(i)!=PLUS && !SPACE_MATCH.test(sign.charAt(i))){
            return 0;
          }
        }
        return sign_dec;
      }
    case NumberTypes.SMR:
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(standardized || isValidSign(sign, base, number_type)){
        if(sign.charAt(0)=="0"){
          return 1;
        }else{
          return -1;
        }
      }
      break;
  }
  return 0;
}
  
/**
 * Checks if an UOARNumber is valid
 * @param {UOARNumber} number Number to validate
 * @returns {boolean} true if valid, false otherwise.
 */
export function isValidUOARNumber(number){
  if(number===null || !isValidBase(number.base) || !isValidSign(number.sign, number.base, number.number_type)){
    return false;
  }
  let temp = "";
  for(let i=0; i<number.whole.length; i++){
    temp = number.whole.charAt(i);
    if(SPACE_MATCH.test(temp))
      continue;
    temp = getValue(temp, false);
    if(temp===null || temp>=number.base){
      return false;
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    temp = number.fraction.charAt(i);
    if(SPACE_MATCH.test(temp))
      continue;
    temp = getValue(temp, false);
    if(temp===null || temp>=number.base){
      return false;
    }
  }
  return true;
}

/**
 * Checks if a number is valid
 * @param {string} number Number to validate
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @returns {boolean} true if valid, false otherwise.
 */
export function isValidNumber(number, base, number_type){
  if(number===null || !isValidBase(base)){
    return false;
  }
  let i;
  let hasDecimal = false;
  let temp = "";
  for(i=0; i<number.length; i++){
    temp = number.charAt(i);
    if(!isSign(temp, base, number_type) && !SPACE_MATCH.test(temp))
      break;
  }
  for(; i<number.length; i++){
    temp = number.charAt(i);
    if(!isRadixPoint(temp)){
      if(SPACE_MATCH.test(temp))
        continue;
      temp = getValue(temp, false);
      if(temp===null || temp>=base){
        return false;
      }
    }else{
      if(hasDecimal){
        return false;
      }else{
        hasDecimal = true;
      }
    }
  }
  return true;
}

/**
 * Converts a number string written as specified type to a UOARNumber of the same type
 * @param {string} number Number to convert to UOARNumber
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number as UOARNumber
 */
export function toUOARNumber(number, base, number_type, log=true){
  if(number==null){
    addToStackTrace("toUOARNumber", "Number is null", log);
    return null;
  }
  if(!isValidBase(base)){
    addToStackTrace("toUOARNumber", "Invalid base \"" + base + "\"", log);
    return null;
  }
  if(!isValidNumber(number, base, number_type)){
    addToStackTrace("toUOARNumber", "Invalid number \"" + number + "\"", log);
    return null;
  }
  
  number = number.replace(SPACE_REPLACE, '');
  let arr = number.split(RADIX_REPLACE);

  let sign = getSign(arr[0], base, number_type, log);
  let whole = removeSign(arr[0], base, number_type, log);
  let fraction = "";
  if(arr.length==2){
    fraction = arr[1];
  }
  return new UOARNumber(sign, whole, fraction, base, number_type);
}

/**
 * Trims the numbers sign to 1
 * @param {UOARNumber} number Number to trim
 * @returns {UOARNumber} Trimmed number
 */
export function trimSign(number){
  if(!isValidSign(number.sign, number.base, number.number_type)){
    addToStackTrace("trimSign", "Invalid sign \"" + number.sign + "\" for number " + number.toString(), log);
    return null;
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      return number;
    case NumberTypes.SIGNED:
      let sign_mult = getSignMultiplierForNumber(number, false);
      if(sign_mult==1)
        number.sign = "+";
      else
        number.sign = "-";
      return number;
    case NumberTypes.SMR:
    case NumberTypes.OC:
    case NumberTypes.TC:
      number.sign = number.sign.charAt(0);
      return number;
  }
  return null;
}

/**
 * Removes excess zeroes and spaces from a number
 * @param {UOARNumber} number Number to trim
 * @returns {UOARNumber} Trimmed number 
 */
export function trimNumber(number){
  number.whole = number.whole.replace(SPACE_REPLACE, '');
  number.fraction = number.fraction.replace(SPACE_REPLACE, '');
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
    case NumberTypes.SIGNED:
    case NumberTypes.SMR:
      for(let i=0; i<number.whole.length; i++){
        if(number.whole.charAt(i)!='0' || (number.whole.charAt(i)=='0' && number.whole.length-1==i)){
          number.whole = number.whole.substr(i);
          break;
        }
      }
      for(let i=number.fraction.length-1; i>=0; i--){
        if(number.fraction.charAt(i)!='0' || i==0){
          number.fraction = number.fraction.substr(0, i+1);
          break;
        }
      }
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      let sign;
      let sign_mult = getSignMultiplierForNumber(number, false);
      if(sign_mult==1){
        sign = "0";
      }else if(sign_mult==-1){
        sign = toValue(number.base-1);
      }else{
        return null;
      }
      for(let i=0; i<number.whole.length; i++){
        if(number.whole.charAt(i)!=sign || (number.whole.charAt(i)==sign && number.whole.length-1==i)){
          number.whole = number.whole.substr(i);
          break;
        }
      }
      for(let i=number.fraction.length-1; i>=0; i--){
        if(number.fraction.charAt(i)!='0'){
          number.fraction = number.fraction.substr(0, i+1);
          break;
        }
      }
      break;
  }
  return number;
}

/**
 * Modifies number to fit the standards
 * @param {UOARNumber} number Number to standardize
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Standardized number
 */
export function standardizeUOARNumber(number, log=true){
  if(!isValidBase(number.base)){
    addToStackTrace("standardizeUOARNumber", "Invalid base \"" + number.base + "\"", log);
    return null;
  }
  if(isValidUOARNumber(number)){
    number.sign = number.sign.replace(SPACE_REPLACE, '');
    number.whole = number.whole.replace(SPACE_REPLACE, '');
    number.fraction = number.fraction.replace(SPACE_REPLACE, '');
    trimSign(number);
    trimNumber(number);
    return number;
  }else{
    addToStackTrace("standardizeUOARNumber", "Invalid number \"" + number.toString() + "\"", log);
    return null;
  }
}

/**
 * Trims whole part of the number to a specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} length Length of the whole
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
export function wholeToLength(number, length, log=true){
  if(number===null){
    addToStackTrace("wholeToLength", "Number is null", log);
    return null;
  }
  if(number.whole.length>length){
    addToStackTrace("wholeToLength", "Number is too big", log);
    return null;
  }
  let whole = number.whole;
  let toAdd = length-whole.length;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
    case NumberTypes.SIGNED:
    case NumberTypes.SMR:
      whole = createZeroString(toAdd).concat(whole);
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      whole = createConstantString(number.sign.charAt(0), toAdd).concat(whole);
      break;
  }
  number.whole = whole;
  return number;
}

/**
 * Trims fraction part of the number to a specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} length Length of the fraction
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
export function fractionToLength(number, length, log=true){
  if(number===null){
    addToStackTrace("fractionToLength", "Number is null", log);
    return null;
  }
  let fraction = number.fraction;;
  if(fraction.length>length){
    fraction = fraction.substr(0, length);
  }else if(fraction.length<length){
    fraction = fraction.concat(createZeroString(length-fraction.length));
  }
  number.fraction = fraction;
  return number;
}

/**
 * Trims number to specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} n Total length
 * @param {number} m Fraction length
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
export function toLength(number, n, m, log=true){
  if(number===null){
    addToStackTrace("toLength", "Number is null", log);
    return null;
  }
  if(n-m<1){
    addToStackTrace("toLength", "Fraction length longer than entire number", log);
    return null;
  }
  number = wholeToLength(number, n-m, false);
  if(number===null){
    addToStackTrace("toLength", "Number is too big", true);
    return null;
  }
  number = fractionToLength(number, m, log);
  return number;
}

/**
 * Adds zeroes after the number to specified length
 * @param {string} number Number to add zeroes to
 * @param {number} base Base of the number
 * @param {NumberTypes} number_type Type of the number
 * @param {number} length Length of the number to return
 * @param {boolean} [log=true] Should log
 * @returns {string} Number with the specified length with zeroes at the end
 */
export function addZeroesAfter(number, base, number_type, length, log=true){
  if(number===null){
    addToStackTrace("addZeroesAfter", "Number is null", log);
    return null;
  }
  number = number.replace(SPACE_REPLACE, '');
  let offset = getSignEnd(number, base, number_type, log);
  let toAdd = length - number.substr(offset).replace(RADIX_REPLACE, '').length;
  if(toAdd>0){
    number = number.concat(createZeroString(toAdd));
  }
  return number;
}

/**
 * Adds zeroes before the number to specified length
 * @param {string} number Number to add zeroes to
 * @param {number} base Base of the number
 * @param {NumberTypes} number_type Type of the number
 * @param {number} length Length of the number to return
 * @param {boolean} [log=true] Should log
 * @returns {string} Number with the specified length with zeroes at the beginning
 */
export function addZeroesBefore(number, base, number_type, length, log=true){
  if(number===null){
    addToStackTrace("addZeroesBefore", "Number is null", log);
    return null;
  }
  number = number.replace(SPACE_REPLACE, '');
  let offset = getSignEnd(number, base, number_type, log);
  let toAdd = length - number.substr(offset).replace(RADIX_REPLACE, '').length;
  let res = number.substr(0, offset);
  if(toAdd>0){
    res = res.concat(createZeroString(toAdd));
  }
  res = res.concat(number.substr(offset));
  return res;
}

/**
 * Makes given numbers the same length
 * @param {UOARNumber} num1 Number 1
 * @param {UOARNumber} num2 Number 2
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {boolean} true if operation was successful, false otherwise.
 */
export function equalizeLength(num1, num2, standardized=false, log=true){
  if(num1==null || num2==null){
    addToStackTrace("equalizeLength", "A numbers is null", log);
    return false;
  }
  if(num1.number_type!=num2.number_type){
    addToStackTrace("equalizeLength", "Numbers are not same type", log);
    return false;
  }
  if(!standardized){
    num1 = standardizeUOARNumber(num1, log);
    num2 = standardizeUOARNumber(num2, log);
    if(num1==null || num2==null){
      addToStackTrace("equalizeLength", "Numbers are invalid", log);
      return false;
    }
  }
  
  if(num1.whole.length>num2.whole.length){
    num2 = wholeToLength(num2, num1.whole.length, log);
  }else if(num1.whole.length<num2.whole.length){
    num1 = wholeToLength(num1, num2.whole.length, log);
  }
  if(num1.fraction.length>num2.fraction.length){
    num2 = fractionToLength(num2, num1.fraction.length, log);
  }else if(num1.fraction.length<num2.fraction.length){
    num1 = fractionToLength(num1, num2.fraction.length, log);
  }

  return true;
}