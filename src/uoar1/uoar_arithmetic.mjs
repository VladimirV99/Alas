import {
  PLUS, MINUS, NumberTypes, UOARNumber, getValueAt, getValue, toValue, isValidUOARNumber, trimSign, trimNumber, standardizeUOARNumber, getSignMultiplierForNumber, equalizeLength
} from './uoar_core.mjs';
import { createConstantString, createZeroString } from './util.mjs';
import { addToStackTrace } from './output.mjs';

/**
* Shift type enum
* @readonly
* @typedef {number} ShiftType
* @enum {ShiftType}
*/
export const ShiftTypes = Object.freeze({
  RIGHT_A: 0,
  RIGHT_L: 1,
  LEFT: 2
});

/**
 * Checks if the first number is greater than the second
 * @param {UOARNumber} number1 Number to compare
 * @param {UOARNumber} number2 Number to compare
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {boolean} True if first number is greater, false otherwise
 */
export function isGreater(number1, number2, standardized=false, log=true){
  if(number1.base!=number2.base){
    addToStackTrace("isGreater", "Can't compare numbers. Bases are not equal", log);
    return null;
  }
  if(number1.number_type!=number2.number_type){
    addToStackTrace("isGreater", "Can't compare numbers. Types are not the same", log);
    return null;
  }
  if(!standardized){
    number1 = standardizeUOARNumber(number1);
    number2 = standardizeUOARNumber(number2);
    if(number1===null || number2===null){
      addToStackTrace("isGreater", "Invalid numbers", log);
      return null;
    }
  }

  let sign1 = getSignMultiplierForNumber(number1, true);
  let sign2 = getSignMultiplierForNumber(number2, true);
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
export function getAbsoluteValue(number){
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      return number.copy();
    case NumberTypes.SIGNED:
      return new UOARNumber("+", number.whole, number.fraction, number.base, NumberTypes.SIGNED);
    case NumberTypes.SMR:
      return new UOARNumber("0", number.whole, number.fraction, number.base, NumberTypes.SMR);
    case NumberTypes.OC:
    case NumberTypes.TC:
      let res = number.copy();
      if(getSignMultiplierForNumber(number,false)==-1){
        res = complement(res);
      }
      return res;
  }
  return null;
}

/**
 * Adds two numbers together
 * @param {UOARNumber} add1 First factor
 * @param {UOARNumber} add2 Second factor
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Sum of the two numbers 
 */
export function add(add1, add2, standardized=false, log=true){
  if(!isValidUOARNumber(add1) || !isValidUOARNumber(add2)){
    addToStackTrace("add", "Numbers are invalid", log);
    return null;
  }
  if(add1.base!=add2.base){
    addToStackTrace("add", "Can't add numbers. Bases are not equal", log);
    return null;
  }
  if(add1.number_type!=add2.number_type){
    addToStackTrace("add", "Can't compare numbers. Types are not the same", log);
    return null;
  }
  add1 = trimSign(add1.copy());
  add2 = trimSign(add2.copy());
  let base = add1.base;
  let number_type = add1.number_type;

  equalizeLength(add1, add2, standardized, log);
  let whole_len=add1.whole.length;
  let fraction_len=add1.fraction.length;

  let sign;
  let whole = "";
  let fraction = "";
  let carry = 0;
  let temp;
  
  switch(number_type){
    case NumberTypes.UNSIGNED:
      sign = "";
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
      break;
    case NumberTypes.SIGNED:
    case NumberTypes.SMR:
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
      }else if(number_type == NumberTypes.TC){
        if(add1.sign.charAt(0) == add2.sign.charAt(0)){
          if(add1.sign.charAt(0)!=sign){
            whole = sign + whole;
            sign = add1.sign;
          }
        }
      }
      break;
    default:
      addToStackTrace("add", "Invalid number type", log);
      return null;
  }
  let res = new UOARNumber(sign, whole, fraction, base, number_type);
  if(number_type == NumberTypes.OC){
    res = addToLowestPoint(res, carry, false);
  }
  res = trimNumber(res);
  return res;
}

/**
 * Complements the given number
 * @param {UOARNumber} number Number to complement 
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Complemented number
 */
