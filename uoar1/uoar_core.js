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
function toValue(value, log = true){
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
      var i;
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
  // tests.push({"test": toUOARNumber("+-+003.140", 5, true), "result": {"sign":"-","whole":"3","fraction":"14","number_type":NumberTypes.SIGNED,"base":5}});
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
 * @param {string} number Number to standardize
 * @param {number} base Base of the number
 * @param {boolean} log Should log
 * @returns {string} Standardized number
 */
function standardizeUOARNumber(number, log=true){
  if(!isValidBase(number.base)){
    addToStackTrace("standardizeUOARNumber", "Invalid base \"" + number.base + "\"", log);
    return null;
  }
  if(isValidUOARNumber(number)){
    number.sign = number.sign.replace(SPACE, "");
    number.whole = number.whole.replace(SPACE, "");
    number.fraction = number.fraction.replace(SPACE, "");
    number = trimSign(number);
    number = trimNumber(number);
    return number;
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
 * Gets sign multiplier for a signed number
 * @param {string} number Number to operate on
 * @param {boolean} [standardized=false] Treat as standardized 
 * @returns {number} 1 if positive, -1 if negative, 0 if invalid
 */
function getSignMultiplier(number, standardized=false){
  //TODO Switch type
  if(standardized){
    var sign = number.sign;
    if(sign==MINUS){
      return -1;
    } else if(sign==PLUS){
      return 1;
    }
  }else{
    var num_len = number.sign.length;
    var index = 0;
    var sign = 1;
    for(; index<num_len; index++){
      if(number.sign.charAt(index)==MINUS){
        sign *= -1;
      }else if(number.sign.charAt(index)!=PLUS && number.sign.charAt(index)!=SPACE){
        //Invalid sign
        return null;
      }
    }
    return sign;
  }
  return 0;
}

/**
 * Gets sign of a signed number
 * @param {string} number Number to operate on
 * @param {boolean} standardized Treat as standardized
 * @returns {string} minus if negative, plus otherwise
 */
function getSign(number, standardized=false){
  if(standardized){
    var sign = number.charAt(0);
    if(sign==MINUS){
      return "-";
    } else if(sign==PLUS){
      return "+";
    } else{
      return null;
    }
  }else{
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

/**
 * Converts a string to an integer
 * @param {string} number Number to convert 
 * @param {number} base Base of the number
 * @param {boolean} standardized Treat as standardized
 * @param {boolean} log Should log
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

  decimal *= getSignMultiplier(number, standardized);
  return decimal;
}

function baseToDecimalInteger(number, base, standardized=false, log=true){
  if(!isValidBase(base)){
    addToStackTrace("baseToDecimalInteger", "Invalid base \"" + base + "\"");
    return null;
  } 
  if(!standardized){
    number = standardizeNumber(number, base, log);
    if(number == null){
      return null;
    }
  }

  var radix = number.split(/[.,]/);
  var num_length = radix[0].length-1;
  var decimal = 0;
  var i = 0;
  while(num_length>0){
    decimal += getValueAt(radix[0], num_length, log) * Math.pow(base,i);
    i++;
    num_length--;
  }

  decimal *= getSignMultiplier(number, standardized);
  return decimal;
}

/**
 * Converts given nimber from given base to base 10
 * @param {string} number Standardized Signed Number to convert
 * @param {number} base Base to convert from
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted to base 10
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
  fraction = fraction.toString();
  
  var res = new UOARNumber(number.sign, whole, fraction, 10, number.number_type);
  return trimNumber(res);
}

/**
 * Converts given standardized signed nimber from base 10 to the given base
 * @param {string} number Number to convert from decimal 
 * @param {number} base Base to convert to
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns Number converted to specified base
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
    var frac = UOARNumberToDecimalInteger(new UOARNumber(number.sign, number.fraction, "", number.base, number.number_type), false, true);
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
 * Converts a number from base_from to base_to
 * @param {string} number Number to convert 
 * @param {number} base_from Base to convert from
 * @param {number} base_to Base to convert to
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted from base_from to base_to
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
  var res = fromDecimal(toDecimal(std_val, number.base, true), base_to, true);
  if(res==null){
    addToStackTrace("convertBases", "Conversion error, result null", log);
  }
  return res;
}

function fractionToLength(number, length, log=true){
  return toLength(number, number.whole.length+length, length, log);
}

function wholeToLength(number, length, log=true){
  return toLength(number, length+number.fracton.length, number.fraction.length, log);
}

function toLength(number, n, m, log=true){
  if(number.whole.length>n-m){
    addToStackTrace("toLength", "Too big number", log);
    return null;
  }
  switch(number.number_type){
    case NumberTypes.SIGNED:
      let toAdd = n-m-number.whole.length;
      let temp = "";
      for(let i=0; i<toAdd; i++){
        temp = temp.concat("0");
      }
      number.whole = temp.concat(number.whole);

      
      break;
  }

  if(number.fraction.length>m){
    number.fraction.length = number.fraction.substr(0, m);
  }else if(number.fraction.length<m){
    toAdd = m-number.fraction.length;
    for(let i=0; i<toAdd; i++){
      number.fraction = number.fraction.concat("0");
    }
  }

  return number;
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
function digitToBinary(number, log=true){
  if(number<0){
    addToStackTrace("digitToBinary", "Negative number to convert", log);
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
  if(!isNumberValid(number, 2)){
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
    temp = getValueAt(number, i);
    if(temp>15){
      addToStackTrace("decimalTo8421", "Value out of bounds", log);
      return null;
    }
    temp = digitToBinary(temp);
    if(temp==null){
      addToStackTrace("decimalTo8421", "Invalid digit \"" + number.charAt(i) + "\"", log);
      return null;
    }
    temp = addZeroesBefore(temp, 4);
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