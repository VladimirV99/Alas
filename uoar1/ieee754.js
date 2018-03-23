/**
 * @typedef {Object} IEEE754Special
 * @property {string} value Special Value
 * @property {boolean} special Is Special Value
 * Special IEEE754 Value
 */
/**
 * @typedef {Object} IEEE754Nonspecial
 * @property {string} significand Significand
 * @property {number} exponent Exponent
 * @property {boolean} special Is Special Value
 * Non Special IEEE753 Value
 */

 /**
  * @type {number}
  * @const
  */
var DECIMAL_LENGTH = 7;
var BINARY32_MAX_EXPONENT = 127;

/**
 * Converts a significand and exponent to IEEE754 Binary32
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*2^exponent as IEEE754 Binary32 
 */
function convertToIEEE754Binary32(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeUOARNumber(significand, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Binary32", "Invalid number \"" + std_significand.toSigned() + "\" for base 2", log);
      return null;
    }
    significand = std_significand;
  }
  significand = fromDecimal(significand, 2, true, log);

  let std_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Binary32", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }
  exponent = std_exponent + getNormalizeExponentBinary(significand, true, log); 
  if(exponent>127 || exponent<-126){
    addToStackTrace("convertToIEEE754Binary32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }
  
  significand = normalizeBinary(significand, true, log);
  if(significand.whole.length>23){
    addToStackTrace("convertToIEEE754Binary32", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }else{
    significand = fractionToLength(significand, 23-significand.whole.length, log);
  }

  var res = "";
  if(significand.sign==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  res = res.concat(toLength(fromDecimal(trimSign(toUOARNumber((127+exponent).toString(), 10 , NumberTypes.SIGNED, log)), 2, true, log), 8, 0, log).toUnsigned());

  res = res.concat(SPACE);
  res = res.concat(fractionToLength(significand, 23, log).fraction);

  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Binary64
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*2^exponent as IEEE754 Binary64 
 */
function convertToIEEE754Binary64(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeUOARNumber(significand, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + std_significand.toSigned() + "\" for base 2", log);
      return null;
    }
    significand = std_significand;
  }
  significand = fromDecimal(significand, 2, true, log);
  if(significand.whole.length>52){
    addToStackTrace("convertToIEEE754Binary64", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }else{
    significand = fractionToLength(significand, 52-significand.whole.length, log);
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }
  exponent = std_exponent + getNormalizeExponentBinary(significand, true, log); 
  if(exponent>1023 || exponent<-1022){
    addToStackTrace("convertToIEEE754Binary64", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = normalizeBinary(significand, true, log);

  var res = "";
  if(significand.sign==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  res = res.concat(toLength(fromDecimal(trimSign(toUOARNumber((1023+exponent).toString(), 10 , NumberTypes.SIGNED, log)), 2, true, log), 11, 0, log).toUnsigned());

  res = res.concat(SPACE);
  res = res.concat(fractionToLength(significand, 52, log).fraction);

  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Decimal32 DPD
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*10^exponent as IEEE754 Decimal32 DPD
 */
function convertToIEEE754Decimal32DPD(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeUOARNumber(significand, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Decimal32", "Invalid number \"" + std_significand.toSigned() + "\" for base 10", log);
      return null;
    }
    significand = std_significand;
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Decimal32", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }
  exponent = std_exponent + getNormalizeExponentDecimal(significand, true, log); 
  if(exponent>96 || exponent<-95){
    addToStackTrace("convertToIEEE754Decimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = normalizeDecimal(significand, true, log);
  if(significand==null){
    addToStackTrace("convertToIEEE754Decimal32", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }

  var res = "";
  if(significand.sign==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  var na = addZeroesBefore(digitToBinary(significand.whole, 0), 10, NumberTypes.UNSIGNED, 4, log);
  var nb = wholeToLength(fromDecimal(trimSign(toUOARNumber((101+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 8, log).toUnsigned();
  if(na.charAt(0)=='0'){
    res = res.concat(nb.substr(0,2)+na.substr(1,3)+nb.substr(2,6));
  }else{
    res = res.concat("11"+nb.substr(0, 2)+na.charAt(3)+nb.substr(2, 6));
  }

  res = res.concat(SPACE);
  var nc1 = decimalToDPD(decimalTo8421(significand.whole.substr(1, 3)));
  var nc2 = decimalToDPD(decimalTo8421(significand.whole.substr(4, 3)));
  var nc = nc1 + nc2;
  res = res.concat(nc);
  
  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Decimal32 BID
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*10^exponent as IEEE754 Decimal32 BID 
 */
function convertToIEEE754Decimal32BID(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeUOARNumber(significand, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Decimal32", "Invalid number \"" + std_significand.toSigned() + "\" for base 10", log);
      return null;
    }
    significand = std_significand;
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }
  exponent = std_exponent + getNormalizeExponentDecimal(significand, true, log); 
  if(exponent>96 || exponent<-95){
    addToStackTrace("convertToIEEE754Decimal32BID", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = normalizeDecimal(significand, true, log);
  if(significand==null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }
  significand = wholeToLength(fromDecimal(significand, 2, true, log), 24, log);
  if(significand.whole.length>25){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }

  var res = "";
  if(significand.sign==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  var na = significand.whole.substr(0,4);
  var nb = wholeToLength(fromDecimal(trimSign(toUOARNumber((101+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 8, log).toUnsigned();
  if(na.charAt(0)=='0'){
    res = res.concat(nb+na.substr(1,3));
  }else{
    res = res.concat("11"+nb+na.charAt(3));
  }

  res = res.concat(SPACE);
  res = res.concat(significand.whole.substr(4));
  
  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Hexadecimal32
 * @param {UOARNumber} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*16^exponent as IEEE754 Hexadecimal32 
 */
function convertToIEEE754Hexadecimal32(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeUOARNumber(significand, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + std_significand.toSigned() + "\" for base 10", log);
      return null;
    }
    significand = std_significand;
  }
  significand = fromDecimal(significand, 16, true, log);
  if(significand.whole.length>6){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }else{
    significand = fractionToLength(significand, 6-significand.whole.length, log);
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }
  exponent = std_exponent + getNormalizeExponentHexadecimal(significand, true, log); 
  if(exponent>63 || exponent<-64){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = normalizeHexadecimal(significand, true, log);

  var res = "";
  if(significand.sign==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  res = res.concat(toLength(fromDecimal(trimSign(toUOARNumber((64+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 7, 0, log).toUnsigned());

  res = res.concat(SPACE);
  res = res.concat(decimalTo8421(significand.fraction));

  return res;
}

/**
 * Normalizes a number according to IEEE754 Binary
 * @param {string} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} Normalized binary number
 */
function normalizeBinary(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeUOARNumber(number, log);
    if(std_number == null){
      addToStackTrace("normalizeBinary", "Invalid number \"" + number.toSigned() + "\" for base 2", log);
      return null;
    }
    number = std_number;
  }

  number.fraction = number.whole.substr(1) + number.fraction;
  number.whole = "1";
  return number;
}

/**
 * Gets normalize exponent of a number according to IEEE754 Binary
 * @param {string} number Number to get normalize exponent from
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Binary normalize exponent for number
 */
function getNormalizeExponentBinary(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeUOARNumber(number, log);
    if(std_number == null){
      addToStackTrace("getNormailzeExponentBinary", "Invalid number \"" + number.toSigned() + "\" for base 2", log);
      return null;
    }
    number = std_number;
  }
  if(number.whole=="0"){
    for(let i=0; i<number.fraction.length; i++){
      if(number.fraction.charAt(i)!='0'){
        return -i-1;
      }
    }
  }else{
    return number.whole.length-1;
  }
}

/**
 * Normalizes a number according to IEEE754 Decimal
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Normalized decimal number
 */
function normalizeDecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeUOARNumber(number, log);
    if(std_number == null){
      addToStackTrace("normalizeDecimal", "Invalid number \"" + number.toSigned() + "\" for base 10", log);
      return null;
    }
    number = std_number;
  }

  if(number.whole.length>DECIMAL_LENGTH){
    addToStackTrace("normalizeDecimal", "Number is too large, must be less than " + DECIMAL_LENGTH + " digits", log);
    return null;
  }

  if(number.fraction!=""){
    let carry = 0;
    if(number.fraction.length>DECIMAL_LENGTH-number.whole.length){
      let round = number.fraction.charAt(DECIMAL_LENGTH-number.whole.length);
      if(round>5 || (round==5 && number.fraction.charAt(DECIMAL_LENGTH-number.whole.length)%2==1)){
        carry = 1;
      }
    }
    number.whole = number.whole + number.fraction.substr(0, DECIMAL_LENGTH-number.whole.length);
    number.fraction = "";
    if(carry>0){
      let new_number = add(number, new UOARNumber(number.sign, "1", "", 10, NumberTypes.SIGNED), NumberTypes.SIGNED, true, log);
      if(new_number==null){
        addToStackTrace("normalizeDecimal", "Rounding error");
        return null;
      }
      if(new_number.whole.length<=DECIMAL_LENGTH){
        number = new_number;
      }
    }
  }else{
    let i;
    for(i=number.whole.length-1; i>=0; i--){
      if(number.whole.charAt(i)!='0'){
        break;
      }
    }
    number.whole = number.whole.substr(0, i+1);
  }
  return wholeToLength(number, DECIMAL_LENGTH, log);
}

/**
 * Gets normalize exponent of a number according to IEEE754 Decimal
 * @param {string} number Number to get normalize exponent from
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Decimal normalize exponent for number
 */
function getNormalizeExponentDecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeUOARNumber(number, log);
    if(std_number == null){
      addToStackTrace("getNormalizeExponentDecimal", "Invalid number \"" + number.toSigned() + "\" for base 10", log);
      return null;
    }
    number = std_number;
  }
  if(number.whole.length>DECIMAL_LENGTH){
    addToStackTrace("getNormalizeExponentDecimal", "Number is too large, must be less than " + DECIMAL_LENGTH + " digits", log);
    return null;
  }

  var res = 0;
  if(number.fraction!=""){
    res = -number.fraction.length;
    var max = -DECIMAL_LENGTH+number.whole.length;
    res = res<max ? max : res;
  }else{
    for(let i=number.whole.length-1; i>=0; i--){
      if(number.whole.charAt(i)!='0'){
        res = number.whole.length-i-1;
        break;
      }
    }
  }

  return res;
}

/**
 * Normalizes a number according to IEEE754 Hexadecimal
 * @param {UOARNumber} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Normalized hexadecimal number
 */
function normalizeHexadecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeUOARNumber(number, log);
    if(std_number == null){
      addToStackTrace("normalizeHexadecimal", "Invalid number \"" + number.toSigned() + "\" for base 16", log);
      return null;
    }
    number = std_number;
  }

  var temp;
  for(let i=0; i<number.whole.length; i++){
    temp = number.whole.charAt(i);
    if(temp!='0'){
      number.fraction = number.whole.substr(i) + number.fraction;
      number.whole="0";
      return number;
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    temp = number.fraction.charAt(i);
    if(temp!='0'){
      number.fraction = number.fraction.substr(i);
      number.whole="0";
      return number;
    }
  }
}

/**
 * Gets normalize exponent of a number according to IEEE754 Hexadecimal
 * @param {UOARNumber} number Number to get normalize exponent from
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Hexadecimal normalize exponent for number
 */
function getNormalizeExponentHexadecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeUOARNumber(number, log);
    if(std_number == null){
      addToStackTrace("getNormalizeExponentHexadecimal", "Invalid number \"" + number.toSigned() + "\" for base 10", log);
      return null;
    }
    number = std_number;
  }

  var temp;
  for(let i=0; i<number.whole.length; i++){
    temp = number.whole.charAt(i);
    if(temp!='0'){
      return number.whole.length-i;
    }
  }
  for(let i=0; i<number.fraction.length; i++){
    temp = number.fraction.charAt(i);
    if(temp!='0'){
      return -i;
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
  if(!isNumberValid(number, 2)){
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
  if(number==null || number.length!=length){
    return false;
  }
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

  var significand = "";
  if(number.charAt(0)=="1"){
    significand = significand.concat("-");
  }else{
    significand = significand.concat("+");
  }

  var exponent = baseToDecimalInteger(number.substr(1, 8), 2)-127;

  if(exponent==-127){
    let temp = trimNumber(significand+"0."+number.substr(9, 23));
    exponent += 1+getNormalizeExponentBinary(temp, true, log);
    significand = normalizeBinary(temp);
  }else{
    significand = trimNumber(significand.concat("1."+number.substr(9, 23)));
  }

  var arr = significand.split(/[.,]/);
  if(arr.length==2){
    if(arr[1].length>5){
      exponent -= arr[1].length-5;
      arr = (arr[0] + arr[1].slice(0, arr[1].length-5) + "." + arr[1].slice(arr[1].length-5)).split(/[.,]/);
      significand = arr.join(".");
    }else if(arr[1].length<5){
      exponent -= arr[1].length;
      significand = arr.join("");
    }
  }
  
  significand = toDecimal(significand, 2);

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

  var significand = "";
  if(number.charAt(0)=="1"){
    significand = significand.concat("-");
  }else{
    significand = significand.concat("+");
  }

  var exponent = baseToDecimalInteger(number.substr(1, 11), 2)-1023;

  if(exponent==-1023){
    let temp = trimNumber(significand+"0."+number.substr(11, 52));
    exponent += 1+getNormalizeExponentBinary(temp, true, log);
    significand = normalizeBinary(temp);
  }else{
    significand = trimNumber(significand.concat("1."+number.substr(11, 52)));
  }

  var arr = significand.split(/[.,]/);
  if(arr.length==2){
    if(arr[1].length>5){
      exponent -= arr[1].length-5;
      arr = (arr[0] + arr[1].slice(0, arr[1].length-5) + "." + arr[1].slice(arr[1].length-5)).split(/[.,]/);
      significand = arr.join(".");
    }else if(arr[1].length<5){
      exponent -= arr[1].length;
      significand = arr.join("");
    }
  }
  
  significand = toDecimal(significand, 2);

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}

/**
 * Converts an IEEE754 Decimal32 to a significand and exponent
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {IEEE754Nonspecial} Object containing significand and exponent
 */
function convertFromIEEE754Decimal32(number, log=true){
  if(!isValidIEEE754(number, 32)){
    addToStackTrace("convertFromIEEE754Decimal32", "Invalid IEEE754 Decimal32 number \"" + number + "\"", log);
    return null;
  }

  var res = getSpecialValueDecimal32(number);
  if(res!=null){
    return res;
  }

  var significand = "";
  if(number.charAt(0)=="1"){
    significand = significand.concat("-");
  }else{
    significand = significand.concat("+");
  }

  var temp = "";
  if(number.substr(1, 2)=="11"){
    significand = significand.concat(binaryToDigit("100" + number.charAt(5)));
    temp = number.substr(3, 2) + number.substr(6, 6);
  }else{
    significand = significand.concat(binaryToDigit("0" + number.substr(3, 3)));
    temp = number.substr(1,2) + number.substr(6, 6);
  }

  var exponent = baseToDecimalInteger(temp, 2)-101;

  significand = significand.concat(decimalFrom8421(DPDtoDecimal(number.substr(12, 10))) + decimalFrom8421(DPDtoDecimal(number.substr(22, 10))));
  significand = trimNumber(significand);

  exponent += getNormalizeExponentDecimal(significand, true, log);
  significand = normalizeDecimal(significand, true, log);

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

  var significand = "";
  if(number.charAt(0)=="1"){
    significand = significand.concat("-");
  }else{
    significand = significand.concat("+");
  }

  var exponent = baseToDecimalInteger(number.substr(1, 7), 2)-64;

  significand = trimNumber(significand+"0."+decimalFrom8421(number.substr(8, 24)));

  var arr = significand.split(/[.,]/);
  if(arr.length==2){
    if(arr[1].length>5){
      exponent -= arr[1].length-5;
      arr = (arr[0] + arr[1].slice(0, arr[1].length-5) + "." + arr[1].slice(arr[1].length-5)).split(/[.,]/);
      significand = arr.join(".");
    }else if(arr[1].length<5){
      exponent -= arr[1].length;
      significand = trimNumber(arr.join(""));
    }
  }
  
  significand = toDecimal(significand, 16);

  res = {"significand": significand, "exponent": exponent, "special": false};
  return res;
}
