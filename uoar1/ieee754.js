/**
 * Converts a significand and exponent to IEEE754 Binary32
 * @param {string} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*2^exponent as IEEE754 Binary32 
 */
function convertToIEEE754Binary32(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeNumber(significand, 10, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Binary32", "Invalid number \"" + std_significand + "\" for base 2", log);
      return null;
    }
    significand = std_significand;
  }
  significand = convertBases(significand, 10, 2, true, log);
  if(significand.split(/[.,]/)[0].length>2+23){
    addToStackTrace("convertToIEEE754Binary32", "Significand out of bounds \"" + significand + "\"", log);
    return null;
  }else{
    significand = significand.substr(0, 3+23);
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Binary32", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }exponent = std_exponent + getNormalizeExponentBinary(significand, true, log); 
  if(exponent>127 || exponent<-126){
    addToStackTrace("convertToIEEE754Binary32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }
  
  significand = normalizeBinary(significand, true, log);

  console.log(significand + " * 2 ^ " + exponent);

  var res = "";
  if(significand.charAt(0)==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  res = res.concat(addZeroesBefore(fromDecimal(trimSign((127+exponent).toString()), 2, true, log), 8).substr(1));

  res = res.concat(SPACE);
  res = res.concat(addZeroesAfter(significand.split(/[.,]/)[1], 23));

  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Binary64
 * @param {string} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*2^exponent as IEEE754 Binary64 
 */
function convertToIEEE754Binary64(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeNumber(significand, 10, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + std_significand + "\" for base 2", log);
      return null;
    }
    significand = std_significand;
  }
  significand = convertBases(significand, 10, 2, true, log);
  if(significand.split(/[.,]/)[0].length>2+52){
    addToStackTrace("convertToIEEE754Binary64", "Significand out of bounds \"" + significand + "\"", log);
    return null;
  }else{
    significand = significand.substr(0, 3+52);
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }exponent = std_exponent + getNormalizeExponentBinary(significand, true, log); 
  if(exponent>1023 || exponent<-1022){
    addToStackTrace("convertToIEEE754Binary64", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = normalizeBinary(significand, true, log);
  
  console.log(significand + " * 2 ^ " + exponent);

  var res = "";
  if(significand.charAt(0)==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  res = res.concat(addZeroesBefore(fromDecimal(trimSign((1023+exponent).toString()), 2, true, log), 11).substr(1));

  res = res.concat(SPACE);
  res = res.concat(addZeroesAfter(significand.split(/[.,]/)[1], 52));

  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Decimal32
 * @param {string} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*10^exponent as IEEE754 Decimal32 
 */
function convertToIEEE754Decimal32(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeNumber(significand, 10, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Decimal32", "Invalid number \"" + std_significand + "\" for base 2", log);
      return null;
    }
    significand = std_significand;
  }
  if(significand.split(/[.,]/)[0].length>2+7){
    addToStackTrace("convertToIEEE754Decimal32", "Significand out of bounds \"" + significand + "\"", log);
    return null;
  }else{
    significand = significand.substr(0, 3+7);
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Decimal32", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }exponent = std_exponent + getNormalizeExponentDecimal(significand, true, log); 
  if(exponent>96 || exponent<-95){
    addToStackTrace("convertToIEEE754Decimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = addZeroesBefore(normalizeDecimal(significand, true, log), 7);

  console.log(significand + " * 10 ^ " + exponent);

  var res = "";
  if(significand.charAt(0)==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  var na = addZeroesBefore(digitToBinary(significand, 1), 4);
  var nb = addZeroesBefore(fromDecimal(trimSign((101+exponent).toString()), 2), 8).substr(1);
  if(na.charAt(0)=='0'){
    res = res.concat(nb.substr(0,2)+na.substr(1,3)+nb.substr(2,6));
  }else{
    res = res.concat("11"+nb.substr(0, 2)+na.charAt(3)+nb.substr(2, 6));
  }

  res = res.concat(SPACE);
  var nc1 = decimalToDPD(decimalTo8421(significand.substr(2, 3)));
  var nc2 = decimalToDPD(decimalTo8421(significand.substr(5, 3)));
  var nc = nc1 + nc2;
  res = res.concat(nc);
  
  return res;
}

/**
 * Converts a significand and exponent to IEEE754 Hexadecimal32
 * @param {string} significand Significand
 * @param {string} exponent Exponent
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} significand*16^exponent as IEEE754 Hexadecimal32 
 */
function convertToIEEE754Hexadecimal32(significand, exponent, standardized=false, log=true){
  if(!standardized){
    let std_significand = standardizeNumber(significand, 10, log);
    if(std_significand==null){
      addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + std_significand + "\" for base 10", log);
      return null;
    }
    significand = std_significand;
  }
  significand = convertBases(significand, 10, 16, true, log);
  if(significand.split(/[.,]/)[0].length>2+6){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Significand out of bounds \"" + significand + "\"", log);
    return null;
  }else{
    significand = significand.substr(0, 3+6);
  }

  let std_exponent = baseToDecimalInteger(exponent, 10, false, log);
  if(std_exponent==null){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + std_exponent + "\" for base 10", log);
    return null;
  }exponent = std_exponent + getNormalizeExponentHexadecimal(significand, true, log); 
  if(exponent>63 || exponent<-64){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = normalizeHexadecimal(significand, true, log);
  
  console.log(significand + " * 16 ^ " + exponent);

  var res = "";
  if(significand.charAt(0)==MINUS){
    res = res.concat("1");
  }else{
    res = res.concat("0");
  }

  res = res.concat(SPACE);
  res = res.concat(addZeroesBefore(fromDecimal(trimSign((64+exponent).toString()), 2, true, log), 7).substr(1));

  res = res.concat(SPACE);
  res = res.concat(addZeroesAfter(decimalTo8421(significand.split(/[.,]/)[1]), 24));

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
    let std_number = standardizeNumber(number, 2, log);
    if(std_number == null){
      addToStackTrace("normalizeBinary", "Invalid number \"" + number + "\" for base 2", log);
      return null;
    }
    number = std_number;
  }

  var res = number.charAt(0)+"0";
  var temp;
  for(let i=1; i<number.length; i++){
    temp = number.charAt(i);
    if(temp!='0' && !isRadixPoint(temp)){
      res = res.concat(temp);
      if(number.length>i){
        res = res.concat("." + number.substr(i+1).replace(/[.,]/, ""));
      }
      break;
    }
  }
  res = trimNumber(res);
  return res;
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
    let std_number = standardizeNumber(number, 2, log);
    if(std_number == null){
      addToStackTrace("getNormailzeExponentBinary", "Invalid number \"" + number + "\" for base 2", log);
      return null;
    }
    number = std_number;
  }
  var foundRadix = false;
  var foundNonZero = false;
  var a, b;
  for(let i=1; i<number.length; i++){
    if(!foundRadix && isRadixPointAt(number, i)){
      a = i;
      if(foundNonZero){
        a--;
        break;
      }else{
        foundRadix = true;
      }
    }else if(!foundNonZero && number.charAt(i)!='0'){
      b = i;
      if(foundRadix){
        break;
      }else{
        foundNonZero = true;
      }
    }
  }
  return a-b;
}

/**
 * Normalizes a number according to IEEE754 Decimal
 * @param {string} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} Normalized decimal number
 */
function normalizeDecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeNumber(number, 10, log);
    if(std_number == null){
      addToStackTrace("normalizeDecimal", "Invalid number \"" + number + "\" for base 2", log);
      return null;
    }
    number = std_number;
  }

  var res = number.split(/[.,]/);
  if(res[0].length>8){
    addToStackTrace("normalizeDecimal", "Number is too large, must be less than " + length + " digits", log);
    return null;
  }
  if(res.length==2){
    res[1] = res[1].substr(0, 8-res[0].length);
  }
  res = res.join("");
  return res;
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
    let std_number = standardizeNumber(number, 10, log);
    if(std_number == null){
      addToStackTrace("getNormalizeExponentDecimal", "Invalid number \"" + number + "\" for base 10", log);
      return null;
    }
    number = std_number;
  }

  var arr = number.split(/[.,]/);
  if(arr[0].length>8){
    addToStackTrace("trimToLength", "Number is too large, must be less than 8 digits", log);
    return null;
  }
  if(arr.length==2){
    arr[1] = arr[1].substr(0, 8-arr[0].length);
  }
  number = arr.join(".");

  var res = 0;
  var arr = number.split(/[.,]/);
  if(arr.length==2){
    res = -arr[1].length;
  }else if(arr.length==1){
    for(let i=number.length-1; i>=0; i--){
      if(number.charAt(i)!='0'){
        res = arr[0].length-i-1;
        break;
      }
    }
  }
  return res;
}

/**
 * Normalizes a number according to IEEE754 Hexadecimal
 * @param {string} number Number to normalize
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {string} Normalized hexadecimal number
 */
function normalizeHexadecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeNumber(number, 16, log);
    if(std_number == null){
      addToStackTrace("normalizeHexadecimal", "Invalid number \"" + number + "\" for base 16", log);
      return null;
    }
    number = std_number;
  }

  var res = number.charAt(0)+"0";
  var temp;
  for(let i=1; i<number.length; i++){
    temp = number.charAt(i);
    if(temp!='0' && !isRadixPoint(temp)){
      res = res.concat("." + number.substr(i).replace(/[.,]/, ""));
      break;
    }
  }
  return res;
}

