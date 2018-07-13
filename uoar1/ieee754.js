/** 
 * IEEE754 Format
 * @readonly
 * @typedef {number} IEEE754Format
 * @enum {IEEE754Format}
*/
const IEEE754Formats = Object.freeze({
  BINARY32: 0,
  BINARY64: 1,
  DECIMAL32DPD: 2,
  DECIMAL32BID: 3,
  HEXADECIMAL32: 4
});

/**
 * @typedef {Object} IEEE754Number
 * @property {string} sign Significand
 * @property {number} exponent Exponent
 * @property {string} significand Significand
 * @property {IEEE754Format} format Is Special Value
 */
function IEEE754Number(sign, exponent, significand, format){
  this.sign = sign;
  this.exponent = exponent;
  this.significand = significand;
  this.format = format;
  this.toString = function(){
    return this.sign + " " + this.exponent + " " + this.significand;
  }
}

 /**
  * @type {number}
  * @const
  */
var BINARY32_MAX_EXPONENT = 127;
var BINARY32_MIN_EXPONENT = -126;
var BINARY32_EXCESS = 127;
var BINARY32_EXPONENT_LENGTH = 8;
var BINARY32_SIGNIFICAND_LENGTH = 23;

var BINARY64_MAX_EXPONENT = 1023;
var BINARY64_MIN_EXPONENT = -1022;
var BINARY64_EXCESS = 1023;
var BINARY64_EXPONENT_LENGTH = 11;
var BINARY64_SIGNIFICAND_LENGTH = 52;

var DECIMAL32_MAX_EXPONENT = 96;
var DECIMAL32_MIN_EXPONENT = -95;
var DECIMAL32_EXCESS = 101;
var DECIMAL32_DIGITS = 7;
var DECIMAL32_EXPONENT_LENGTH = 11;
var DECIMAL32_SIGNIFICAND_LENGTH = 20;
var DECIMAL32_TRIPLET_LENGTH = 10;

var HEXADECIMAL32_MAX_EXPONENT = 64;
var HEXADECIMAL32_MIN_EXPONENT = -63;
var HEXADECIMAL32_EXCESS = 64;
var HEXADECIMAL32_DIGITS = 6;
var HEXADECIMAL32_EXPONENT_LENGTH = 7;
var HEXADECIMAL32_SIGNIFICAND_LENGTH = 24;

/**
 * Converts a significand and exponent to IEEE754 Binary32
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} significand*2^exponent as IEEE754 Binary32 
 */
function convertToIEEE754Binary32(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Binary32", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    significand = standardizeUOARNumber(significand.copy(), false);
    if(significand===null){
      addToStackTrace("convertToIEEE754Binary32", "Invalid significand \"" + significand.toSigned() + "\"", log);
      return null;
    }
  }
  significand = fromDecimal(significand, 2, true, false);
  if(significand.whole.length>BINARY32_SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11111111", "00000000000000000000000");
    else
      return new IEEE754Number("1", "11111111", "00000000000000000000000");
  }else{
    significand = fractionToLength(significand, BINARY32_SIGNIFICAND_LENGTH-significand.whole.length, log);
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Binary32", "Invalid exponent \"" + exponent + "\" for base 10", log);
    return null;
  }

  var normalize_exponent = normalizeBinary(significand, true, log);
  exponent = exponent + normalize_exponent;
  if(!isInBounds(exponent, BINARY32_MIN_EXPONENT, BINARY32_MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Binary32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  var res_sign = significand.sign==PLUS ? "0" : "1";
  var res_exponent = toLength(fromDecimal(trimSign(toUOARNumber((BINARY32_EXCESS+exponent).toString(), 10 , NumberTypes.SIGNED, log)), 2, true, log), BINARY32_EXPONENT_LENGTH, 0, log).toUnsigned();
  var res_significand = fractionToLength(significand, BINARY32_SIGNIFICAND_LENGTH, log).fraction;
  return new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.BINARY32);
}

