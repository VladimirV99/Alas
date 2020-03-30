import { 
  PLUS, MINUS, SPACE_REPLACE, NumberTypes, UOARNumber, isValidNumber, standardizeUOARNumber, toUOARNumber,
  toLength, trimSign, trimNumber, wholeToLength, fractionToLength, addZeroesBefore
} from './uoar_core.mjs';
import { add } from './uoar_arithmetic.mjs';
import { baseToDecimalInteger, fromDecimal, toDecimal, digitToBinary, decimalFrom8421, decimalTo8421 } from './base_converter.mjs';
import { isInBounds } from './util.mjs'; 
import { addToStackTrace } from './output.mjs';

/** 
 * IEEE754 Format
 * @readonly
 * @typedef {number} IEEE754Format
 * @enum {IEEE754Format}
*/
export const IEEE754Formats = Object.freeze({
  BINARY32: 0,
  BINARY64: 1,
  DECIMAL32DPD: 2,
  DECIMAL32BID: 3,
  HEXADECIMAL32: 4
});

/**
 * @typedef {Object} SignificandExponentPair
 * @property {UOARNumber} significand Significand
 * @property {number} exponent Exponent 
 * @property {string} value Value
 */
export class SignificandExponentPair {
  constructor(significand, base, exponent, value=""){
    this.significand = significand;
    this.base = base;
    this.exponent = exponent;
    this.value = value;
  }
  isSpecialValue(){
    return this.significand===null;
  }
  toString(){
    if(this.significand===null)
      return this.value;
    return this.significand.toSigned();
  }
}

export const POS_ZERO = new SignificandExponentPair(null, 0, 0, "+0");
export const NEG_ZERO = new SignificandExponentPair(null, 0, 0, "-0");
export const POS_INF = new SignificandExponentPair(null, 0, 0, "+Inf");
export const NEG_INF = new SignificandExponentPair(null, 0, 0, "-Inf");
export const QNAN = new SignificandExponentPair(null, 0, 0, "qNaN");
export const SNAN = new SignificandExponentPair(null, 0, 0, "sNaN");

/**
 * @typedef {Object} IEEE754Number
 * @property {string} sign Significand
 * @property {number} exponent Exponent
 * @property {string} significand Significand
 * @property {IEEE754Format} format Is Special Value
 */
export class IEEE754Number {
  constructor(sign, exponent, significand, format){
    this.sign = sign;
    this.exponent = exponent;
    this.significand = significand;
    this.format = format;
  }
  toString(){
    return this.sign + " " + this.exponent + " " + this.significand;
  }
  toFormatString(){
    return this.sign + " " + this.exponent + " " + this.significand + "(" + this.getFormat() + ")";
  }
  getFormat(){
    switch(this.format){
      case IEEE754Formats.BINARY32:
        return "bin32";
      case IEEE754Formats.BINARY64:
        return "bin64";
      case IEEE754Formats.DECIMAL32DPD:
        return "dec32dpd";
      case IEEE754Formats.DECIMAL32BID:
        return "dec32bid";
      case IEEE754Formats.HEXADECIMAL32:
        return "hex32";
      default:
        return "invalid";
    }
  }
}

export const BINARY32_SPECIAL_VALUES = Object.freeze({
  POS_ZERO: new IEEE754Number("0", "00000000", "00000000000000000000000", IEEE754Formats.BINARY32),
  NEG_ZERO: new IEEE754Number("1", "00000000", "00000000000000000000000", IEEE754Formats.BINARY32),
  POS_INF: new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32),
  NEG_INF: new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32),
  QNAN: new IEEE754Number("0", "11111111", "01000000000000000000000", IEEE754Formats.BINARY32),
  SNAN: new IEEE754Number("0", "11111111", "11000000000000000000000", IEEE754Formats.BINARY32)
});

export const BINARY32 = Object.freeze({
  MAX_EXPONENT: 127,
  MIN_EXPONENT: -126,
  OFFSET: 127,
  EXPONENT_LENGTH: 8,
  SIGNIFICAND_LENGTH: 23
});