/**
 * Gets normalize exponent of a number according to IEEE754 Hexadecimal
 * @param {string} number Number to get normalize exponent from
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {number} Hexadecimal normalize exponent for number
 */
function getNormalizeExponentHexadecimal(number, standardized=false, log=true){
  if(!standardized){
    let std_number = standardizeNumber(number, 16, log);
    if(std_number == null){
      addToStackTrace("getNormalizeExponentHexadecimal", "Invalid number \"" + number + "\" for base 16", log);
      return null;
    }
    number = std_number;
  }
  var foundRadix = false;
  var foundNonZero = false;
  var a, b;
  for(let i=1; i<number.length; i++){
    if(!foundRadix && isRadixPointAt(number, i)){
      a = i;
      if(foundNonZero){
        a--;
        break;
      }else{
        foundRadix = true;
      }
    }else if(!foundNonZero && number.charAt(i)!='0'){
      b = i;
      if(foundRadix){
        break;
      }else{
        foundNonZero = true;
      }
    }
  }
  return a-b+1;
}

/**
 * Converts decimal number to DPD
 * @param {string} number Number to convert 
 * @param {boolean} [log=true] Should log
 * @returns {string} Decimal number converted to DPD 
 */
function decimalToDPD(number, log=true){
  if(!isNumberValid(number, 2)){
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