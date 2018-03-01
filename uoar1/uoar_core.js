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

var error = "";
var error_message = "";

function executeFunction(fun){
  clearStackTrace();
  fun();
}

var stackTrace = [];

function addToStackTrace(source, message, log=true){
  stackTrace.push({"source": source, "message": message});
  if(log)
    console.error(source + ": " + message);
}

function clearStackTrace(){
  stackTrace = [];
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
 * Checks if the given string is a radix point
 * @param {string} character Char to check
 * @returns {boolean} true if character is a radix point, false otherwise
 */
function isRadixPoint(character){
  for(let radix of RADIX){
    if(character==radix){
      return true;
    }
  }
  return false;
}

/**
 * Checks if the given string is a sign
 * @param {string} char Char to check
 * @returns {boolean} true if character is a sign, false otherwise
 */
function isSign(char){
  return isSignAt(char, 0);
}

/**
 * Checks if the given string has a sign at specified index
 * @param {string} number Number to check
 * @param {number} index Index to check at
 * @returns {boolean} true if character is a sign, false otherwise
 */
function isSignAt(number, index){
  var temp = number.charAt(index);
  return temp==PLUS || temp==MINUS;
}

/**
 * Gets the fist index after the sign
 * @param {string} number Number to operate on
 * @returns {number} First index after the sign
 */
function getSignEnd(number){
  for(let i=0; i<number.length; i++){
    if(!isSignAt(number, i) && number.charAt(i)!=SPACE){
      break;
    }
  }
  return i;
}

/**
 * Checks if a number is valid
 * @param {string} number Number to validate
 * @param {number} base Base of the number
 * @returns {boolean} true if valid, false otherwise.
 */
function isNumberValid(number, base){
  if(number==null || !isValidBase(base)){
    return false;
  }
  var i;
  var hasDecimal = false;
  var temp = "";
  for(i = 0; i<number.length; i++){
    temp = number.charAt(i);
    if(!isSign(temp) && temp!=SPACE)
      break;
  }
  for(; i<number.length; i++){
    temp = number.charAt(i);
    if(!isRadixPoint(temp)){
      if(temp!=SPACE){
        temp = getValue(temp, false);
        if(temp==null || temp>=base){
          return false;
        }
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
 * Checks if a base is valid
 * @param {number} base Base to validate 
 */
function isValidBase(base){
  return base!=null && base>1 && base<36;
}

/**
 * Trims the numbers sign to 1
 * @param {string} number Number to trim
 * @returns {string} Trimmed number
 */
function trimSign(number){
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
  var res = "";
  if(sign==1){
    res += "+";
  }else{
    res += "-";
  }
  res += number.substr(index, num_len);
  return res;
}

/**
 * Removes excess zeroes from a number
 * @param {string} number Number to trim
 * @returns {string} Trimmed number 
 */
function trimNumber(number){
  var res = "";
  for(let i=0; i<number.length; i++){
    if(isSign(number.charAt(i))){
      res = res.concat(number.charAt(i));
      continue;
    }else if(number.charAt(i)!='0' || (number.charAt(i)=='0' && number.length > i && isSign(number.charAt(i+1)))){
      res = res.concat(number.substr(i));
      break;
    }
  }
  if(res.split(/[.,]/).length==2){
    let i;
    for(i=res.length-1; i>=0; i--){
      if(res.charAt(i)!='0'){
        if(isRadixPoint(res.charAt(i))){
          i--;
        }
        break;
      }
    }
    if(i+1>PRECISION){
      res = res.substr(0,i+1);
    }else{
      res = res.substr(0,PRECISION);
    }
  }

  return res;
}

/**
 * Modifies number to fit the standards
 * @param {string} number Number to standardize
 * @param {number} base Base of the number
 * @param {boolean} log Should log
 * @returns {string} Standardized number
 */
function standardizeNumber(number, base, log=true){
  if(isNumberValid(number, base)){
    var res = number.replace(SPACE, "");
    res = trimSign(res);
    res = trimNumber(res);
    return res;
  }else{
    addToStackTrace("standardizeNumber", "Invalid number \"" + number + "\"", log);
    return null;
  }
}

/**
 * Checks if the given string is a sign
 * @param {string} number String to check
 * @returns {boolean} true if string has a sign, false otherwise
 */
function hasSign(number){
  var sign = number.trim().charAt(0);
  return sign==MINUS || sign==PLUS;
}

/**
 * Gets sign multiplier for a signed number
 * @param {string} number Number to operate on
 * @param {boolean} [standardized=false] Treat as standardized 
 * @returns {number} 1 if positive, -1 if negative, 0 if invalid
 */
function getSignMultiplier(number, standardized=false){
  if(standardized){
    var sign = number.charAt(0);
    if(sign==MINUS){
      return -1;
    } else if(sign==PLUS){
      return 1;
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
 * Converts given nimber from given base to base 10
 * @param {string} number Standardized Signed Number to convert
 * @param {number} base Base to convert from
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} Number converted to base 10
 */
function toDecimal(number, base, standardized=false, log=true){
  if(!isValidBase(base)){
    addToStackTrace("toDecimal", "Invalid base \"" + base + "\"");
    return null;
  } 
  if(!standardized){
    // number = trimSign(number);
    number = standardizeNumber(number, base, true);
    if(number == null){
      return null;
    }
  }

  var radix = number.split(/[.,]/);
  // if(!standardized){
  //   if(radix.length>2){
  //     if(log)
  //       console.log("Conversion Error: Multiple Radix Points in \"" + number + "\"");
  //     return null;
  //   }
  // }
  
  var res = number.charAt(0);
  var num_length = radix[0].length-1;
  var decimal = 0;
  let i = 0;
  // if(standardized){
    while(num_length>0){
      decimal += getValueAt(radix[0], num_length, log) * Math.pow(base,i);
      i++;
      num_length--;
    }
  // }else{
  //   let temp;
  //   while(num_length>0){
  //     temp = getValueAt(radix[0], num_length, log);
  //     if(temp==null){
  //       if(log)
  //         console.error("Conversion Error: Unknown symbol \"" + radix[0].charAt(num_length) + "\" in \"" + number + "\"");
  //       return null;
  //     }else if(temp >= base){
  //       if(log)
  //         console.error("Conversion Error: Unknown symbol \"" + radix[0].charAt(num_length) + "\" in number \"" + number + "\" for base " + base);
  //       return null;
  //     }else{
  //       decimal += temp * Math.pow(base,i);
  //     }
  //     i++;
  //     num_length--;
  //   }
  // }
  res = res + decimal.toString();

  if(radix.length==2){
    var fraction = 0;
    res = res.concat(".");
    var frac_len = radix[1].length;
    // if(standardized){
      for(let i = 0; i<frac_len; i++){
        fraction += (Math.floor(getValueAt(radix[1], i, log) * PRECISION_NUMBER / Math.pow(base, i+1)));
      }
    // }else{
    //   let temp;
    //   for(let i = 0; i<frac_len; i++){
    //     temp = getValueAt(radix[1], i, log);
    //     if(temp==null){
    //       if(log)
    //         console.error("Conversion Error: Unknown symbol \"" + radix[1].charAt(num_length) + "\" in \"" + number + "\"");
    //       return null;
    //     }else if(temp >= base){
    //       if(log)
    //         console.error("Conversion Error: Unknown symbol \"" + radix[1].charAt(num_length) + "\" in number \"" + number + "\" for base " + base);
    //       return null;
    //     }else{
    //       fraction += (Math.floor(temp * PRECISION_NUMBER / Math.pow(base, i+1)));
    //     }
    //   }
    // }
    res = res.concat(fraction.toString());
  }

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
  if(!isValidBase(base)){
    error = "fromDecimal: Invalid base " + base;
    error_message = error_message.concat(error);
    if(log)
      console.error(error);
    return null;
  }
  if(!standardized){
    if(!isNumberValid(number, 10)){
      error = "fromDecimal: Invalid number \"" + number + "\" for base 10";
      error_message = error_message.concat(error);
      if(log)
        console.error(error);
      return null;
    }else{
      number = standardizeNumber(number, 10);
    }
  }
  
  var res = getSign(number, true);
  var num_arr = [];

  var radix = number.split(/[.,]/);
  // if(radix.length>2){
  //   console.log("Conversion Error: Multiple Radix Points in \"" + number + "\"");
  //   return null;
  // }

  var whole = baseToDecimalInteger(radix[0], 10);
  if(whole<0){
    whole = -whole;
  }
  while(whole>0){
    num_arr.push(toValue(whole%base));
    whole = Math.floor(whole/base);
  }
  num_arr.reverse();
  for(var i = 0; i<num_arr.length; i++){
    res = res.concat(num_arr[i]);
  }
  
  if(radix.length==2){
    if(radix[1].replace(SPACE, "").length>PRECISION){
      radix[1] = radix[1].replace(SPACE, "").substr(0, PRECISION);
    }
    radix[1] = addZeroesAfter(radix[1], PRECISION); //TODO Trim to precision in standardize
    var frac = baseToDecimalInteger(radix[1], 10);
    res = res.concat(".");
    var limit = 0;
    var temp = 0;
    while(frac>0 && limit<PRECISION){
      frac = frac*base;
      temp = Math.floor(frac/PRECISION_NUMBER);
      frac -= temp*PRECISION_NUMBER;
      res = res.concat(temp);
      limit++;
    }
  }

  return res;
}

function convertBases(number, base_from, base_to){
  if(!isValidBase(base1) || !isValidBase(base2)){
    console.error("Invalid base");
    return null;
  }
  var std_val = standardizeNumber(val, base1);
  if(std_val==null){
    return null;
  }
  if(base1==base2){
    return std_val;
  }
  var res = fromDecimal(toDecimal(std_val, base1, true), base2, true);
  return res;
}

function baseToDecimalInteger(number, base, standardized=false, log=true){
  if(!standardized)
    number = trimSign(number);

  var radix = number.split(/[.,]/);
  if(!standardized){
    if(radix.length>2){
      error = "Multiple Radix Points in \"" + number + "\"";
      error_message = error_message.concat("Conversion Error: " + error);
      if(log)
        console.log("Conversion Error: " + error);
      return null;
    }
  }

  var num_length = radix[0].length-1;
  var decimal = 0;
  var i = 0;
  var temp;
  while(num_length>0){
    temp = getValueAt(radix[0], num_length, log);
    if(temp==null){

      console.error("Conversion Error: Unknown symbol \"" + number.charAt(num_length) + "\" in \"" + number + "\"");
      return null;
    }else if(temp >= base){
      console.error("Conversion Error: Unknown symbol \"" + number.charAt(num_length) + "\" in number \"" + number + "\" for base " + base);
      return null;
    }else{
      decimal += temp * Math.pow(base,i);
    }
    i++;
    num_length--;
  }

  decimal *= getSignMultiplier(number, standardized);
  return decimal;
}

function addZeroesAfter(number, total){
  var offset = 0;
  if(hasSign(number)){
    for(let i=0; i<number.length; i++){
      if(isSignAt(number, i))//TODO Make getSignEnd(number);
        offset++;
      else {
        break;
      }
    }
  }
  console.log("t2 - " + number + " " + offset);

  var toAdd = total - number.substr(offset).replace(/[.,]/, "").length;
  console.log("aza " + number.substr(offset).replace(/[.,]/, "") + " " + number.substr(offset).replace(/[.,]/, "").length);

  if(toAdd>0){
    for(let i=0; i<toAdd; i++){
      number = number.concat("0");
    }
  }
  return number;
}

function addZeroesBefore(number, total){
  var offset = 0;
  if(hasSign(number)){
    for(i=0; i<number.length; i++){
      if(number[i]=='-' || number[i]=='+')//TODO Make isSign(number, pos) and getSignEnd(number);
        offset++;
      else {
        break;
      }
    }
  }


  var res = "";
  var toAdd = total - number.substr(offset).replace(/[.,]/, "").length;
  console.log(total + " " + number.substr(offset).replace(/[.,]/, "") + " " + toAdd);

  if(toAdd<0)
    return number;

  for(i = 0; i<number.length; i++){
    if(number[i] != '+' && number[i]!='-'){
      for(j=0; j<toAdd; j++){
        res+="0";
      }
      res += number.substr(i);
      break;
    }else{
      res += number[i];
    }
  }
  return res;
}







function digitToBinary(digit){
  val = getValueAt(digit, 0);
  //console.log(val);
  if(val>9)
    return null;
  var arr = [];
  while(val >0){

    arr.push((val%2).toString());
    //console.log(arr);
    val = Math.floor(val/2);
  }
  //console.log(arr.reverse().join(""));
  if(arr.length==0){
    return "0000";
  }else
  return addZeroesBefore(arr.reverse().join(""), 4);
}

function decimalTo8421(number){
  var res = "";
  var limit = 5;
  var c = 0;
  for(v=0; v<number.length; v++){
    if(c==limit)
      return null;
    temp = digitToBinary(number[v]);
    console.log(v + " " + number[v] + " " + temp);
    if(temp == null)
      return null;
    res += temp;
    c++;
  }
  return res;
}
