/**
 * Converts given number to the specified type
 * @param {UOARNumber} number Number to convert 
 * @param {NumberType} type Type to convert to
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to the specified type
 */
function convertToType(number, type, standardized=false, log=true) {
  if (number.number_type == type)
    return number;
  switch (type) {
    case NumberTypes.UNSIGNED:
      return convertToUnsigned(number, standardized, log);
    case NumberTypes.SIGNED:
      return convertToSigned(number, standardized, log);
    case NumberTypes.SMR:
      return convertToSMR(number, standardized, log);
    case NumberTypes.OC:
      return convertToOC(number, standardized, log);
    case NumberTypes.TC:
      return convertToTC(number, standardized, log);
  }
  return null;
}

/**
 * Converts given number to an unsigned number
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to an unsigned number
 */
function convertToUnsigned(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number===null){
      addToStackTrace("convertToUnsigned", "Number is invalid", log);
      return null;
    }
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      return number;
    case NumberTypes.SIGNED:
      if(number.sign==MINUS){
        addToStackTrace("convertToUnsigned", "Warning! Converting negative number to unsigned", log);
      }
      number.sign = "";
      number.number_type = NumberTypes.UNSIGNED;
      return number;
    case NumberTypes.SMR:
      if(number.sign!="0"){
        addToStackTrace("convertToUnsigned", "Warning! Converting negative number to unsigned", log);
      }
      number.sign = "";
      number.number_type = NumberTypes.UNSIGNED;
      return number;
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(number.sign!="0"){
        complement(number, true, false);
        addToStackTrace("convertToUnsigned", "Warning! Converting negative number to unsigned", log);
      }
      number.sign = "";
      number.number_type = NumberTypes.UNSIGNED;
      return number;
  }
  return null;
}

/**
 * Converts given number to a signed number
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to a signed number
 */
function convertToSigned(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number===null){
      addToStackTrace("convertToSigned", "Number is invalid", log);
      return null;
    }
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.SIGNED;
      number.sign = PLUS;
      return number;
    case NumberTypes.SIGNED:
      return number;
    case NumberTypes.SMR:
      number.number_type = NumberTypes.SIGNED;
      if(number.sign=="0"){
        number.sign = PLUS;
      }else{
        number.sign = MINUS;
      }
      return number;
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(number.sign=="0"){
        number.sign = PLUS;
      }else{
        complement(number, true, false);
        number.sign = MINUS;
      }
      number.number_type = NumberTypes.SIGNED;
      return number;
  }
  return null;
}

/**
 * Converts given number to Signed Magnitude Representation
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to Signed Magnitude Representation
 */
function convertToSMR(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number===null){
      addToStackTrace("convertToSMR", "Number is invalid", log);
      return null;
    }
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.SMR;
      number.sign = "0";
      return number;
    case NumberTypes.SIGNED:
      number.number_type = NumberTypes.SMR;
      if(number.sign == MINUS){
        number.sign = toValue(number.base-1, false);
      }else{
        number.sign = "0";
      }
      return number;
    case NumberTypes.SMR:
      return number;
    case NumberTypes.OC:
    case NumberTypes.TC:
      if(number.sign!="0"){
        complement(number, true, false);
        number.sign = toValue(number.base, true, false);
      }
      number.number_type = NumberTypes.SMR;
      return number;
  }
  return null;
}

/**
 * Converts given number to One's complement
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to One's complement 
 */
function convertToOC(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number===null){
      addToStackTrace("convertToOC", "Number is invalid", log);
      return null;
    }
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.OC;
      number.sign = "0";
      return number;
    case NumberTypes.SIGNED:
      number.number_type = NumberTypes.OC;
      if(number.sign==MINUS){
        number.sign = "0";
        complement(number, true, false);
      }else{
        number.sign = "0";
      }
      return number;
    case NumberTypes.SMR:
      number.number_type = NumberTypes.OC;
      if(number.sign!="0"){
        number.sign = "0";
        complement(number, true, false);
      }
      return number;
    case NumberTypes.OC:
      return number;
    case NumberTypes.TC:
      number.number_type = NumberTypes.OC;
      if(number.sign!="0"){
        number = addToLowestPoint(number, -1, false);
      }
      return number;
  }
  return null;
}

/**
 * Converts given number to Two's complement
 * @param {UOARNumber} number Number to convert
 * @param {boolean} [standardized=false] Treat as standardized 
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to Two's complement 
 */
function convertToTC(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number===null){
      addToStackTrace("convertToTC", "Number is invalid", log);
      return null;
    }
  }
  switch(number.number_type){
    case NumberTypes.UNSIGNED:
      number.number_type = NumberTypes.TC;
      number.sign = "0";
      return number;
    case NumberTypes.SIGNED:
      number.number_type = NumberTypes.TC;
      if(number.sign == MINUS){
        number.sign = "0";
        complement(number, true, false);
      }else{
        number.sign = "0";
      }
      return number;
    case NumberTypes.SMR:
      number.number_type = NumberTypes.TC;
      if(number.sign!="0"){
        number.sign = "0";
        complement(number, true, false);
      }
      return number;
    case NumberTypes.OC:
      number.number_type = NumberTypes.TC;
      if(number.sign!="0"){
        number = addToLowestPoint(number, 1, false);
      }
      return number;
    case NumberTypes.TC:
      return number;
  }
  return null;
}

/**
 * Adds toAdd to the lowest point of number
 * @param {UOARNumber} number Number to add to
 * @param {number} toAdd Number to add
 * @param {boolean} [log=true] Should log
 * @return {UOARNumber} Number with added toAdd
 */
function addToLowestPoint(number, toAdd, log=true){ //TODO Support adding negative numbers
  let sign = "";
  let whole = "";
  let fraction = "";
  var carry = toAdd;
  var temp;
  
  for(let i=number.fraction.length-1; i>=0; i--){
    temp = getValueAt(number.fraction, i, log) + carry;
    fraction = toValue(temp%base) + fraction;
    carry = Math.floor(temp/base);
  }
  for(let i=number.whole.length-1; i>=0; i--){
    temp = getValueAt(number.whole, i, log) + carry;
    whole = toValue(temp%base) + whole;
    carry = Math.floor(temp/base);
  }

  if(carry!=0){
    switch(number.number_type){
      case NumberTypes.UNSIGNED:
      case NumberTypes.SIGNED:
        whole = toValue(carry, log) + whole;
        break;
      case NumberTypes.OC:
      case NumberTypes.TC:
        for(let i=number.sign.length-1; i>=0; i--){
          temp = getValueAt(number.whole, i, log) + carry;
          sign = toValue(temp%base) + sign;
          carry = Math.floor(temp/base);
        }
        sign_end = getSignEnd(number.sign, number.base, number.number_type, log);
        whole = sign.substr(sign_end) + whole;
        sign = sign.substr(0, sign_end);
        break;
        
    }
  }
  
  return number;
}