/**
 * Converts a significand and exponent to IEEE754 Binary64
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} significand*2^exponent as IEEE754 Binary64 
 */
function convertToIEEE754Binary64(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Binary64", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    significand = standardizeUOARNumber(significand.copy(), false);
    if(significand===null){
      addToStackTrace("convertToIEEE754Binary64", "Invalid significand \"" + significand.toSigned() + "\"", log);
      return null;
    }
  }
  significand = fromDecimal(significand, 2, true, false);
  if(significand.whole.length>BINARY64_SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11111111111", "0000000000000000000000000000000000000000000000000000");
    else
      return new IEEE754Number("1", "11111111111", "0000000000000000000000000000000000000000000000000000");
  }else{
    significand = fractionToLength(significand, BINARY64_SIGNIFICAND_LENGTH-significand.whole.length, log);
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }

  var normalize_exponent = normalizeBinary(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, BINARY64_MIN_EXPONENT, BINARY64_MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Binary64", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  var res_sign = significand.sign==PLUS ? "0" : "1";
  var res_exponent = toLength(fromDecimal(trimSign(toUOARNumber((BINARY64_EXCESS+exponent).toString(), 10 , NumberTypes.SIGNED, log)), 2, true, log), BINARY64_EXPONENT_LENGTH, 0, log).toUnsigned();
  var res_significand = fractionToLength(significand, BINARY64_SIGNIFICAND_LENGTH, log).fraction;
  return new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.BINARY64);
}

/**
 * Converts a significand and exponent to IEEE754 Decimal32 DPD
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} significand*10^exponent as IEEE754 Decimal32 DPD
 */