export const BINARY64 = Object.freeze({
  MAX_EXPONENT: 1023,
  MIN_EXPONENT: -1022,
  OFFSET: 1023,
  EXPONENT_LENGTH: 11,
  SIGNIFICAND_LENGTH: 52
});

export const DECIMAL32 = Object.freeze({
  MAX_EXPONENT: 96,
  MIN_EXPONENT: -95,
  OFFSET: 101,
  DIGITS: 7,
  EXPONENT_LENGTH: 11,
  SIGNIFICAND_LENGTH: 20,
  TRIPLET_LENGTH: 10
});

export const HEXADECIMAL32 = Object.freeze({
  MAX_EXPONENT: 64,
  MIN_EXPONENT: -63,
  OFFSET: 64,
  DIGITS: 6,
  EXPONENT_LENGTH: 7,
  SIGNIFICAND_LENGTH: 24
});

/**
 * Converts a significand and exponent to IEEE754 Binary32
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} significand*2^exponent as IEEE754 Binary32 
 */
export function convertToIEEE754Binary32(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Binary32", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    let standardized_significand = standardizeUOARNumber(significand.copy(), false);
    if(standardized_significand===null){
      addToStackTrace("convertToIEEE754Binary32", "Invalid significand \"" + significand.toString() + "\"", log);
      return null;
    }
    significand = standardized_significand;
  }else{
    significand = significand.copy();
  }
  significand = fromDecimal(significand, 2, true, false);
  if(significand.whole.length>BINARY32.SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
    else
      return new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.BINARY32);
  }
  let converted_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, false);
  if(converted_exponent===null){
    addToStackTrace("convertToIEEE754Binary32", "Invalid exponent \"" + exponent + "\" for base 10", log);
    return null;
  }
  exponent = converted_exponent;

  let normalized = normalizeBinary(significand, true, false);
  significand = normalized.significand;
  exponent = exponent + normalized.exponent;
  if(!isInBounds(exponent, BINARY32.MIN_EXPONENT, BINARY32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Binary32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent = toLength(fromDecimal(toUOARNumber((BINARY32.OFFSET+exponent).toString(), 10 , NumberTypes.UNSIGNED, log), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();
  let res_significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, log).fraction;
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
export function convertToIEEE754Binary64(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Binary64", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    let standardized_significand = standardizeUOARNumber(significand.copy(), false);
    if(standardized_significand===null){
      addToStackTrace("convertToIEEE754Binary64", "Invalid significand \"" + significand.toString() + "\"", log);
      return null;
    }
    significand = standardized_significand;
  }else{
    significand = significand.copy();
  }
  significand = fromDecimal(significand, 2, true, false);
  if(significand.whole.length>BINARY64.SIGNIFICAND_LENGTH){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
    else
      return new IEEE754Number("1", "11111111111", "0000000000000000000000000000000000000000000000000000", IEEE754Formats.BINARY64);
  }
  let converted_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, false);
  if(converted_exponent===null){
    addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  exponent = converted_exponent;

  let normalized = normalizeBinary(significand, true, false);
  significand = normalized.significand;
  exponent = exponent + normalized.exponent;
  if(!isInBounds(exponent, BINARY64.MIN_EXPONENT, BINARY64.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Binary64", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent = toLength(fromDecimal(toUOARNumber((BINARY64.OFFSET+exponent).toString(), 10 , NumberTypes.UNSIGNED, log), 2, true, log), BINARY64.EXPONENT_LENGTH, 0, log).toUnsigned();
  let res_significand = fractionToLength(significand, BINARY64.SIGNIFICAND_LENGTH, log).fraction;
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
export function convertToIEEE754Decimal32DPD(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    let standardized_significand = standardizeUOARNumber(significand.copy(), false);
    if(standardized_significand===null){
      addToStackTrace("convertToIEEE754Decimal32DPD", "Invalid significand \"" + significand.toString() + "\"", log);
      return null;
    }
    significand = standardized_significand;
  }else{
    significand = significand.copy();
  }
  if(significand.whole.length>DECIMAL32.DIGITS){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
    else
      return new IEEE754Number("1", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32DPD);
  }
  let converted_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, false);
  if(converted_exponent===null){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  exponent = converted_exponent;

  let normalized = normalizeDecimal(significand, true, false);
  significand = normalized.significand;
  exponent = exponent + normalized.exponent;
  if(!isInBounds(exponent, DECIMAL32.MIN_EXPONENT, DECIMAL32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  let sized_significand = wholeToLength(significand, DECIMAL32.DIGITS, false);
  if(sized_significand===null){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Significand out of bounds \"" + significand.toString() + "\"", log);
    return null;
  }
  significand = sized_significand;

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent;
  let na = addZeroesBefore(digitToBinary(significand.whole, 0), 10, NumberTypes.UNSIGNED, 4, log);
  let nb = wholeToLength(fromDecimal(toUOARNumber((DECIMAL32.OFFSET+exponent).toString(), 10, NumberTypes.UNSIGNED, log), 2, true, log), 8, log).toUnsigned();
  if(na.charAt(0)=='0'){
    res_exponent = nb.substr(0,2)+na.substr(1,3)+nb.substr(2,6);
  }else{
    res_exponent = "11"+nb.substr(0, 2)+na.charAt(3)+nb.substr(2, 6);
  }
  let res_significand;
  let nc1 = decimalToDPD(decimalTo8421(significand.whole.substr(1, 3)));
  let nc2 = decimalToDPD(decimalTo8421(significand.whole.substr(4, 3)));
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
export function convertToIEEE754Decimal32BID(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    let standardized_significand = standardizeUOARNumber(significand.copy(), false);
    if(standardized_significand===null){
      addToStackTrace("convertToIEEE754Decimal32BID", "Invalid significand \"" + significand.toString() + "\"", log);
      return null;
    }
    significand = standardized_significand;
  }else{
    significand = significand.copy();
  }
  if(significand.whole.length>DECIMAL32.DIGITS){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
    else
      return new IEEE754Number("1", "11110000000", "00000000000000000000", IEEE754Formats.DECIMAL32BID);
  }
  let converted_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, false);
  if(converted_exponent===null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  exponent = converted_exponent;

  let normalized = normalizeDecimal(significand, true, false);
  significand = normalized.significand;
  exponent = exponent + normalized.exponent; 
  if(!isInBounds(exponent, DECIMAL32.MIN_EXPONENT, DECIMAL32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Decimal32BID", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  let sized_significand = wholeToLength(fromDecimal(significand, 2, true, false), 1+BINARY32.SIGNIFICAND_LENGTH, false);
  if(sized_significand===null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand out of bounds \"" + significand.toString() + "\"", log);
    return null;
  }
  significand = sized_significand;

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent;
  let na = significand.whole.substr(0,4);
  let nb = wholeToLength(fromDecimal(toUOARNumber((DECIMAL32.OFFSET+exponent).toString(), 10, NumberTypes.UNSIGNED, log), 2, true, log), 8, log).toUnsigned();
  if(na.charAt(0)=='0'){
    res_exponent = nb+na.substr(1,3);
  }else{
    res_exponent = "11"+nb+na.charAt(3);
  }
  let res_significand = significand.whole.substr(4);
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
export function convertToIEEE754Hexadecimal32(significand, exponent, standardized=false, log=true){
  if(significand.number_type!=NumberTypes.SIGNED){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Significand isn't signed", log);
    return null;
  }
  if(!standardized){
    let standardized_significand = standardizeUOARNumber(significand.copy(), false);
    if(standardized_significand===null){
      addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid significand \"" + significand.toString() + "\"", log);
      return null;
    }
    significand = standardized_significand;
  }else{
    significand = significand.copy();
  }
  if(significand.whole.length>HEXADECIMAL32.DIGITS){
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11111111", "00000000000000000000000", IEEE754Formats.HEXADECIMAL32);
    else
      return new IEEE754Number("1", "11111111", "00000000000000000000000", IEEE754Formats.HEXADECIMAL32);
  }
  significand = fromDecimal(significand, 16, true, false);
  let converted_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, false);
  if(converted_exponent===null){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  exponent = converted_exponent;

  let normalized = normalizeHexadecimal(significand, true, false);
  significand = normalized.significand;
  exponent = exponent + normalized.exponent; 
  if(!isInBounds(exponent, HEXADECIMAL32.MIN_EXPONENT, HEXADECIMAL32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent = toLength(fromDecimal(toUOARNumber((HEXADECIMAL32.OFFSET+exponent).toString(), 10, NumberTypes.UNSIGNED, log), 2, true, log), HEXADECIMAL32.EXPONENT_LENGTH, 0, log).toUnsigned();
  let res_significand = decimalTo8421(significand.fraction);
  return new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.HEXADECIMAL32);
}

/**
 * Normalizes a number according to IEEE754 Binary
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Normalization exponent for number
 */
export function normalizeBinary(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), false);
    if(standardized_number===null){
      addToStackTrace("normalizeBinary", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  if(number.base != 2){
    addToStackTrace("normalizeBinary", "Number must be binary \"" + number.toString() + "\"", log);
    return null;
  }
  let normalize_exponent = 0;
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
  return new SignificandExponentPair(number, 2, normalize_exponent);
}

/**
 * Normalizes a number according to IEEE754 Decimal
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Normalization exponent for number
 */
export function normalizeDecimal(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number.copy(), false);
    if(standardized_number===null){
      addToStackTrace("normalizeDecimal", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  if(number.base != 10){
    addToStackTrace("normalizeDecimal", "Number must be decimal \"" + number.toString() + "\"", log);
    return null;
  }
  if(number.whole.length>DECIMAL32.DIGITS){
    addToStackTrace("normalizeDecimal", "Number is too large, must be less than " + DECIMAL32.DIGITS + " digits", log);
    return null;
  }
  let normalize_exponent = 0;
  if(number.fraction!=""){
    let carry = 0;
    if(number.whole=="0")
      number.whole = "";
    if(number.fraction.length>DECIMAL32.DIGITS-number.whole.length){
      let round = number.fraction.charAt(DECIMAL32.DIGITS-number.whole.length);
      if(round>5 || (round==5 && number.fraction.charAt(DECIMAL32.DIGITS-number.whole.length)%2==1)){
        carry = 1;
      }
    }
    normalize_exponent = Math.max(-number.fraction.length, -DECIMAL32.DIGITS+number.whole.length);
    number.whole = number.whole + number.fraction.substr(0, DECIMAL32.DIGITS-number.whole.length);
    number.fraction = "";
    if(carry>0){
      let new_number = add(number, new UOARNumber(number.sign, "1", "", 10, NumberTypes.SIGNED), true, log);
      if(new_number===null){
        addToStackTrace("normalizeDecimal", "Rounding error", log);
        return null;
      }
      if(new_number.whole.length<=DECIMAL32.DIGITS){
        number.whole = new_number.whole;
      }
    }
    number = trimNumber(number);
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
  return new SignificandExponentPair(number, 10, normalize_exponent);
}

/**
 * Normalizes a number according to IEEE754 Hexadecimal
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Normalization exponent for number
 */
export function normalizeHexadecimal(number, standardized=false, log=true){
  if(!standardized){
    let standardized_number = standardizeUOARNumber(number, false);
    if(standardized_number===null){
      addToStackTrace("normalizeHexadecimal", "Invalid number \"" + number.toString() + "\"", log);
      return null;
    }
    number = standardized_number;
  }else{
    number = number.copy();
  }
  if(number.base != 16){
    addToStackTrace("normalizeHexadecimal", "Number must be hexadecimal \"" + number.toString() + "\"", log);
    return null;
  }
  if(number.whole.length>HEXADECIMAL32.DIGITS){
    addToStackTrace("normalizeHexadecimal", "Number is too large, must be less than " + HEXADECIMAL32.DIGITS + " digits", log);
    return null;
  }
  let normalize_exponent = 0;
  for(let i=0; i<number.whole.length; i++){
    if(number.whole.charAt(i)!='0'){
      normalize_exponent = number.whole.length-i;
      number.fraction = number.whole.substr(i) + number.fraction;
      number.whole="0";
      fractionToLength(number, HEXADECIMAL32.DIGITS, log);
      return new SignificandExponentPair(number, 16, normalize_exponent);
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    if(number.fraction.charAt(i)!='0'){
      normalize_exponent = i;
      if(i!=0)
        normalize_exponent = -normalize_exponent;
      number.fraction = number.fraction.substr(i);
      number.whole="0";
      fractionToLength(number, HEXADECIMAL32.DIGITS, log);
      return new SignificandExponentPair(number, 16, normalize_exponent);
    }
  }
}

/**
 * Converts decimal number to DPD
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {string} Decimal number converted to DPD 
 */
export function decimalToDPD(number, log=true){
  if(!isValidNumber(number, 2, NumberTypes.UNSIGNED)){
    addToStackTrace("decimalToDPD", "Invalid number \"" + number + "\"", log);
    return null;
  }

  let res =  "";
  
  if(number.length<12){
    number = addZeroesBefore(number, 2, NumberTypes.UNSIGNED, 12, false);
  }else if(number.length>12){
    res = res.concat(decimalToDPD(number.substr(0, number.length-12), log));
    number = number.substr(number.length-12, 12);
  }

  let aei = number.charAt(0) + number.charAt(4) + number.charAt(8);
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
export function DPDtoDecimal(number, log=true){
  if(!isValidNumber(number, 2, NumberTypes.UNSIGNED)){
    addToStackTrace("DPDtoDecimal", "Invalid number \"" + number + "\"", log);
    return null;
  }

  let res =  "";
  
  if(number.length<10){
    number = addZeroesBefore(number, 2, NumberTypes.UNSIGNED, 10, false);
  }else if(number.length>10){
    res = res.concat(DPDtoDecimal(number.substr(0, number.length-10), log));
    number = number.substr(number.length-10, 10);
  }

  let vwxst = number.substr(6, 3) + number.substr(3, 2);
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
 * @param {IEEE754Number} number Number to check
 * @returns {boolean} True if number is valid IEEE754, false otherwise 
 */
export function isValidIEEE754(number){
  if(number===null)
    return false;
  if(number.sign.length!=1 || (number.sign!="0" && number.sign!="1"))
    return false;
  switch(number.format){
    case IEEE754Formats.BINARY32:
      if(number.exponent.length!=BINARY32.EXPONENT_LENGTH || number.significand.length!=BINARY32.SIGNIFICAND_LENGTH)
        return false;
      break;
    case IEEE754Formats.BINARY64:
      if(number.exponent.length!=BINARY64.EXPONENT_LENGTH || number.significand.length!=BINARY64.SIGNIFICAND_LENGTH)
        return false;
      break;
    case IEEE754Formats.DECIMAL32DPD:
    case IEEE754Formats.DECIMAL32BID:
      if(number.exponent.length!=DECIMAL32.EXPONENT_LENGTH || number.significand.length!=DECIMAL32.SIGNIFICAND_LENGTH)
        return false;
      break;
    case IEEE754Formats.HEXADECIMAL32:
      if(number.exponent.length!=HEXADECIMAL32.EXPONENT_LENGTH || number.significand.length!=HEXADECIMAL32.SIGNIFICAND_LENGTH)
        return false;
      break;
    default:
      return false;
  }
  let temp;
  for(let i=0; i<number.exponent.length; i++){
    temp = number.exponent.charAt(i);
    if(temp!="1" && temp!="0")
      return false;
  }
  for(let i=0; i<number.significand.length; i++){
    temp = number.significand.charAt(i);
    if(temp!="1" && temp!="0")
      return false;
  }
  return true;
}

/**
 * Converts string to IEEE754Number
 * @param {string} number Number to convert
 * @param {IEEE754Format} format Number format
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} number converted to IEEE754Number
 */
export function toIEEE754Number(number, format, log=true){
  if(number===null){
    addToStackTrace("toIEEE754Number", "Number is null", log);
    return null;
  }
  number = number.replace(SPACE_REPLACE, '');
  let res;
  switch(format){
    case IEEE754Formats.BINARY32:
      if(number.length!=32){
        addToStackTrace("toIEEE754Number", "Invalid binary32 number \"" + number + "\"", log);
        return null;
      }
      res = new IEEE754Number(number.charAt(0), number.substr(1, BINARY32.EXPONENT_LENGTH), number.substr(1+BINARY32.EXPONENT_LENGTH, BINARY32.SIGNIFICAND_LENGTH), IEEE754Formats.BINARY32);
      break;
    case IEEE754Formats.BINARY64:
      if(number.length!=64){
        addToStackTrace("toIEEE754Number", "Invalid binary64 number \"" + number + "\"", log);
        return null;
      }
      res = new IEEE754Number(number.charAt(0), number.substr(1, BINARY64.EXPONENT_LENGTH), number.substr(1+BINARY64.EXPONENT_LENGTH, BINARY64.SIGNIFICAND_LENGTH), IEEE754Formats.BINARY64);
      break;
    case IEEE754Formats.DECIMAL32DPD:
    case IEEE754Formats.DECIMAL32BID:
      if(number.length!=32){
        addToStackTrace("toIEEE754Number", "Invalid decimal32 number \"" + number + "\"", log);
        return null;
      }
      res = new IEEE754Number(number.charAt(0), number.substr(1, DECIMAL32.EXPONENT_LENGTH), number.substr(1+DECIMAL32.EXPONENT_LENGTH, DECIMAL32.SIGNIFICAND_LENGTH), format);
      break;
    case IEEE754Formats.HEXADECIMAL32:
      if(number.length!=32){
        addToStackTrace("toIEEE754Number", "Invalid hexadecimal32 number \"" + number + "\"", log);
        return null;
      }
      res = new IEEE754Number(number.charAt(0), number.substr(1, HEXADECIMAL32.EXPONENT_LENGTH), number.substr(1+HEXADECIMAL32.EXPONENT_LENGTH, HEXADECIMAL32.SIGNIFICAND_LENGTH), IEEE754Formats.HEXADECIMAL32);
      break;
    default:
      addToStackTrace("toIEEE754Number", "Invalid IEEE754 format", log);
      return null;
  }
  if(isValidIEEE754(res)){
    return res;
  }else{
    addToStackTrace("toIEEE754Number", "Number is invalid", log);
    return null;
  }
}

/**
 * Gets an IEEE754Binary32 special value of number
 * @param {IEEE754Number} number Number to operate on
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Special value of the number or null
 */
export function getSpecialValueBinary32(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.BINARY32){
    addToStackTrace("getSpecialValueBinary32", "Invalid IEEE754 Binary32 number \"" + number.toString() + "\"", log);
    return null;
  }
  if(number.exponent=="00000000" && number.significand=="00000000000000000000000"){
    return number.sign=="0" ? POS_ZERO : NEG_ZERO;
  }else if(number.exponent=="11111111"){
    if(number.significand=="00000000000000000000000"){
      return number.sign=="0" ? POS_INF : NEG_INF;
    }else{
      if(number.significand.charAt(0)=="0"){
        return SNAN;
      }else{
        return QNAN;
      }
    }
  }
  return null;
}

/**
 * Gets an IEEE754Binary64 special value of number
 * @param {IEEE754Number} number Number to operate on
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Special value of number or null
 */
export function getSpecialValueBinary64(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.BINARY64){
    addToStackTrace("getSpecialValueBinary64", "Invalid IEEE754 Binary64 number \"" + number.toString() + "\"", log);
    return null;
  }
  if(number.exponent=="00000000000" && number.significand=="0000000000000000000000000000000000000000000000000000"){
    return number.sign=="0" ? POS_ZERO : NEG_ZERO;
  }else if(number.exponent=="11111111111"){
    if(number.significand=="0000000000000000000000000000000000000000000000000000"){
      return number.sign=="0" ? POS_INF : NEG_INF;
    }else{
      if(number.significand.charAt(0)=="0"){
        return SNAN;
      }else{
        return QNAN;
      }
    }
  }
  return null;
}

/**
 * Gets an IEEE754Decimal32 special value of number
 * @param {IEEE754Number} number Number to operate on
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Special value of number or null
 */
export function getSpecialValueDecimal32(number, log=true){
  if(!isValidIEEE754(number) || (number.format!=IEEE754Formats.DECIMAL32DPD && number.format!=IEEE754Formats.DECIMAL32BID)){
    addToStackTrace("getSpecialValueDecimal32", "Invalid IEEE754 Decimal32 number \"" + number.toString() + "\"", log);
    return null;
  }
  if(number.exponent.substr(0, 2)!="11" && number.exponent.substr(2, 3)=="000" && number.significand=="00000000000000000000"){
    return number.sign=="0" ? POS_ZERO : NEG_ZERO;
  }else if(number.exponent.substr(0, 4)=="1111"){
    if(number.exponent.charAt(4)=="0"){
      return number.sign=="0" ? POS_INF : NEG_INF;
    }else{
      if(number.exponent.charAt(5)=="0"){
        return QNAN;
      }else{
        return SNAN;
      }
    }
  }
  return null;
}

/**
 * Converts an IEEE754 Binary32 to a significand and exponent
 * @param {IEEE754Number} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Object containing significand and exponent
 */
export function convertFromIEEE754Binary32(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.BINARY32){
    addToStackTrace("convertFromIEEE754Binary32", "Invalid IEEE754 Binary32 number \"" + number.toString() + "\"", log);
    return null;
  }

  let res = getSpecialValueBinary32(number);
  if(res!=null){
    return res;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand;
  let exponent = baseToDecimalInteger(number.exponent, 2, NumberTypes.UNSIGNED, log) - BINARY32.OFFSET;

  if(exponent==-BINARY32.OFFSET){
    significand = trimNumber(new UOARNumber(sign, "0", number.significand, 2, NumberTypes.SIGNED));
    let normalized = normalizeBinary(significand, true, log);
    significand = normalized.significand;
    exponent += 1+normalized.exponent;
  }else{
    significand = trimNumber(new UOARNumber(sign, "1", number.significand, 2, NumberTypes.SIGNED));
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
  return new SignificandExponentPair(significand, 2, exponent);
}

/**
 * Converts an IEEE754 Binary64 to a significand and exponent
 * @param {IEEE754Number} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Object containing significand and exponent
 */
export function convertFromIEEE754Binary64(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.BINARY64){
    addToStackTrace("convertFromIEEE754Binary64", "Invalid IEEE754 Binary64 number \"" + number.toString() + "\"", log);
    return null;
  }

  let res = getSpecialValueBinary64(number);
  if(res!=null){
    return res;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand;
  let exponent = baseToDecimalInteger(number.exponent, 2, NumberTypes.UNSIGNED, log) - BINARY64.OFFSET;

  if(exponent==-BINARY64.OFFSET){
    significand = trimNumber(new UOARNumber(sign, "0", number.significand, 2, NumberTypes.SIGNED));
    let normalized = normalizeBinary(significand, true, log);
    significand = normalized.significand;
    exponent += 1+normalized.exponent;
  }else{
    significand = trimNumber(new UOARNumber(sign, "1", number.significand, 2, NumberTypes.SIGNED));
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
  return new SignificandExponentPair(significand, 2, exponent);
}

/**
 * Converts an IEEE754 Decimal32 DPD to a significand and exponent
 * @param {IEEE754Number} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Object containing significand and exponent
 */
export function convertFromIEEE754Decimal32DPD(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.DECIMAL32DPD){
    addToStackTrace("convertFromIEEE754Decimal32DPD", "Invalid IEEE754 Decimal32DPD number \"" + number.toString() + "\"", log);
    return null;
  }

  let res = getSpecialValueDecimal32(number);
  if(res!=null){
    return res;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand;
  let comb = "";
  if(number.exponent.substr(0, 2)=="11"){
    significand = "100" + number.exponent.charAt(4);
    comb = number.exponent.substr(2, 2) + number.exponent.substr(5, 6);
  }else{
    significand = "0" + number.exponent.substr(2, 3);
    comb = number.exponent.substr(0,2) + number.exponent.substr(5, 6);
  }

  let exponent = baseToDecimalInteger(comb, 2, NumberTypes.UNSIGNED, log);
  if(exponent==0){
    exponent = -DECIMAL32.OFFSET - DECIMAL32.DIGITS;
  }else{
    exponent -= DECIMAL32.OFFSET;
  }

  significand = significand + DPDtoDecimal(number.significand.substr(0, DECIMAL32.TRIPLET_LENGTH), log) + DPDtoDecimal(number.significand.substr(DECIMAL32.TRIPLET_LENGTH, DECIMAL32.TRIPLET_LENGTH), log);
  significand = trimNumber(new UOARNumber(sign, decimalFrom8421(significand, log), "", 10, NumberTypes.SIGNED));
  let normalized = normalizeDecimal(significand, true, log);
  significand = normalized.significand;
  exponent += normalized.exponent;

  return new SignificandExponentPair(significand, 10, exponent);
}

/**
 * Converts an IEEE754 Decimal32 BID to a significand and exponent
 * @param {IEEE754Number} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Object containing significand and exponent
 */
export function convertFromIEEE754Decimal32BID(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.DECIMAL32BID){
    addToStackTrace("convertFromIEEE754Decimal32BID", "Invalid IEEE754 Decimal32BID number \"" + number.toString() + "\"", log);
    return null;
  }

  let res = getSpecialValueDecimal32(number);
  if(res!=null){
    return res;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand;
  let comb = "";
  if(number.exponent.substr(0, 2)=="11"){
    significand = "100" + number.exponent.charAt(10);
    comb = number.exponent.substr(2, 8);
  }else{
    significand = "0" + number.exponent.substr(8, 3);
    comb = number.exponent.substr(0,8);
  }

  let exponent = baseToDecimalInteger(comb, 2, NumberTypes.UNSIGNED, log);
  if(exponent==0){
    exponent = -DECIMAL32.OFFSET - DECIMAL32.DIGITS;
  }else{
    exponent -= DECIMAL32.OFFSET;
  }

  significand = significand + number.significand;
  significand = toDecimal(new UOARNumber(sign, significand, "", 2, NumberTypes.SIGNED), false, log);
  let normalized = normalizeDecimal(significand, true, log);
  significand = normalized.significand;
  exponent += normalized.exponent;
  return new SignificandExponentPair(significand, 10, exponent);
}

/**
 * Converts an IEEE754 Hexadecimal32 to a significand and exponent
 * @param {IEEE754Number} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {SignificandExponentPair} Object containing significand and exponent
 */
export function convertFromIEEE754Hexadecimal32(number, log=true){
  if(!isValidIEEE754(number) || number.format!=IEEE754Formats.HEXADECIMAL32){
    addToStackTrace("convertFromIEEE754Hexadecimal32", "Invalid IEEE754 Hexadecimal32 number \"" + number.toString() + "\"", log);
    return null;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand = trimNumber(new UOARNumber(sign, "0", decimalFrom8421(number.significand), 16, NumberTypes.SIGNED));
  let exponent = baseToDecimalInteger(number.exponent, 2, NumberTypes.UNSIGNED, log) - HEXADECIMAL32.OFFSET;

  let len = significand.fraction.length;
  if(exponent>=0 && exponent<6){
    significand.whole = significand.fraction.substr(0, exponent);
    significand.fraction = significand.fraction.substr(exponent);
    exponent = 0;
  }else{
    if(len<6){
      exponent -= significand.fraction.length;
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
  return new SignificandExponentPair(significand, 16, exponent);
}
