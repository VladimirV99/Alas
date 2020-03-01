import { NumberTypes, toUOARNumber, toLength, trimSign, trimNumber, fractionToLength } from './uoar_core.mjs';
import { fromDecimal, baseToDecimalInteger } from './base_converter.mjs';
import { add } from './uoar_arithmetic.mjs';
import { 
  IEEE754Number, POS_ZERO, NEG_ZERO, POS_INF, NEG_INF, QNAN, SNAN, IEEE754Formats, 
  BINARY32, BINARY32_SPECIAL_VALUES, toIEEE754Number, getSpecialValueBinary32, normalizeBinary
} from './ieee754_core.mjs';
import { addToStackTrace } from './output.mjs';

/** 
 * Arithmetic operations
 * @readonly
 * @typedef {number} ArithmeticOperation
 * @enum {ArithmeticOperation}
*/
export const ArithmeticOperations = Object.freeze({
  ADDITION: 0,
  SUBTRACTION: 1,
  MULTIPLICATION: 2,
  DIVISION: 3
});

/**
 * Adds two IEEE754 binary32 numbers
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} Sum of operands
 */
export function addIEEE754(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("addIEEE754", "Empty Operand", log)
    return null;
  }
  operand1 = toIEEE754Number(operand1, IEEE754Formats.BINARY32, false);
  operand2 = toIEEE754Number(operand2, IEEE754Formats.BINARY32, false);
  if(operand1==null || operand2==null){
    addToStackTrace("addIEEE754", "Invalid operand", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special1==SNAN || special2==QNAN || special2==SNAN || 
      (special1==POS_INF && specail2==NEG_INF) || (special1==NEG_INF && special2==POS_INF)){
      return BINARY32_SPECIAL_VALUES.QNAN;
    } else if((special1==POS_INF && special2!=NEG_INF) || (special2==POS_INF && special1!=NEG_INF)){
      return BINARY32_SPECIAL_VALUES.POS_INF;
    } else if((special1==NEG_INF && special2!=POS_INF) || (special2==NEG_INF && special1!=POS_INF)){
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = Math.min(exponent1, exponent2);
  exponent1 -= exponent;
  exponent2 -= exponent; 

  let significand1 = new UOARNumber(operand1.sign, (exponent==0?"0":"1")+operand1.significand.substr(0, exponent1), operand1.significand.substr(exponent1), 2, NumberTypes.SMR);
  let significand2 = new UOARNumber(operand2.sign, (exponent==0?"0":"1")+operand2.significand.substr(0, exponent2), operand2.significand.substr(exponent2), 2, NumberTypes.SMR);
  let significand = add(significand1, significand2, NumberTypes.SMR, true, false);
  exponent += normalizeBinary(significand, true, false);
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    return significand.sign==PLUS ? POS_INF : NEG_INF;
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
  }

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  return new IEEE754Number(significand.sign, exponent, significand.fraction, IEEE754Formats.BINARY32);
}

/**
 * Subtracts two IEEE754 binary32 numbers
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} Difference of operands
 */