function convertToIEEE754Decimal32DPD(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    significand = standardizeUOARNumber(significand.copy(), false);
    if(significand===null){
      addToStackTrace("convertToIEEE754Decimal32DPD", "Invalid significand \"" + significand.toSigned() + "\"", log);
      return null;
    }
  }
  if(significand.whole.length>DECIMAL32_SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11110000000", "00000000000000000000");
    else
      return new IEEE754Number("1", "11110000000", "00000000000000000000");
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }

  var normalize_exponent = normalizeDecimal(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, DECIMAL32_MIN_EXPONENT, DECIMAL32_MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = wholeToLength(significand, DECIMAL32_DIGITS, log);
  if(significand===null){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }

  var res_sign = significand.sign==PLUS ? "0" : "1";
  var res_exponent;
  var na = addZeroesBefore(digitToBinary(significand.whole, 0), 10, NumberTypes.UNSIGNED, 4, log);
  var nb = wholeToLength(fromDecimal(trimSign(toUOARNumber((DECIMAL32_EXCESS+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 8, log).toUnsigned();
  if(na.charAt(0)=='0'){
    res_exponent = nb.substr(0,2)+na.substr(1,3)+nb.substr(2,6);
  }else{
    res_exponent = "11"+nb.substr(0, 2)+na.charAt(3)+nb.substr(2, 6);
  }
  var res_significand;
  var nc1 = decimalToDPD(decimalTo8421(significand.whole.substr(1, 3)));
  var nc2 = decimalToDPD(decimalTo8421(significand.whole.substr(4, 3)));
  res_significand = nc1 + nc2;
  return new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.DECIMAL32DPD);
}

/**
 * Converts a significand and exponent to IEEE754 Decimal32 BID
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} significand*10^exponent as IEEE754 Decimal32 BID 
 */
function convertToIEEE754Decimal32BID(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    significand = standardizeUOARNumber(significand.copy(), false);
    if(significand===null){
      addToStackTrace("convertToIEEE754Decimal32BID", "Invalid significand \"" + significand.toSigned() + "\"", log);
      return null;
    }
  }
  if(significand.whole.length>DECIMAL32_SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11110000000", "00000000000000000000");
    else
      return new IEEE754Number("1", "11110000000", "00000000000000000000");
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }

  var normalize_exponent = normalizeDecimal(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, DECIMAL32_MIN_EXPONENT, DECIMAL32_MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Decimal32BID", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = wholeToLength(fromDecimal(significand, 2, true, log), 1+BINARY32_SIGNIFICAND_LENGTH, log);
  if(significand===null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }

  var res_sign = significand.sign==PLUS ? "0" : "1";
  var res_exponent;
  var na = significand.whole.substr(0,4);
  var nb = wholeToLength(fromDecimal(trimSign(toUOARNumber((DECIMAL32_EXCESS+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 8, log).toUnsigned();
  if(na.charAt(0)=='0'){
    res_exponent = nb+na.substr(1,3);
  }else{
    res_exponent = "11"+nb+na.charAt(3);
  }
  var res_significand = significand.whole.substr(4);
  return new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.DECIMAL32BID);
}

/**
 * Converts a significand and exponent to IEEE754 Hexadecimal32
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} significand*16^exponent as IEEE754 Hexadecimal32 
 */
function convertToIEEE754Hexadecimal32(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    significand = standardizeUOARNumber(significand.copy(), false);
    if(significand===null){
      addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid significand \"" + significand.toSigned() + "\"", log);
      return null;
    }
  }
  if(significand.whole.length>HEXADECIMAL32_SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11111111", "00000000000000000000000");
    else
      return new IEEE754Number("1", "11111111", "00000000000000000000000");
  }
  significand = fromDecimal(significand, 16, true, log);
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }

  var normalize_exponent = normalizeHexadecimal(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, HEXADECIMAL32_MIN_EXPONENT, HEXADECIMAL32_MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  var res_sign = significand.sign==PLUS ? "0" : "1";
  var res_exponent = toLength(fromDecimal(trimSign(toUOARNumber((HEXADECIMAL32_EXCESS+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), HEXADECIMAL32_EXPONENT_LENGTH, 0, log).toUnsigned();
  var res_significand = decimalTo8421(significand.fraction);
  return new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.HEXADECIMAL32);
}

/**
 * Normalizes a number according to IEEE754 Binary
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Normalization exponent for number
 */
function normalizeBinary(number, standardized=false, log=true){
  if(!standardized){
    standardizeUOARNumber(number, false);
    if(number===null){
      addToStackTrace("normalizeBinary", "Invalid number \"" + number.toSigned() + "\" for base 2", log);
      return null;
    }
  }
  var normalize_exponent = 0;
  if(number.whole=="0"){
    for(let i=0; i<number.fraction.length; i++){
      if(number.fraction.charAt(i)!='0'){
        normalize_exponent = -i-1;
        number.fraction = number.fraction.substr(i+1);
        number.whole = "1";
        break;
      }
    }
    if(number.whole=="0"){
      number.fraction = "0";
    }
  }else{
    normalize_exponent = number.whole.length-1;
    number.fraction = number.whole.substr(1) + number.fraction;
    number.whole = "1";
  }
  return normalize_exponent;
}

/**
 * Normalizes a number according to IEEE754 Decimal
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Normalization exponent for number
 */
function normalizeDecimal(number, standardized=false, log=true){
  if(!standardized){
    standardizeUOARNumber(number, false);
    if(number===null){
      addToStackTrace("normalizeDecimal", "Invalid number \"" + number.toSigned() + "\" for base 10", log);
      return null;
    }
  }
  if(number.whole.length>DECIMAL32_DIGITS){
    addToStackTrace("normalizeDecimal", "Number is too large, must be less than " + DECIMAL32_DIGITS + " digits", log);
    return null;
  }
  var normalize_exponent = 0;
  if(number.fraction!=""){
    let carry = 0;
    if(number.fraction.length>DECIMAL32_DIGITS-number.whole.length){
      let round = number.fraction.charAt(DECIMAL32_DIGITS-number.whole.length);
      if(round>5 || (round==5 && number.fraction.charAt(DECIMAL32_DIGITS-number.whole.length)%2==1)){
        carry = 1;
      }
    }
    normalize_exponent = Math.max(-number.fraction.length, -DECIMAL32_DIGITS+number.whole.length);
    number.whole = number.whole + number.fraction.substr(0, DECIMAL32_DIGITS-number.whole.length);
    number.fraction = "";
    if(carry>0){
      let new_number = add(number, new UOARNumber(number.sign, "1", "", 10, NumberTypes.SIGNED), NumberTypes.SIGNED, true, log);
      if(new_number===null){
        addToStackTrace("normalizeDecimal", "Rounding error");
        return null;
      }
      if(new_number.whole.length<=DECIMAL32_DIGITS){
        number.whole = new_number.whole;
      }
    }
  }else{
    let i;
    for(i=number.whole.length-1; i>=0; i--){
      if(number.whole.charAt(i)!='0'){
        normalize_exponent = number.whole.length-i-1;
        break;
      }
    }
    number.whole = number.whole.substr(0, i+1);
  }
  return normalize_exponent;
}

/**
 * Normalizes a number according to IEEE754 Hexadecimal
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Normalization exponent for number
 */
function normalizeHexadecimal(number, standardized=false, log=true){
  if(!standardized){
    standardizeUOARNumber(number, false);
    if(number===null){
      addToStackTrace("normalizeHexadecimal", "Invalid number \"" + number.toSigned() + "\" for base 16", log);
      return null;
    }
  }
  if(number.whole.length>HEXADECIMAL32_DIGITS){
    addToStackTrace("normalizeDecimal", "Number is too large, must be less than " + HEXADECIMAL32_DIGITS + " digits", log);
    return null;
  }
  var normalize_exponent = 0;
  for(let i=0; i<number.whole.length; i++){
    if(number.whole.charAt(i)!='0'){
      normalize_exponent = number.whole.length-i;
      number.fraction = number.whole.substr(i) + number.fraction;
      number.whole="0";
      fractionToLength(number, HEXADECIMAL32_DIGITS, log);
      return normalize_exponent;
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    if(number.fraction.charAt(i)!='0'){
      normalize_exponent = -i;
      number.fraction = number.fraction.substr(i);
      number.whole="0";
      fractionToLength(number, HEXADECIMAL32_DIGITS, log);
      return normalize_exponent;
    }
  }
}

/**
 * Converts decimal number to DPD
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {string} Decimal number converted to DPD 
 */
function decimalToDPD(number, log=true){
  if(!isValidNumber(number, 2, NumberTypes.UNSIGNED)){
    addToStackTrace("decimalToDPD", "Invalid number \"" + number + "\"", log);
    return null;
  }

  var res =  "";
  
  if(number.length<12){
    number = addZeroesBefore(number, 12);
  }else if(number.length>12){
    res = res.concat(decimalToDPD(number.substr(0, number.length-12), log));
    number = number.substr(number.length-12, 12);
  }

  aei = number.charAt(0) + number.charAt(4) + number.charAt(8);
  if(aei=="000"){
    res = res.concat(number.substr(1,3) + number.substr(5, 3) + "0" + number.substr(9, 3));
  }else if(aei=="001"){
    res = res.concat(number.substr(1, 3) + number.substr(5, 3) + "100" + number.charAt(11));
  }else if(aei=="010"){
    res = res.concat(number.substr(1, 3) + number.substr(9, 2) + number.charAt(7) + "101" + number.charAt(11));
  }else if(aei=="100"){
    res = res.concat(number.substr(9, 2) + number.charAt(3) + number.substr(5, 3) + "110" + number.charAt(11));
  }else if(aei=="110"){
    res = res.concat(number.substr(9, 2) + number.charAt(3) + "00" + number.charAt(7) + "111" + number.charAt(11));
  }else if(aei=="101"){
    res = res.concat(number.substr(5, 2) + number.charAt(3) + "01" + number.charAt(7) + + "111" + number.charAt(11));
  }else if(aei=="011"){
    res = res.concat(number.substr(1, 3) + "10" + number.charAt(7) + "111" + number.charAt(11));
  }else if(aei=="111"){
    res = res.concat("00" + number.charAt(3) + "11" + number.charAt(7) + "111" + number.charAt(11));
  }

  return res;
}

/**
 * Converts DPD to decimal number
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {string} DPD converted to decimal number
 */
function DPDtoDecimal(number, log=true){
  if(!isValidNumber(number, 2, NumberTypes.UNSIGNED)){
    addToStackTrace("DPDtoDecimal", "Invalid number \"" + number + "\"", log);
    return null;
  }

  var res =  "";
  
  if(number.length<10){
    number = addZeroesBefore(number, 10);
  }else if(number.length>10){
    res = res.concat(DPDtoDecimal(number.substr(0, number.length-10), log));
    number = number.substr(number.length-10, 10);
  }

  vwxst = number.substr(6, 3) + number.substr(3, 2);
  if(vwxst.charAt(0)=="0"){
    res = res.concat("0" + number.substr(0, 3) + "0" + number.substr(3, 3) + "0" + number.substr(7,3));
  }else{
    let temp = vwxst.substr(1,2);
    if(temp=="00"){
      res = res.concat("0" + number.substr(0, 3) + "0" + number.substr(3, 3) + "100" + number.charAt(9));
    }else if(temp=="01"){
      res = res.concat("0" + number.substr(0, 3) + "100" + number.charAt(5) + "0" + number.substr(3,2) + number.charAt(9));
    }else if(temp=="10"){
      res = res.concat("100" + number.charAt(2) + "0" + number.substr(3, 3) + "0" + number.substr(0, 2) + number.charAt(9));
    }else{
      temp = vwxst.substr(3,2);
      if(temp=="00"){
        res = res.concat("100" + number.charAt(2) + "100" + number.charAt(5) + "0" + number.substr(0, 2) + number.charAt(9));
      }else if(temp=="01"){
        res = res.concat("100" + number.charAt(2) + "0" + number.substr(0, 2) + number.charAt(5) + "100" + number.charAt(9));
      }else if(temp=="10"){
        res = res.concat("0" + number.substr(0, 3) + "100" + number.charAt(5) + "100" + number.charAt(9));
      }else{
        res = res.concat("100" + number.charAt(2) + "100" + number.charAt(5) + "100" + number.charAt(9));
      }
    }
  }

  return res;
}

/**
 * Checks if number is a valid IEEE754 number
 * @param {string} number Number to check
 * @param {number} length Length of IEEE754 form
 * @returns {boolean} True if number is valid IEEE754, false otherwise 
 */
function isValidIEEE754(number, length){
  if(number===null || number.length!=length){ //rm number.length!=length
    return false;
  }
  //switch(number.format){
    //Check format return number.sign.length!=1 && number.exponent.length!=FORMAT_LEN
    //if(...){ return false; }
  //}
  var temp;
  for(let i=0; i<number.length; i++){
    temp = number.charAt(i);
    if(temp!="1" && temp!="0"){
      return false;
    }
  }
  return true;
}

/**
 * Gets an IEEE754Binary32 special value of number
 * @param {string} number Number to operate on
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Special} Special value of number or null
 */
function getSpecialValueBinary32(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("getSpecialValueBinary32", "Invalid IEEE754 Binary32 number \"" + number + "\"", log);
    return null;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = "-";
  }else{
    sign = "+";
  }
  var exponent = number.substr(1, 8);
  var significand = number.substr(9, 23);

  if(exponent=="00000000" && significand=="00000000000000000000000"){
    return {"value": sign+"0", "special":true};
  }else if(exponent=="11111111"){
    if(significand=="00000000000000000000000"){
      return {"value": sign+"inf", "special":true};
    }else{
      if(significand.charAt(0)=="0"){
        return {"value": "sNan", "special": true};
      }else{
        return {"value": "qNan", "special": true};
      }
    }
  }

  return null;
}

/**
 * Gets an IEEE754Binary64 special value of number
 * @param {string} number Number to operate on
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Special} Special value of number or null
 */
function getSpecialValueBinary64(number, log=true){
  if(!isValidIEEE754(number, 64)){
    addToStackTrace("getSpecialValueBinary64", "Invalid IEEE754 Binary64 number \"" + number + "\"", log);
    return null;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = "-";
  }else{
    sign = "+";
  }
  var exponent = number.substr(1, 8);
  var significand = number.substr(9, 23);

  if(exponent=="00000000000" && significand=="0000000000000000000000000000000000000000000000000000"){
    return {"value": sign+"0", "special":true};
  }else if(exponent=="11111111111"){
    if(significand=="0000000000000000000000000000000000000000000000000000"){
      return {"value": sign+"inf", "special":true};
    }else{
      if(significand.charAt(0)=="0"){
        return {"value": "sNan", "special": true};
      }else{
        return {"value": "qNan", "special": true};
      }
    }
  }

  return null;
}

/**
 * Gets an IEEE754Decimal32 special value of number
 * @param {string} number Number to operate on
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Special} Special value of number or null
 */
function getSpecialValueDecimal32(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("getSpecialValueDecimal32", "Invalid IEEE754 Decimal32 number \"" + number + "\"", log);
    return null;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = "-";
  }else{
    sign = "+";
  }
  var exponent = number.substr(1, 8);
  var significand = number.substr(9, 23);

  if(exponent.substr(0, 2)!="11" && exponent.substr(2, 3)=="000" && significand=="00000000000000000000"){
    return {"value": sign+"0", "special":true};
  }else if(exponent.substr(0, 4)=="1111"){
    if(exponent.charAt(4)=="0"){
      return {"value": sign+"inf", "special":true};
    }else{
      if(exponent.charAt(5)=="0"){
        return {"value": "qNan", "special": true};
      }else{
        return {"value": "sNan", "special": true};
      }
    }
  }

  return null;
}

/**
 * Converts an IEEE754 Binary32 to a significand and exponent
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Nonspecial} Object containing significand and exponent
 */
function convertFromIEEE754Binary32(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("convertFromIEEE754Binary32", "Invalid IEEE754 Binary32 number \"" + number + "\"", log);
    return null;
  }

  var res = getSpecialValueBinary32(number);
  if(res!=null){
    return res;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = MINUS;
  }else{
    sign = PLUS;
  }

  var significand;
  var exponent = baseToDecimalInteger(number.substr(1, BINARY32_EXPONENT_LENGTH), 2, NumberTypes.UNSIGNED, log) - BINARY32_EXCESS;

  if(exponent==-BINARY32_EXCESS){
    let temp = trimNumber(new UOARNumber(sign, "0", number.substr(1+BINARY32_EXPONENT_LENGTH, BINARY32_SIGNIFICAND_LENGTH), 2, NumberTypes.SIGNED));
    exponent += 1+getNormalizeExponentBinary(temp, true, log);
    significand = normalizeBinary(temp);
  }else{
    significand = trimNumber(new UOARNumber(sign, "1", number.substr(1+BINARY32_EXPONENT_LENGTH, BINARY32_SIGNIFICAND_LENGTH), 2, NumberTypes.SIGNED));
  }

  let whole = significand.whole!="0";
  let len = (whole? 1 : 0) + significand.fraction.length;
  if(len!=1){
    if(!whole)
      significand.whole="";
    if(exponent>=0 && exponent<10){
      significand.whole = significand.whole.concat(significand.fraction.substr(0, exponent));
      significand.fraction = significand.fraction.substr(exponent);
      exponent = 0;
    }else{
      if(len<9){
        exponent -= significand.fraction.length;
        significand.whole = significand.whole.concat(significand.fraction);
        significand.fraction = "";
      }else if(len<14){
        exponent -= 8-(whole? 1 : 0);
        significand.whole = significand.whole.concat(significand.fraction.substr(0, 8-(whole? 1 : 0)));
        significand.fraction = significand.fraction.substr(8-(whole? 1 : 0));
      }else{
        exponent -= len-5-(whole? 1 : 0);
        significand.whole = significand.whole.concat(significand.fraction.substr(0, len-5-(whole? 1 : 0)));
        significand.fraction = significand.fraction.substr(len-5-(whole? 1 : 0));
      }
    }
  }

  significand = toDecimal(significand, true, log);

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}

/**
 * Converts an IEEE754 Binary64 to a significand and exponent
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Nonspecial} Object containing significand and exponent
 */
function convertFromIEEE754Binary64(number, log=true){
  if(!isValidIEEE754(number, 64)){
    addToStackTrace("convertFromIEEE754Binary64", "Invalid IEEE754 Binary64 number \"" + number + "\"", log);
    return null;
  }

  var res = getSpecialValueBinary64(number);
  if(res!=null){
    return res;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = MINUS;
  }else{
    sign = PLUS;
  }

  var significand;
  var exponent = baseToDecimalInteger(number.substr(1, BINARY64_EXPONENT_LENGTH), 2, NumberTypes.UNSIGNED, log) - BINARY64_EXCESS;

  if(exponent==-BINARY64_EXCESS){
    let temp = trimNumber(new UOARNumber(sign, "0", number.substr(1+BINARY64_EXPONENT_LENGTH, BINARY64_SIGNIFICAND_LENGTH), 2, NumberTypes.SIGNED));
    exponent += 1+getNormalizeExponentBinary(temp, true, log);
    significand = normalizeBinary(temp);
  }else{
    significand = trimNumber(new UOARNumber(sign, "1", number.substr(1+BINARY64_EXPONENT_LENGTH, BINARY64_SIGNIFICAND_LENGTH), 2, NumberTypes.SIGNED));
  }

  let whole = significand.whole!="0";
  let len = (whole? 1 : 0) + significand.fraction.length;
  if(len!=1){
    if(!whole)
      significand.whole="";
    if(exponent>=0 && exponent<10){
      significand.whole = significand.whole.concat(significand.fraction.substr(0, exponent));
      significand.fraction = significand.fraction.substr(exponent);
      exponent = 0;
    }else{
      if(len<9){
        exponent -= significand.fraction.length;
        significand.whole = significand.whole.concat(significand.fraction);
        significand.fraction = "";
      }else if(len<14){
        exponent -= 8-(whole? 1 : 0);
        significand.whole = significand.whole.concat(significand.fraction.substr(0, 8-(whole? 1 : 0)));
        significand.fraction = significand.fraction.substr(8-(whole? 1 : 0));
      }else{
        exponent -= len-5-(whole? 1 : 0);
        significand.whole = significand.whole.concat(significand.fraction.substr(0, len-5-(whole? 1 : 0)));
        significand.fraction = significand.fraction.substr(len-5-(whole? 1 : 0));
      }
    }
  }

  significand = toDecimal(significand, true, log);

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}

/**
 * Converts an IEEE754 Decimal32 DPD to a significand and exponent
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Nonspecial} Object containing significand and exponent
 */
function convertFromIEEE754Decimal32DPD(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("convertFromIEEE754Decimal32DPD", "Invalid IEEE754 Decimal32 number \"" + number + "\"", log);
    return null;
  }

  var res = getSpecialValueDecimal32(number);
  if(res!=null){
    return res;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = MINUS;
  }else{
    sign = PLUS;
  }

  var significand;
  var comb = "";
  if(number.substr(1, 2)=="11"){
    significand = "100" + number.charAt(5);
    comb = number.substr(3, 2) + number.substr(6, 6);
  }else{
    significand = "0" + number.substr(3, 3);
    comb = number.substr(1,2) + number.substr(6, 6);
  }

  var exponent = baseToDecimalInteger(comb, 2, NumberTypes.UNSIGNED, log);
  if(exponent==0){
    exponent = -DECIMAL32_EXCESS - DECIMAL32_DIGITS;
  }else{
    exponent -= DECIMAL32_EXCESS;
  }

  significand = significand + DPDtoDecimal(number.substr(1+DECIMAL32_EXPONENT_LENGTH, DECIMAL32_TRIPLET_LENGTH), log) + DPDtoDecimal(number.substr(1+DECIMAL32_EXPONENT_LENGTH+DECIMAL32_TRIPLET_LENGTH, DECIMAL32_TRIPLET_LENGTH, log));
  significand = trimNumber(new UOARNumber(sign, decimalFrom8421(significand, log), "", 10, NumberTypes.SIGNED));

  let normalize_exponent = getNormalizeExponentDecimal(significand, true, log);
  if(normalize_exponent>0){
    exponent += normalize_exponent;
    significand = normalizeDecimal(significand, true, log);
  }

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}

/**
 * Converts an IEEE754 Decimal32 BID to a significand and exponent
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Nonspecial} Object containing significand and exponent
 */
function convertFromIEEE754Decimal32BID(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("convertFromIEEE754Decimal32BID", "Invalid IEEE754 Decimal32 number \"" + number + "\"", log);
    return null;
  }

  var res = getSpecialValueDecimal32(number);
  if(res!=null){
    return res;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = MINUS;
  }else{
    sign = PLUS;
  }

  var significand;
  var comb = "";
  if(number.substr(1, 2)=="11"){
    significand = "100" + number.charAt(11);
    comb = number.substr(3, 8);
  }else{
    significand = "0" + number.substr(9, 3);
    comb = number.substr(1, 8);
  }

  var exponent = baseToDecimalInteger(comb, 2, NumberTypes.UNSIGNED, log);
  if(exponent==0){
    exponent = -DECIMAL32_EXCESS - DECIMAL32_DIGITS;
  }else{
    exponent -= DECIMAL32_EXCESS;
  }

  significand = significand + number.substr(1+DECIMAL32_EXPONENT_LENGTH, DECIMAL32_SIGNIFICAND_LENGTH);
  significand = trimNumber(toDecimal(new UOARNumber(sign, significand, "", 2, NumberTypes.SIGNED), false, log));

  let normalize_exponent = getNormalizeExponentDecimal(significand, true, log);
  if(normalize_exponent>0){
    exponent += normalize_exponent;
    significand = normalizeDecimal(significand, true, log);
  }

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}

/**
 * Converts an IEEE754 Hexadecimal32 to a significand and exponent
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Nonspecial} Object containing significand and exponent
 */
function convertFromIEEE754Hexadecimal32(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("convertFromIEEE754Hexadecimal32", "Invalid IEEE754 Hexadecimal32 number \"" + number + "\"", log);
    return null;
  }

  var sign = "";
  if(number.charAt(0)=="1"){
    sign = MINUS;
  }else{
    sign = PLUS;
  }

  var exponent = baseToDecimalInteger(number.substr(1, HEXADECIMAL32_EXPONENT_LENGTH), 2, NumberTypes.UNSIGNED, log);
  exponent -= HEXADECIMAL32_EXCESS;

  significand = trimNumber(new UOARNumber(sign, "0", decimalFrom8421(number.substr(1+HEXADECIMAL32_EXPONENT_LENGTH, HEXADECIMAL32_SIGNIFICAND_LENGTH)), 16, NumberTypes.SIGNED));

  let len = significand.fraction.length;
  if(exponent>=0 && exponent<6){
    significand.whole = significand.fraction.substr(0, exponent);
    significand.fraction = significand.fraction.substr(exponent);
    exponent = 0;
  }else{
    if(len<6){
      exponent += significand.fraction.length;
      significand.whole = significand.fraction;
      significand.fraction = "";
    }else if(len<9){
      exponent -= 6;
      significand.whole = significand.fraction.substr(0, 6);
      significand.fraction = significand.fraction.substr(6);
    }else{
      exponent -= len-3;
      significand.whole = significand.fraction.substr(0, len-3);
      significand.fraction = significand.fraction.substr(len-3);
    }
  }

  significand = toDecimal(significand, false, log);

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}