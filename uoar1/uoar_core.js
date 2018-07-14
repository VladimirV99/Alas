const ASCII_0 = '0'.charCodeAt(0);
const ASCII_A = 'A'.charCodeAt(0);
const PLUS = '+';
const MINUS = '-';
const SPACE = ' ';
const RADIX = ['.', ','];

var PRECISION = 8;
var PRECISION_NUMBER = Math.pow(10, PRECISION);

/**
 * @typedef {number} NumberType
 */

/** 
 * Number type enum
 * @readonly
 * @enum {NumberType}
*/
const NumberTypes = Object.freeze({
  UNSIGNED: 0,
  SIGNED: 1,
  SMR: 2,
  OC: 3,
  TC: 4,
  EK: 5
});
const number_type_description = [
  "unsigned", "signed", "SMR", "OC", "TC", "EK"
];

/**
 * @typedef {number} ShiftType
 */

 /**
  * Shift type enum
  * @readonly
  * @enum {ShiftType}
  */
 const ShiftTypes = Object.freeze({
   RIGHT_A: 0,
   RIGHT_L: 1,
   LEFT: 2
 });

/**
 * @typedef {Object} UOARNumber
 * @property {string} sign
 * @property {string} whole
 * @property {string} fraction
 * @property {number} base
 * @property {NumberType} number_type
 */
function UOARNumber(sign, whole, fraction, base, number_type){
  this.sign = sign;
  this.whole = whole;
  this.fraction = fraction;
  this.base = base;
  this.number_type = number_type;
  this.toSigned = function(){
    var res = this.sign + this.whole;
    if(this.fraction!="" && this.fraction!="0"){
      res = res.concat("." + this.fraction);
    }
    return res;
  };
  this.toUnsigned = function(){
    var res = this.whole;
    if(this.fraction!="" && this.fraction!="0"){
      res = res.concat("." + this.fraction);
    }
    return res;
  }
  this.copy = function(){
    return new UOARNumber(this.sign, this.whole, this.fraction, this.base, this.number_type);
  }
}

/**
 * Checks if a number is between min and max
 * @param {number} number Number to check
 * @param {number} min Minimum
 * @param {number} max Maximum
 * @returns {boolean} True if number is in bounds, false otherwise
 */
function isInBounds(number, min, max){
  return number>=min && number<=max;
}

/**
 * Converts the character at the given index of the given string to its Decimal Value.
 * @param {string} number The Number
 * @param {number} index Characters index in the String
 * @param {boolean} [log=true] Should log errors
 * @returns {number} Character's Decimal Value if Valid, null otherwise.
 */
function getValueAt(number, index, log=true){
  if(index<0 || number.length <= index){
    addToStackTrace("getValueAt", "Index out of bounds " + index + " in \"" + number + "\"", log);
    return null;
  }
  var valCode = number.charCodeAt(index);
  var res = valCode - ASCII_0;
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
function getValue(number, log=true){
  return getValueAt(number, 0, log);
}

/**
 * Converts the given value to a Character
 * @param {number} value Value to convert
 * @param {boolean} [log=true] Should log errors
 * @returns {string} If value is valid returns appropriate string, null otherwise
 */
function toValue(value, log=true){
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
  for(let radix of RADIX){
    if(number.charAt(index)==radix){
      return true;
    }
  }
  return false;
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
 * Checks if a base is valid
 * @param {number} base Base to validate
 * @returns {boolean} is base inside bounds
 */
function isValidBase(base){
  return base!=null && base>1 && base<36;
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
  number = number.replace(/ /g, '');
  if(!isValidBase(base) || number.length<=index)
    return null;
  var temp = number.charAt(index);
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
      return null;
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
        if(!isSignAt(number, base, number_type, i) && number.charAt(i)!=SPACE){
          break;
        }
      }
      return i;
    case NumberTypes.SMR:
    case NumberTypes.OC:
    case NumberTypes.TC:
      let j;
      for(j=0; j<number.length; j++)
        if(number.charAt(j)!=SPACE)
          break;
      let first_char = getValue(number.charAt(j), log);
      if(first_char===null)
        return null;
      if(first_char==0 || first_char==base-1)
        return j+1;
      return 0;
  }
  return null;
}

