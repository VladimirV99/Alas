var ASCII_0 = '0'.charCodeAt(0);
var ASCII_A = 'A'.charCodeAt(0);
var ASCII_PLUS = '+'.charCodeAt(0);
var ASCII_MINUS = '-'.charCodeAt(0);
var PLUS = '+';
var MINUS = '-';
var SPACE = ' ';
var RADIX = ['.', ','];

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
var NumberTypes = {
  UNSIGNED: 0,
  SIGNED: 1,
  SMR: 2,
  OC: 3,
  TC: 4,
  EK: 5
};
const number_type_description = [
  "unsigned", "signed", "SMR", "OC", "TC", "EK"
];

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
  //TODO for SMR index==0
  var temp = number.charAt(index);
  switch(number_type){
    case NumberTypes.UNSIGNED:
      return false;
    case NumberTypes.SIGNED:
      return temp==PLUS || temp==MINUS;
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
 * @returns {number} First index after the sign
 */
function getSignEnd(number, base, number_type){
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
  }
  return null;
}

/**
 * Removes sign from number
 * @param {string} number Number to remove sign from
 * @param {number} base Base of the number
 * @param {NumberType} number_type Type of the number
 * @returns {string} Number without the sign
 */
function removeSign(number, base, number_type){ 
  //TODO For checks in IEEE/DPD
  switch(number_type){
    case NumberTypes.UNSIGNED:
      return number;
    case NumberTypes.SIGNED:
      let i;
      for(i=0; i<number.length; i++){
        if(!isSignAt(number, base, number_type, i)){
          break;
        }
      }
      return number.substr(i);
  }
}

/**
 * Checks if a UOARNumber is valid
 * @param {UOARNumber} number Number to validate
 * @returns {boolean} true if valid, false otherwise.
 */