export function subtractIEEE754(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("subtractIEEE754", "Empty Operand", log)
    return null;
  }
  operand1 = toIEEE754Number(operand1, IEEE754Formats.BINARY32, false);
  operand2 = toIEEE754Number(operand2, IEEE754Formats.BINARY32, false);
  if(operand1==null || operand2==null){
    addToStackTrace("subtractIEEE754", "Invalid operand", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special1==SNAN || special2==QNAN || special2==SNAN || 
      (special1==POS_INF && specail2==POS_INF) || (special1==NEG_INF && special2==NEG_INF)){
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if((special1==POS_INF && specail2==NEG_INF) || (special1==POS_INF && special2!=POS_INF) || (special2==NEG_INF && special1!=NEG_INF)){
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if((special1==NEG_INF && special2==POS_INF) || (special1==NEG_INF && special2!=NEG_INF) || (special2==POS_INF && special1!=POS_INF)){
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = Math.min(exponent1, exponent2);
  exponent1 -= exponent;
  exponent2 -= exponent;

  let significand1 = trimNumber(new UOARNumber(operand1.sign, (exponent==0?"0":"1")+operand1.significand.substr(0, exponent1), operand1.significand.substr(exponent1), 2, NumberTypes.SMR));
  let significand2 = trimNumber(new UOARNumber(operand2.sign, (exponent==0?"0":"1")+operand2.significand.substr(0, exponent2), operand2.significand.substr(exponent2), 2, NumberTypes.SMR));
  significand2.sign = significand2.sign=="0" ? "1" : "0";
  let significand = add(significand1, significand2, NumberTypes.SMR, true, false);
  exponent += normalizeBinary(significand, true, false);
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    return significand.sign==PLUS ? POS_INF : NEG_INF;
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
  }

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  return new IEEE754Number(significand.sign, exponent, significand.fraction, IEEE754Formats.BINARY32);
}

/**
 * Multiplies two IEEE754 binary32 numbers
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} Product of operands
 */
export function multiplyIEEE754(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("multiplyIEEE754", "Empty Operand", log)
    return null;
  }
  operand1 = toIEEE754Number(operand1, IEEE754Formats.BINARY32, false);
  operand2 = toIEEE754Number(operand2, IEEE754Formats.BINARY32, false);
  if(operand1==null || operand2==null){
    addToStackTrace("multiplyIEEE754", "Invalid operand", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special2==QNAN || special1==SNAN || special2==SNAN ||
      ((special1==POS_ZERO || special1==NEG_ZERO) && (special2==POS_INF || special2==NEG_INF)) ||
      ((special1==POS_ZERO || special1==NEG_ZERO) && (special2==POS_INF || special2==NEG_INF))){
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==POS_ZERO || special2==POS_ZERO || special1==NEG_ZERO || special2==NEG_ZERO){
      return operand1.sign==operand2.sign? BINARY_POS_ZERO : BINARY_NEG_ZERO;
    }else if((special1==POS_INF && special2==NEG_INF) || (special1==NEG_INF && special2==POS_INF)){
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }else if(special1==POS_INF || special2==POS_INF){
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if(special1==NEG_INF || special2==NEG_INF){
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let sign = operand1.sign==operand2.sign ? "0" : "1";

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = exponent1 + exponent2 - BINARY32.OFFSET;

  let significand1 = trimNumber(new UOARNumber("", (exponent1==0?"0":"1"), operand1.significand, 2, NumberTypes.UNSIGNED));
  let significand2 = trimNumber(new UOARNumber("", (exponent1==0?"0":"1"), operand2.significand, 2, NumberTypes.UNSIGNED));
  
  let multiplicand1 = new UOARNumber("", significand1.whole + significand1.fraction, "", 2, NumberTypes.UNSIGNED);
  let multiplicand2 = new UOARNumber("", significand2.whole + significand2.fraction, "", 2, NumberTypes.UNSIGNED);
  let significand = new UOARNumber("", "0", "", 2, NumberTypes.UNSIGNED);

  for(let i=multiplicand2.whole.length-1; i>=0; i--){
    if(multiplicand2.whole[i]=="1"){
      significand = add(significand, multiplicand1, NumberTypes.UNSIGNED, false);
    }
    multiplicand1.whole = multiplicand1.whole.concat("0");
  }
  let significand_fraction_len = significand1.fraction.length+significand2.fraction.length;
  significand.fraction = significand.whole.substr(significand.whole.length-significand_fraction_len);
  significand.whole = significand.whole.substr(0, significand.whole.length-significand_fraction_len);

  let normalize_exponent = normalizeBinary(significand, true, false);
  exponent += normalize_exponent;
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    return significand.sign==PLUS ? POS_INF : NEG_INF;
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
  }

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  return new IEEE754Number(sign, exponent, significand.fraction, IEEE754Formats.BINARY32);
}

/**
 * Divides two IEEE754 binary32 numbers
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Number} Division quotient
 */
export function divideIEEE754(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("divideIEEE754", "Empty Operand", log)
    return null;
  }
  operand1 = toIEEE754Number(operand1, IEEE754Formats.BINARY32, false);
  operand2 = toIEEE754Number(operand2, IEEE754Formats.BINARY32, false);
  if(operand1==null || operand2==null){
    addToStackTrace("divideIEEE754", "Invalid operand", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special2==QNAN || special1==SNAN || special2==SNAN ||
      ((special1==POS_ZERO || special1==NEG_ZERO) && (special2==POS_ZERO || special2==NEG_ZERO)) ||
      ((special1==POS_INF || special1==NEG_INF) && (special2==POS_INF || special2==NEG_INF))){
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special2==POS_INF || special2==NEG_INF){
      return operand1.sign==operand2.sign? BINARY_POS_ZERO : BINARY_NEG_ZERO;
    }else if(special2==POS_ZERO || special2==NEG_ZERO){
      return operand1.sign==operand2.sign? BINARY_POS_INF : BINARY_NEG_INF;
    }
  }

  let sign = operand1.sign==operand2.sign ? "0" : "1";

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = exponent1 - exponent2 + BINARY32.OFFSET;

  let significand1 = trimNumber(new UOARNumber("", (exponent1==0?"0":"1"), operand1.significand, 2, NumberTypes.UNSIGNED));
  let significand2 = trimNumber(new UOARNumber("", (exponent1==0?"0":"1"), operand2.significand, 2, NumberTypes.UNSIGNED));
  if(significand2.fraction.length > significand1.fraction.length){
    fractionToLength(significand1, significand2.fraction.length, false);
  }
  significand1.whole = significand1.whole + significand1.fraction.substr(0, significand2.fraction.length);
  significand1.fraction = significand1.fraction.substr(significand2.fraction.length);
  significand2.whole = significand2.whole + significand2.fraction;
  significand2.fraction = "";

  let i = significand2.whole.length;
  let dividend_string = significand1.whole + significand1.fraction + "0";
  let dividend = new UOARNumber("+", dividend_string.substr(0, i), "", 2, NumberTypes.SIGNED);
  let divider = new UOARNumber("+", significand2.whole, "", 2, NumberTypes.SIGNED);
  let neg_divider = new UOARNumber("-", significand2.whole, "", 2, NumberTypes.SIGNED);
  let significand = new UOARNumber("+", "", "", 2, NumberTypes.SIGNED);
  for(; i<dividend_string.length; i++){
    if(isGreater(dividend, divider, true, false) || dividend.whole==divider.whole){
      dividend = add(dividend, neg_divider, NumberTypes.SIGNED, false);
      significand.whole = significand.whole.concat("1");
    }else{
      significand.whole = significand.whole.concat("0");
    }
    dividend.whole = dividend.whole + dividend_string[i];
  }
  significand.fraction = significand.whole.substr(significand1.whole.length-divider.whole.length+1);
  significand.whole = significand.whole.substr(0, significand1.whole.length-divider.whole.length+1);
  trimNumber(dividend);
  while(significand.whole.length <= BINARY32.SIGNIFICAND_LENGTH+1 && dividend.whole!="0"){
    if(isGreater(dividend, divider, true, false) || dividend.whole==divider.whole){
      dividend = add(dividend, neg_divider, NumberTypes.SIGNED, false);
      significand.fraction = significand.fraction.concat("1");
    }else{
      significand.fraction = significand.fraction.concat("0");
    }
    dividend.whole = dividend.whole + "0";
  }
  trimNumber(significand);

  let normalize_exponent = normalizeBinary(significand, true, false);
  exponent += normalize_exponent;
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    return significand.sign==PLUS ? POS_INF : NEG_INF;
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
  }

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  return new IEEE754Number(sign, exponent, significand.fraction, IEEE754Formats.BINARY32);
}