/**
 * Gets sign from number
 * @param {string} number Number to remove sign from
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {string} Sign of the number
 */
function getSign(number, base, number_type, log=true){
  var sign_end = getSignEnd(number, base, number_type, log);
  if(sign_end===null)
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
  return number.substr(0, sign_end);
}

/**
 * Removes sign from number
 * @param {string} number Number to remove sign from
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @param {boolean} [log=true] Should log
 * @returns {string} Number without the sign
 */
function removeSign(number, base, number_type, log=true){
  var sign_end = getSignEnd(number, base, number_type, log);
  if(sign_end===null)
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
function isValidSign(sign, base, number_type){
  sign = sign.replace(/ /g, '');
  if(sign.length==0){
    if(number_type==NumberTypes.UNSIGNED)
      return true;
    else
      return false;
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
  }
}
  
/**
 * Checks if an UOARNumber is valid
 * @param {UOARNumber} number Number to validate
 * @returns {boolean} true if valid, false otherwise.
 */
function isValidUOARNumber(number){
  if(number===null || !isValidBase(number.base) || !isValidSign(number.sign, number.base, number.number_type)){
    return false;
  }
  var temp = "";
  for(let i=0; i<number.whole.length; i++){
    temp = number.whole.charAt(i);
    if(temp==SPACE)
      continue;
    temp = getValue(temp, false);
    if(temp===null || temp>=number.base){
      return false;
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    temp = number.fraction.charAt(i);
    if(temp==SPACE)
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
function isValidNumber(number, base, number_type){
  if(number===null || !isValidBase(base)){
    return false;
  }
  var i;
  var hasDecimal = false;
  var temp = "";
  for(i=0; i<number.length; i++){
    temp = number.charAt(i);
    if(!isSign(temp, base, number_type) && temp!=SPACE)
      break;
  }
  for(; i<number.length; i++){
    temp = number.charAt(i);
    if(!isRadixPoint(temp)){
      if(temp==SPACE)
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
function toUOARNumber(number, base, number_type, log=true){
  if(number==null){
    addToStackTrace("toUOARNumber", "Number is null", log);
    return null;
  }
  if(!isValidBase(base)){
    addToStackTrace("toUOARNumber", "Invalid base \"" + base + "\"", log);
    return null;
  }
  if(!isValidNumber(number, base, number_type)){
    addToStackTrace("toUOARNumber", "Number is invalid", log);
    return null;
  }
  
  number = number.replace(/ /g, '');
  var arr = number.split(/[.,]/);

  var sign = getSign(arr[0], base, number_type, log);
  var whole = removeSign(arr[0], base, number_type, log);
  var fraction = "";
  if(arr.length==2){
    fraction = arr[1];
  }
  var res = new UOARNumber(sign, whole, fraction, base, number_type);
  return res;
}

/**
 * Trims the numbers sign to 1
 * @param {UOARNumber} number Number to trim
 * @returns {UOARNumber} Trimmed number
 */
function trimSign(number){
  if(!isValidSign(number.sign, number.base, number.number_type)){
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
 * Removes excess zeroes from a number
 * @param {UOARNumber} number Number to trim
 * @returns {UOARNumber} Trimmed number 
 */
function trimNumber(number){
  number.whole = number.whole.replace(/ /g, '');
  number.fraction = number.fraction.replace(/ /g, '');
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
function standardizeUOARNumber(number, log=true){
  if(!isValidBase(number.base)){
    addToStackTrace("standardizeUOARNumber", "Invalid base \"" + number.base + "\"", log);
    return null;
  }
  if(isValidUOARNumber(number)){
    number.sign = number.sign.replace(/ /g, '');
    number.whole = number.whole.replace(/ /g, '');
    number.fraction = number.fraction.replace(/ /g, '');
    trimSign(number);
    trimNumber(number);
    return number;
  }else{
    addToStackTrace("standardizeUOARNumber", "Invalid number \"" + number.toSigned() + "\" for base " + number.base, log);
    return null;
  }
}

/**
 * Gets sign multiplier of a number
 * @param {UOARNumber} number Number to operate on
 * @param {boolean} [standardized=false] Treat as standardized 
 * @returns {number} 1 if positive, -1 if negative, 0 if invalid
 */
function getSignMultiplierForNumber(number, standardized=false){
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
        let num_len = sign.length;
        let index = 0;
        let sign_dec = 1;
        for(; index<num_len; index++){
          if(sign.charAt(index)==MINUS){
            sign_dec *= -1;
          }else if(sign.charAt(index)!=PLUS && sign.charAt(index)!=SPACE){
            return null;
          }
        }
        return sign_dec;
      }
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
 * Converts a UOARNumber to an integer
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Number converted to an integer
 */
function UOARNumberToDecimalInteger(number, standardized=false, log=true){
  number = number.copy();
  number.fraction = "";
  if(!isValidUOARNumber(number)){
    addToStackTrace("UOARNumberToDecimalInteger", "Invalid number \"" + number.toSigned() + "\"", log);
    return null;
  }
  var sign_mult = getSignMultiplierForNumber(number, standardized);
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
    }
  }
  var res = 0;
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
function baseToDecimalInteger(number, base, number_type, log=true){
  number = number.split(/[.,]/)[0];
  var sign = getSign(number, base, number_type, log);
  var whole = removeSign(number, base, number_type, log);
  var num = new UOARNumber(sign, whole, "", base, number_type);
  return UOARNumberToDecimalInteger(num, false, log);
}

/**
 * Converts given nimber to base 10
 * @param {UOARNumber} number Standardized Signed Number to convert
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to base 10
 */
function toDecimal(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number === null){
      addToStackTrace("toDecimal", "Invalid number \"" + number + "\" for base " + base, log);
      return null;
    }
  }
  if(number.base==10){
    return number;
  }

  var sign = "";
  var toComplement = false;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      break;
    case NumberTypes.SIGNED:
      sign = number.sign;
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      sign = "0";
      if(number.sign.charAt(0)==toValue(number.base-1, false)){
        number = complement(number, true, log);
        toComplement = true;
      }
      break;
  }

  var whole = 0;
  for(let i = 0; i<number.whole.length; i++){
    whole = whole * number.base + getValueAt(number.whole, i, log);
  }
  whole = whole.toString();

  var fraction = 0;
  var precision = PRECISION_NUMBER / number.base;
  for(let i = 0; i<number.fraction.length; i++){
    fraction += Math.floor(getValueAt(number.fraction, i, log) * precision);
    precision = precision / number.base;
  }
  fraction = fraction.toString();
  
  var res = new UOARNumber(sign, whole, fraction, 10, number.number_type);
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
function fromDecimal(number, base, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number === null){
      addToStackTrace("fromDecimal", "Invalid number \"" + number + "\" for base 10", log);
      return null;
    }
  }
  if(number.base!=10){
    addToStackTrace("fromDecimal", "Number isn't decimal", log);
    return null;
  }
  if(base==10){
    return number;
  }

  var sign = "";
  var toComplement = false;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      break;
    case NumberTypes.SIGNED:
      sign = number.sign;
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      sign = "0";
      if(number.sign.charAt(0)==toValue(number.base-1, false)){
        number = complement(number, true, log);
        toComplement = true;
      }
      break;
  }
  
  var whole = "";
  var whole_dec = baseToDecimalInteger(number.whole, number.base, NumberTypes.UNSIGNED, log);
  do {
    whole = toValue(whole_dec%base, false).concat(whole);
    whole_dec = Math.floor(whole_dec/base);
  } while(whole_dec>0)

  var fraction = "";
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

  res = new UOARNumber(sign, whole, fraction, base, number.number_type);
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
function convertBases(number, base_to, standardized=false, log=true){
  if(!isValidBase(base_to)){
    addToStackTrace("convertBases", "Invalid base \"" + base_to + "\"", log);
    return null;
  }
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number === null){
      addToStackTrace("convertBases", "Invalid number \"" + number.toSigned() + "\" for base " + number.base, log);
      return null;
    }
  }
  
  if(number.base==base_to){
    return number;
  }
  var res = fromDecimal(toDecimal(number, true, log), base_to, true, log);
  if(res===null){
    addToStackTrace("convertBases", "Conversion error, result null", log);
  }
  return res;
}

/**
 * Trims number to specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} n Total length
 * @param {number} m Fraction length
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
function toLength(number, n, m, log=true){
  number = wholeToLength(number, n-m, false);
  if(number===null){
    addToStackTrace("toLength", "Number is too big", true);
    return null;
  }
  number = fractionToLength(number, m, log);
  return number;
}

/**
 * Trims whole part of the number to a specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} length Length of the whole
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
function wholeToLength(number, length, log=true){
  if(number.whole.length>length){
    addToStackTrace("wholeToLength", "Number is too big", log);
    return null;
  }
  var whole = number.whole;
  var toAdd = length-whole.length;
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
function fractionToLength(number, length, log=true){
  var fraction = number.fraction;;
  if(fraction.length>length){
    fraction = fraction.substr(0, length);
  }else if(fraction.length<length){
    fraction = fraction.concat(createZeroString(length-fraction.length));
  }
  number.fraction = fraction;
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
function addZeroesAfter(number, base, number_type, length, log=true){
  if(number===null){
    addToStackTrace("addZeroesAfter", "Number is null", log);
    return null;
  }
  var offset = getSignEnd(number, base, number_type, log);
  var toAdd = length - number.replace(/[.,]/, "").length - offset;
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
function addZeroesBefore(number, base, number_type, length, log=true){
  if(number===null){
    addToStackTrace("addZeroesBefore", "Number is null", log);
    return null;
  }
  var offset = getSignEnd(number, base, number_type, log);
  var toAdd = length - number.replace(/[.,]/, "").length - offset;
  var res = number.substr(0, offset);
  if(toAdd>0){
    res = res.concat(createZeroString(toAdd));
  }
  res = res.concat(number.substr(offset));
  return res;
}

/**
 * Converts the specified digit from the number to binary
 * @param {string} number Number whose digit to convert
 * @param {number} index Index of the digit to convert
 * @param {boolean} [log=true] Should log
 * @returns {string} Digit converted to binary
 */
function digitToBinary(number, index, log=true){
  var val = getValueAt(number, index, false);
  if(val===null){
    addToStackTrace("digitToBinary", "Invalid digit \"" + number.charAt(index) + "\"", log);
    return null;
  }
  var res = "";
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
function numberToBinary(number, log=true){
  if(number<0){
    addToStackTrace("numberToBinary", "Cannot convert negative number", log);
    return null;
  }
  var res = "";
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
function binaryToDigit(number, log=true){
  if(!isValidNumber(number, 2, NumberTypes.UNSIGNED)){
    addToStackTrace("binaryToDigit", "Invalid number \"" + number + "\"", log);
    return null;
  }
  var res = 0;
  var temp;
  for(let i=0; i<number.length; i++){
    temp = getValueAt(number, i, false);
    if(temp===null){
      addToStackTrace("binaryToDigit", "Invalid number \"" + number + "\"", log);
      return null;
    }
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
function decimalTo8421(number, log=true){
  var res = "";
  var temp;
  for(let i=0; i<number.length; i++){
    temp = getValueAt(number, i, log);
    if(temp===null || temp>15){
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
function decimalFrom8421(number, log=true){
  var res = "";
  var temp;
  for(let i=0; i<number.length; i+=4){
    temp = binaryToDigit(number.substr(i, 4));
    if(temp===null){
      addToStackTrace("decimalFrom8421", "Invalid number", log);
      return null;
    }
    if(temp>15){
      addToStackTrace("decimalFrom8421", "Digit out of bounds", log);
      return null;
    }
    temp = toValue(temp, log);
    res = res.concat(temp);
  }
  return res;
}

/**
 * Checks if the first number is greater than the second
 * @param {UOARNumber} number1 Number to compare
 * @param {UOARNumber} number2 Number to compare
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {boolean} True if first number is greater, false otherwise
 */
function isGreater(number1, number2, standardized=false, log=true){
  if(number1.base!=number2.base){
    addToStackTrace("isGreater", "Can't compare numbers. Bases are not equal", log);
    return null;
  }
  if(number1.number_type!=number2.number_type){
    addToStackTrace("isGreater", "Can't compare numbers. Types are not the same", log);
    return null;
  }
  if(!standardized){
    number1 = standardizeUOARNumber(number1.copy());
    number2 = standardizeUOARNumber(number2.copy());
    if(number1===null || number2===null){
      addToStackTrace("isGreater", "Invalid numbers", log);
      return null;
    }
  }

  var sign1 = getSignMultiplierForNumber(number1, true);
  var sign2 = getSignMultiplierForNumber(number2, true);
  if(sign1!=sign2){
    return sign1>sign2;
  }else{
    if(sign1==-1){
      number1 = trimNumber(complement(number1, true, log));
      number2 = trimNumber(complement(number2, true, log));
    }
    let len1 = number1.whole.length;
    let len2 = number2.whole.length;
    if(len1!=len2){
      return len1>len2;
    }else if(len1==len2){
      let val1;
      let val2;
      for(let i=0; i<len1; i++){
        val1 = getValueAt(number1.whole, i, false);
        val2 = getValueAt(number2.whole, i, false);
        if(val1!=val2){
          return val1>val2;
        }
      }
      len1 = number1.fraction.length;
      len2 = number2.fraction.length;
      let limit = len1<=len2 ? len1 : len2;
      for(let i=0; i<limit; i++){
        val1 = getValueAt(number1.fraction, i, false);
        val2 = getValueAt(number2.fraction, i, false);
        if(val1!=val2){
          return val1>val2;
        }
      }
      return len1!=len2 && (len1==limit ? false : true);
    }
    return false;
  }
}

/**
 * Finds the absolute value of the given number
 * @param {UOARNumber} number Number to operate on
 * @returns {UOARNumber} Absolute value of the number 
 */
function getAbsoluteValue(number){
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      return number.copy();
    case NumberTypes.SIGNED:
      return new UOARNumber("+", number.whole, number.fraction, number.base, NumberTypes.SIGNED);
    case NumberTypes.SMR:
      return new UOARNumber("0", number.whole, number.fraction, number.base, NumberTypes.SMR);
    case NumberTypes.OC:
    case NumberTypes.TC:
      var res = number.copy();
      if(number.sign.charAt(0)=="1"){
        res = complement(res);
      }
      return res;
  }
  return null;
}

/**
 * Makes given numbers the same length
 * @param {UOARNumber} num1 Number 1
 * @param {UOARNumber} num2 Number 2
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 */
function equalizeLength(num1, num2, standardized=false, log=true){
  if(num1.number_type!=num2.number_type){
    addToStackTrace("equalizeLength", "Numbers are not same type", log);
    return null;
  }
  if(!standardized){
    num1 = standardizeUOARNumber(num1, log);
    num2 = standardizeUOARNumber(num2, log);
    if(num1==null || num2==null){
      addToStackTrace("equalizeLength", "Numbers are invalid", log);
      return null;
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
}

/**
 * Adds two numbers together
 * @param {UOARNumber} add1 First factor
 * @param {UOARNumber} add2 Second factor
 * @param {NumberTypes} number_type Type to return
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Sum of the two numbers 
 */
function add(add1, add2, number_type, standardized=false, log=true){
  if(!isValidUOARNumber(add1) || !isValidUOARNumber(add2)){
    addToStackTrace("add", "Numbers are invalid", log);
    return null;
  }
  if(add1.base!=add2.base){
    addToStackTrace("add", "Can't add numbers. Bases are not equal");
    return null;
  }
  add1 = trimSign(add1.copy());
  add2 = trimSign(add2.copy());
  var base = add1.base;
  // if(add1.number_type!=number_type)
  //   convertType(add1, number_type);
  // if(add2.number_type!=number_type)
  //   convertType(add2, number_type);

  equalizeLength(add1, add2, standardized, log);
  var whole_len=add1.whole.length;
  var fraction_len=add1.fraction.length;

  console.log(add1);
  console.log(add2);

  var sign;
  var whole = "";
  var fraction = "";
  var carry = 0;
  var temp;
  
  switch(number_type){
    case NumberTypes.SIGNED:
      let sign1 = add1.sign;
      let sign2 = add2.sign;
      if(sign1==sign2){
        sign = sign1;
        for(let i=fraction_len-1; i>=0; i--){
          temp = getValueAt(add1.fraction, i, false) + getValueAt(add2.fraction, i, false) + carry;
          fraction = toValue(temp%base, false) + fraction;
          carry = Math.floor(temp/base);
        }
        for(let i=whole_len-1; i>=0; i--){
          temp = getValueAt(add1.whole, i, false) + getValueAt(add2.whole, i, false) + carry;
          whole = toValue(temp%base, false) + whole;
          carry = Math.floor(temp/base);
        }
        if(carry!=0){
          whole = toValue(carry, false) + whole;
        }
      }else{
        let a;
        let b;
        if(isGreater(getAbsoluteValue(add1), getAbsoluteValue(add2), false, log)){
          sign = sign1;
          a = add1;
          b = add2;
        }else{
          sign = sign2;
          a = add2;
          b = add1;
        }
        for(let i=fraction_len-1; i>=0; i--){
          temp = getValueAt(a.fraction, i, false) - getValueAt(b.fraction, i, false) + carry;
          if(temp<0){
            temp += base;
            carry = -1;
          }else{
            carry = 0;
          }
          fraction = toValue(temp) + fraction;
        }
        for(let i=whole_len-1; i>=0; i--){
          temp = getValueAt(a.whole, i, log) - getValueAt(b.whole, i, log) + carry;
          if(temp<0){
            temp += base;
            carry = -1;
          }else{
            carry = 0;
          }
          whole = toValue(temp, false) + whole;
        }
        if(carry!=0){
          whole = toValue(carry, false) + whole;
        }
      }
      break;
    case NumberTypes.OC:
    case NumberTypes.TC:
      for(let i=fraction_len-1; i>=0; i--){
        temp = getValueAt(add1.fraction, i, false) + getValueAt(add2.fraction, i, false) + carry;
        fraction = toValue(temp%base, false) + fraction;
        carry = Math.floor(temp/base);
      }
      for(let i=whole_len-1; i>=0; i--){
        temp = getValueAt(add1.whole, i, false) + getValueAt(add2.whole, i, false) + carry;
        whole = toValue(temp%base, false) + whole;
        carry = Math.floor(temp/base);
      }
      temp = getValue(add1.sign) + getValue(add2.sign) + carry;
      sign =  toValue(temp%base, false);
      if(number_type == NumberTypes.OC){
        carry = Math.floor(temp/base);
        if(carry==0)
          break;
        //TODO Add carry
      }else if(number_type == NumberTypes.TC){
        if(add1.sign.charAt(0) == add2.sign.charAt(0)){
          if(add1.sign.charAt(0)!=sign){
            whole = sign + whole;
            sign = add1.sign;
          }
        }
      }
      break;
  }
  var res = new UOARNumber(sign, whole, fraction, base, number_type);
  return res;
}

/**
 * Complements the given number
 * @param {UOARNumber} number Number to complement 
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Complemented number
 */
function complement(number, standardized=false, log=true){
  if(!isValidUOARNumber(number)){
    addToStackTrace("complement", "Number is invalid", log);
    return null;
  }
  number = number.copy();
  if(!standardized){
    trimSign(number);
  }
  var base_complement = number.base-1;
  var complement_sign = "";
  var complement_whole = "";
  var complement_fraction = "";
  var carry = 0;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      addToStackTrace("complement", "Can't complement unsigned number", log);
      return null;
    case NumberTypes.SIGNED:
      if(sign.charAt(0)==PLUS)
        complement_sign = MINUS;
      else
        complement_sign = PLUS;
      complement_whole = number.whole;
      complement_fraction = number.fraction;
      break;
    case NumberTypes.TC:
      carry = 1;
    case NumberTypes.OC:
      for(let i=number.fraction.length-1; i>=0; i--){
        temp = base_complement - getValueAt(number.fraction, i, log) + carry;
        complement_fraction = toValue(temp%number.base) + complement_fraction;
        carry = Math.floor(temp/number.base);
      }
      for(let i=number.whole.length-1; i>=0; i--){
        temp = base_complement - getValueAt(number.whole, i, log) + carry;
        complement_whole = toValue(temp%number.base) + complement_whole;
        carry = Math.floor(temp/number.base);
      }
      temp = base_complement - getValue(number.sign) + carry;
      complement_sign = toValue(temp%number.base);
      break;
  }

  var res = new UOARNumber(complement_sign, complement_whole, complement_fraction, number.base, number.number_type);
  return res;
}

/**
 * Creates a constant string with specified length
 * @param {string} constant Contents of the string
 * @param {number} length Length of the string
 * @returns {string} Constant string of specified length
 */
function createConstantString(constant, length){
  if(constant.length != 1)
    return null;
  var res = "";
  for(let i = 0; i<length; i++){
    res = res.concat(constant);
  }
  return res;
}

/**
 * Creates a zero string with specified length
 * @param {number} length Length of the string
 * @returns {string} Zero string of specified length
 */
function createZeroString(length){
  return createConstantString("0", length);
}

/**
 * Shift all numbers by specified number of places
 * @param {Object} numbers Array of UOARNumbers
 * @param {number} by Number of places to shift
 * @param {ShiftType} shift_type Shift type 
 */
function shift(numbers, by, shift_type){
  var line = "";
  var ptr = 0;
  for(let i = 0; i<numbers.length; i++){
    line = line.concat(numbers[i].sign).concat(numbers[i].whole).concat(numbers[i].fraction);
  }
  switch(shift_type){
    case ShiftTypes.RIGHT_A:
      line = createConstantString(numbers[0].sign.charAt(0), by).concat(line);
      break;
    case ShiftTypes.RIGHT_L:
      line = createZeroString(by).concat(line);
      break;
    case ShiftTypes.LEFT:
      line = line.concat(createZeroString(by));
      ptr = by;
      break;
    default:
      return;
  }
  
  var sign_len = 0;
  var whole_len = 0;
  var frac_len = 0;
  for(let i = 0; i<numbers.length; i++){
    sign_len = numbers[i].sign.length;
    whole_len = numbers[i].whole.length;
    frac_len = numbers[i].fraction.length;
    numbers[i].sign = line.substr(ptr, sign_len);
    ptr += sign_len;
    numbers[i].whole = line.substr(ptr, whole_len);
    ptr += whole_len;
    numbers[i].fraction = line.substr(ptr, frac_len);
    ptr += frac_len;
  }
}