function isValidUOARNumber(number){
  if(number==null || !isValidBase(number.base)){
    return false;
  }
  var temp = "";
  for(let i=0; i<number.sign.length; i++){
    temp = number.sign.charAt(i);
    if(!isSign(temp, number.base, number.number_type) && temp!=SPACE)
      return false;
  }
  for(let i=0; i<number.whole.length; i++){
    temp = number.whole.charAt(i);
    if(temp==SPACE)
      continue;
    temp = getValue(temp, false);
    if(temp==null || temp>=number.base){
      return false;
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    temp = number.fraction.charAt(i);
    if(temp==SPACE)
      continue;
    temp = getValue(temp, false);
    if(temp==null || temp>=number.base){
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
  if(number==null || !isValidBase(base)){
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
      if(temp==null || temp>=base){
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

function runTests(){
  clearStackTrace();
  console.log(toDecimal(toUOARNumber("-10.1", 2, true)));
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
  
  var temp = "";
  number = number.replace(SPACE, "");
  var arr = number.split(/[.,]/);
  var i;
  for(i=0; i<number.length; i++){
    if(!isSignAt(number, base, number_type, i)){
      break;
    }
  }
  var sign = number.substr(0, i);
  var whole = number.substr(i, arr[0].length-i);
  var fraction = "";
  if(arr.length==2){
    fraction = arr[1];
  }
  var res = new UOARNumber(sign, whole, fraction, base, number_type);
  res = trimSign(res);
  res = trimNumber(res);
  return res;
}

/**
 * Trims the numbers sign to 1
 * @param {UOARNumber} number Number to trim
 * @returns {UOARNumber} Trimmed number
 */
function trimSign(number){
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      return number;
    case NumberTypes.SIGNED:
      var sign = 1;
      for(let i=0; i<number.sign.length; i++){
        if(number.sign.charAt(i)==MINUS){
          sign *= -1;
        }else if(number.sign.charAt(i)!=PLUS && number.sign.charAt(i)!=SPACE){
          return null;
        }
      }
      if(sign==1){
        number.sign = "+";
      }else{
        number.sign = "-";
      }
      return number;
      break;
  }
  return null;
}

/**
 * Removes excess zeroes from a number
 * @param {UOARNumber} number Number to trim
 * @returns {UOARNumber} Trimmed number 
 */
function trimNumber(number){
  for(let i=0; i<number.whole.length; i++){
    if(number.whole.charAt(i)!='0' || (number.whole.charAt(i)=='0' && number.whole.length-1==i)){
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
  return number;
}

/**
 * Modifies number to fit the standards
 * @param {UOARNumber} number Number to standardize
 * @param {boolean} log Should log
 * @returns {UOARNumber} Standardized number
 */
function standardizeUOARNumber(number, log=true){
  if(!isValidBase(number.base)){
    addToStackTrace("standardizeUOARNumber", "Invalid base \"" + number.base + "\"", log);
    return null;
  }
  if(isValidUOARNumber(number)){
    var res = new UOARNumber(number.sign.replace(SPACE, ""), number.whole.replace(SPACE, ""), number.fraction.replace(SPACE, ""), number.base, number.number_type);
    res = trimSign(res);
    res = trimNumber(res);
    return res;
  }else{
    addToStackTrace("standardizeUOARNumber", "Invalid number \"" + number.toSigned() + "\" for base " + number.base, log);
    return null;
  }
}

/**
 * Checks if the given string is a sign
 * @param {string} number String to check
 * @returns {boolean} true if string has a sign, false otherwise
 */
function hasSign(number){
  return number!=null && number.sign!=""
  // var sign = number.trim().charAt(0);
  // return sign==MINUS || sign==PLUS;
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

function getSignMultiplier(sign, base, number_type, standardized){
  if(standardized){
    switch(number_type){
      case NumberTypes.UNSIGNED:
        return 1;
      case NumberTypes.SIGNED:
        if(sign==MINUS){
          return -1;
        } else if(sign==PLUS){
          return 1;
        }
        break;
    }
  }else{
    switch(number_type){
      case NumberTypes.UNSIGNED:
        return 1;
      case NumberTypes.SIGNED:
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
  }
  return 0;
}

/**
 * Gets sign of a signed number
 * @param {UOARNumber} number Number to operate on
 * @param {boolean} standardized Treat as standardized
 * @returns {string} minus if negative, plus otherwise
 */
function getSign(number, standardized=false){
  if(standardized){
    var sign = number.charAt(0);
    switch(number.number_type){
      case SIGNED:
        if(sign==MINUS || sign==PLUS)
          return sign;
        return null;
    } 
  }else{
    switch(number.number_type){
      case NumberTypes.SIGNED:
        var num_len = number.length;
        var index = 0;
        var sign = 1;
        for(; index<num_len; index++){
          if(number.charAt(index)==MINUS){
            sign *= -1;
          }else if(number.charAt(index)!=PLUS && number.charAt(index)!=SPACE){
            break;
          }
        }
        if(sign==1){
          return "+";
        }else{
          return "-";
        }
    }
  }
  return null;
}

/**
 * Converts a UOARNumber to an integer
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Number converted to an integer
 */
function UOARNumberToDecimalInteger(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number, number.base, log);
    if(number == null){
      return null;
    }
  }

  var num_length = number.whole.length-1;
  var decimal = 0;
  var i = 0;
  while(num_length>=0){
    decimal += getValueAt(number.whole, num_length, log) * Math.pow(number.base,i);
    i++;
    num_length--;
  }

  decimal *= getSignMultiplierForNumber(number, standardized);
  return decimal;
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
  if(!isValidBase(base)){
    addToStackTrace("baseToDecimalInteger", "Invalid base \"" + base + "\"");
    return null;
  }
  var sign_end = getSignEnd(number, base, number_type);
  var whole = number.split(/[.,]/)[0].substr(sign_end);
  var num_length = whole.length-1;
  var decimal = 0;
  var i = 0;
  var temp;
  while(num_length>=0){
    temp = getValueAt(whole, num_length, log);
    if(temp==null || temp>=base){
      addToStackTrace("baseToDecimalInteger", "Invalid number \"" + number + "\" for base " + base);
      return null;
    }
    decimal += temp * Math.pow(base,i);
    i++;
    num_length--;
  }

  decimal *= getSignMultiplier(number.substr(0, sign_end), base, number_type, false);
  return decimal;
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
    number = standardizeUOARNumber(number, log);
    if(number == null){
      addToStackTrace("toDecimal", "Invalid number \"" + number + "\" for base " + base, log);
      return null;
    }
  }
  if(number.base==10){
    return number;
  }

  var num_length = number.whole.length-1;
  var whole = 0;
  let i = 0;
  while(num_length>=0){
    whole += getValueAt(number.whole, num_length, log) * Math.pow(number.base,i);
    i++;
    num_length--;
  }
  whole = whole.toString();

  var fraction = 0;
  var frac_len = number.fraction.length;
  for(let i = 0; i<frac_len; i++){
    fraction += (Math.floor(getValueAt(number.fraction, i, log) * PRECISION_NUMBER / Math.pow(number.base, i+1)));
  }
  if(fraction==0)
    fraction = "";
  else
    fraction = fraction.toString();
  
  var res = new UOARNumber(number.sign, whole, fraction, 10, number.number_type);
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
    number = standardizeUOARNumber(number, log);
    if(number == null){
      addToStackTrace("fromDecimal", "Invalid number \"" + number + "\" for base 10", log);
      return null;
    }
  }
  if(base==10){
    return number;
  }
  
  var whole = UOARNumberToDecimalInteger(number);
  var fraction = "";

  var num_arr = [];
  if(whole<0)
    whole = -whole;
  while(whole>0){
    num_arr.push(toValue(whole%base));
    whole = Math.floor(whole/base);
  }
  num_arr.reverse();
  whole = num_arr.join("");
  
  if(number.fraction!=""){
    number = fractionToLength(number, PRECISION, log);
    var frac = baseToDecimalInteger(number.fraction, number.base, number.number_type, log);
    var limit = 0;
    var temp = 0;
    while(frac>0 && limit<PRECISION){
      frac = frac*base;
      temp = Math.floor(frac/PRECISION_NUMBER);
      frac -= temp*PRECISION_NUMBER;
      fraction = fraction.concat(temp);
      limit++;
    }
  }

  return new UOARNumber(number.sign, whole, fraction, base, number.number_type);
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
  if(!isValidBase(number.base) || !isValidBase(base_to)){
    addToStackTrace("convertBases", "Invalid bases \"" + base_from + "\" and \"" + base_to + "\"", log);
    return null;
  }
  var std_val;
  if(!standardized){
    std_val = standardizeUOARNumber(number, log);
    if(std_val==null){
      addToStackTrace("convertBases", "Invalid number \"" + number + "\" for base \"" + base_from + "\"", log);
      return null;
    }
  }else{
    std_val = number;
  }
  if(number.base==base_to){
    return std_val;
  }
  var res = fromDecimal(toDecimal(std_val, true, log), base_to, true, log);
  if(res==null){
    addToStackTrace("convertBases", "Conversion error, result null", log);
  }
  return res;
}

/**
 * Trims number to specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} n Total length
 * @param {number} m Fraction length
 * @param {boolean} log Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
function toLength(number, n, m, log=true){
  var new_number;
  new_number = wholeToLength(number, n-m, log);
  if(new_number==null){
    addToStackTrace("toLength", "Too big number", log);
    return null;
  }
  new_number = fractionToLength(new_number, m, log);
  return new_number;
}

/**
 * Trims whole part of the number to a specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} length Length of the whole
 * @param {boolean} log Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
function wholeToLength(number, length, log=true){
  if(number.whole.length>length){
    addToStackTrace("wholeToLength", "Too big number", log);
    return null;
  }
  var whole = number.whole;
  switch(number.number_type){
    case NumberTypes.SIGNED:
      let toAdd = length-whole.length;
      let temp = "";
      for(let i=0; i<toAdd; i++){
        temp = temp.concat("0");
      }
      whole = temp.concat(whole);
      break;
  }
  return new UOARNumber(number.sign, whole, number.fraction, number.base, number.number_type);
}

/**
 * Trims fraction part of the number to a specified length
 * @param {UOARNumber} number Number to operate on
 * @param {number} length Length of the fraction
 * @param {boolean} log Should log
 * @returns {UOARNumber} Number trimmed to specified length
 */
function fractionToLength(number, length, log=true){
  var fraction = number.fraction;;
  if(fraction.length>length){
    fraction = fraction.substr(0, length);
  }else if(fraction.length<length){
    toAdd = length-fraction.length;
    for(let i=0; i<toAdd; i++){
      fraction = fraction.concat("0");
    }
  }
  return new UOARNumber(number.sign, number.whole, fraction, number.base, number.number_type);
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
  if(number==null){
    addToStackTrace("addZeroesAfter", "Number is null", log);
    return null;
  }
  var offset = getSignEnd(number, base, number_type);
  var toAdd = length - number.replace(/[.,]/, "").length - offset;
  var res = number;
  if(toAdd>0){
    for(let i=0; i<toAdd; i++){
      res = res.concat("0");
    }
  }
  return res;
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
  if(number==null){
    addToStackTrace("addZeroesBefore", "Number is null", log);
    return null;
  }
  var offset = getSignEnd(number, base, number_type);
  var toAdd = length - number.replace(/[.,]/, "").length - offset;
  var res = number;
  if(toAdd>0){
    res = number.substr(0, offset);
    for(let i=0; i<toAdd; i++){
      res = res.concat("0");
    }
    res = res.concat(number.substr(offset));
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
function digitToBinary(number, index, log=true){
  val = getValueAt(number, index);
  if(val==null){
    addToStackTrace("digitToBinary", "Invalid digit \"" + number.charAt(index) + "\"", log);
    return null;
  }
  var arr = [];
  while(val >0){
    arr.push((val%2).toString());
    val = Math.floor(val/2);
  }
  if(arr.length==0){
    return "0";
  }
  return arr.reverse().join("");
}

/**
 * Converts the given number to binary
 * @param {number} number Number to convert
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted to binary
 */
function numberToBinary(number, log=true){
  if(number<0){
    addToStackTrace("numberToBinary", "Negative number to convert", log);
    return null;
  }
  var arr = [];
  while(number >0){
    arr.push((number%2).toString());
    number = Math.floor(number/2);
  }
  if(arr.length==0){
    return "0";
  }
  return arr.reverse().join("");
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
  var power = 0;
  var temp;
  for(let i=number.length-1; i>=0; i--){
    temp = getValueAt(number, i);
    if(temp==null){
      addToStackTrace("binaryToDigit", "Invalid number \"" + number + "\"", log);
      return null;
    }
    res += temp * Math.pow(2, power);
    power++;
  }
  return res;
}

/**
 * Convert given decimal number to 8421
 * @param {string} number Decimal number to convert
 * @param {boolean} log Should log
 * @returns {string} Number converted to 8421 
 */
function decimalTo8421(number, log=true){
  var res = "";
  var temp;
  for(let i=0; i<number.length; i++){
    temp = getValueAt(number, i, log);
    if(temp>15){
      addToStackTrace("decimalTo8421", "Value out of bounds", log);
      return null;
    }
    temp = numberToBinary(temp);
    if(temp==null){
      addToStackTrace("decimalTo8421", "Invalid digit \"" + number.charAt(i) + "\"", log);
      return null;
    }
    temp = addZeroesBefore(temp, 2, NumberTypes.UNSIGNED, 4, log);
    res += temp;
  }
  return res;
}

/**
 * Convert given 8421 number to decimal
 * @param {string} number 8421 number to convert
 * @param {boolean} log Should log
 * @returns {string} Number converted to decimal 
 */
function decimalFrom8421(number, log=true){
  var res = "";
  var temp = 0;
  for(let i=0; i<number.length; i+=4){
    temp = binaryToDigit(number.substr(i, 4));
    if(temp==null){
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

function isGreater(number1, number2, standardized=false, log=true){
  if(number1.base!=number2.base){
    addToStackTrace("isGreater", "Can't compare numbers. Bases are not equal");
    return null;
  }
  if(number1.number_type!=number2.number_type){
    addToStackTrace("isGreater", "Can't compare numbers. Types are not the same");
    return null;
  }
  var n1, n2;
  if(!standardized){
    n1 = standardizeUOARNumber(number1);
    n2 = standardizeUOARNumber(number2);
  }else{
    n1 = number1;
    n2 = number2;
  }
  var sign1 = getSignMultiplierForNumber(n1, true);
  var sign2 = getSignMultiplierForNumber(n2, true);
  if(sign1>sign2){
    return true;
  }else if(sign1<sign2){
    return false;
  }else{
    var len1 = n1.whole.length;
    var len2 = n2.whole.length;
    if(len1>len2){
      return true;
    }else if(len1==len2){
      let val1;
      let val2;
      for(let i=0; i<len1; i++){
        val1 = getValueAt(n1.whole, i, log);
        val2 = getValueAt(n2.whole, i, log);
        if(val1>val2){
          if(sign1==1)
            return true;
          else
            return false;
        }else if(val1==val2){
          continue;
        }else{
          if(sign1==1)
            return false;
          else
            return true;
        }
      }
      len1 = n1.fraction.length;
      len2 = n2.fraction.length;
      let limit = len1<=len2 ? len1 : len2;
      var i;
      for(i=0; i<limit; i++){
        val1 = getValueAt(n1.fraction, i, log);
        val2 = getValueAt(n2.fraction, i, log);
        if(val1>val2){
          if(sign1==1)
            return true;
          else
            return false;
        }else if(val1==val2){
          continue;
        }else{
          if(sign1==1)
            return false;
          else
            return true;
        }
      }
      if(sign1==1)
        return len1==limit ? n2 : n1;
      else
        return len1==limit ? n1 : n2;
    }
    return false;
  }
}

function getAbsoluteValue(number){
  switch(number.number_type){
    case NumberTypes.SIGNED:
      return new UOARNumber("+", number.whole, number.fraction, number.base, NumberTypes.SIGNED);
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
  if(add1.base!=add2.base){
    addToStackTrace("add", "Can't add numbers. Bases are not equal");
    return null;
  }
  if(!standardized){
    add1 = standardizeUOARNumber(add1, log);
    add2 = standardizeUOARNumber(add2, log);
    if(add1==null || add2==null){
      addToStackTrace("add", "Numbers are invalid", log);
      return null;
    }
  }
  var base = add1.base;
  // if(add1.number_type!=number_type)
  //   convertType(add1, number_type);
  // if(add2.number_type!=number_type)
  //   convertType(add2, number_type);

  switch(number_type){
    case NumberTypes.SIGNED:
      var whole_len=0;
      var fraction_len=0;
      if(add1.whole.length>add2.whole.length){
        whole_len = add1.whole.length;
        add2 = wholeToLength(add2, whole_len, log);
      }else if(add1.whole.length<add2.whole.length){
        whole_len = add2.whole.length;
        add1 = wholeToLength(add1, whole_len, log);
      }else{
        whole_len = add1.whole.length;
      }
      if(add1.fraction.length>add2.fraction.length){
        fraction_len = add1.fraction.length;
        add2 = fractionToLength(add2, fraction_len, log);
      }else if(add1.fraction.length<add2.fraction.length){
        fraction_len = add2.fraction.length;
        add1 = fractionToLength(add1, fraction_len, log);
      }else{
        fraction_len = add1.fraction.length;
      }

      console.log(add1);
      console.log(add2);

      let sign;
      let whole = "";
      let fraction = "";
      var carry = 0;
      var temp;
      let sign1 = add1.sign;
      let sign2 = add2.sign;

      if(sign1==sign2){
        sign = sign1;
        for(let i=fraction_len-1; i>=0; i--){
          temp = getValueAt(add1.fraction, i, log) + getValueAt(add2.fraction, i, log) + carry;
          fraction = toValue(temp%base) + fraction;
          carry = Math.floor(temp/base);
        }
        for(let i=whole_len-1; i>=0; i--){
          temp = getValueAt(add1.whole, i, log) + getValueAt(add2.whole, i, log) + carry;
          whole = toValue(temp%base) + whole;
          carry = Math.floor(temp/base);
        }
        if(carry!=0){
          whole = toValue(carry) + whole;
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
          temp = getValueAt(a.fraction, i, log) - getValueAt(b.fraction, i, log) + carry;
          console.log(getValueAt(a.fraction, i, log) + " " + getValueAt(b.fraction, i, log) + " " + carry + " " + temp);
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
          whole = toValue(temp) + whole;
        }
        if(carry!=0){
          whole = toValue(carry) + whole;
        }
      }

      var res = new UOARNumber(sign, whole, fraction, base, number_type);
      return res;
  }


}