export function complement(number, standardized=false, log=true){
  if(!isValidUOARNumber(number)){
    addToStackTrace("complement", "Invalid number \"" + number.toString() + "\"", log);
    return null;
  }
  number = number.copy();
  if(!standardized){
    trimSign(number);
  }
  let base_complement = number.base-1;
  let complement_sign = "";
  let complement_whole = "";
  let complement_fraction = "";
  let carry = 0;
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      addToStackTrace("complement", "Can't complement unsigned number", log);
      return null;
    case NumberTypes.SIGNED:
      if(number.sign.charAt(0)==PLUS)
        complement_sign = MINUS;
      else if(number.sign.charAt(0)==MINUS)
        complement_sign = PLUS;
      else
        return null;
      complement_whole = number.whole;
      complement_fraction = number.fraction;
      break;
    case NumberTypes.SMR:
      if(number.sign.charAt(0)=="0")
        complement_sign = base_complement.toString();
      else if(number.sign.charAt(0)==base_complement.toString())
        complement_sign = "0";
      else
        return null;
      complement_whole = number.whole;
      complement_fraction = number.fraction;
      break;
    case NumberTypes.TC:
      carry = 1;
    case NumberTypes.OC:
      let temp;
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

  let res = new UOARNumber(complement_sign, complement_whole, complement_fraction, number.base, number.number_type);
  return res;
}

/**
 * Shift all numbers by specified number of places
 * @param {UOARNumber[]} numbers Array of UOARNumbers
 * @param {number} by Number of places to shift
 * @param {ShiftType} shift_type Shift type
 * @param {boolean} [log=true] Should log
 * @returns {boolean} True if shift was successfull, false otherwise
 */
export function shift(numbers, by, shift_type, log=true){
  for(let i = 0; i<numbers.length; i++){
    if(numbers[i].number_type==NumberTypes.SIGNED) {
      addToStackTrace("shift", "Can't shift signed number " + numbers[i].toString(), log);
      return false;
    }
    if(!isValidUOARNumber(numbers[i])){
      addToStackTrace("shift", "Invalid number \"" + numbers[i].toString() + "\"", log);
      return false;
    }
  }

  let line = "";
  let ptr = 0;
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
      return false;
  }
  
  let sign_len = 0;
  let whole_len = 0;
  let frac_len = 0;
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
  return true;
}

/**
 * Adds toAdd to the lowest point of number
 * @param {UOARNumber} number Number to add to
 * @param {number} toAdd Number to add
 * @param {boolean} [log=true] Should log
 * @return {UOARNumber} Number with added toAdd
 */
export function addToLowestPoint(number, toAdd, log=true){
  if(!isValidUOARNumber(number)){
    addToStackTrace("addToLowestPoint", "Invalid number \"" + numbers[i].toString() + "\"", log);
    return null;
  }

  let sign = number.sign;
  let whole = "";
  let fraction = "";
  let carry = toAdd;
  let temp;
  
  for(let i=number.fraction.length-1; i>=0; i--){
    temp = getValueAt(number.fraction, i, log) + carry;
    if(temp<0){
      carry = -Math.ceil(-temp/number.base);
      fraction = (temp-carry*number.base) + fraction;
    }else{
      fraction = toValue(temp%number.base) + fraction;
      carry = Math.floor(temp/number.base);
    }
  }
  let number_whole = number.whole;
  if(number.number_type==NumberTypes.OC || number.number_type==NumberTypes.TC)
    number_whole = sign + number_whole;
  for(let i=number_whole.length-1; i>=0; i--){
    temp = getValueAt(number_whole, i, log) + carry;
    if(temp<0){
      carry = -Math.ceil(-temp/number.base);
      whole = (temp-carry*number.base) + whole;
    }else{
      whole = toValue(temp%number.base) + whole;
      carry = Math.floor(temp/number.base);
    }
  }

  if(number.number_type==NumberTypes.OC || number.number_type==NumberTypes.TC){
    let i;
    for(i=0; i<whole.length-1; i++){
      if(whole.charAt(i)!="0")
        break;
    }
    whole = whole.substr(i);
  }

  if(carry<0){
    //TODO Support adding negative numbers
    return null;
  }else if(carry>0){
    switch(number.number_type){
      case NumberTypes.UNSIGNED:
      case NumberTypes.SIGNED:
      case NumberTypes.SMR:
        whole = toValue(carry, log) + whole;
        break;
      case NumberTypes.OC:
      case NumberTypes.TC:
        sign = "0";
        break;
      default:
        return null;
    }
  }
  
  return new UOARNumber(sign, whole, fraction, number.base, number.number_type);
}