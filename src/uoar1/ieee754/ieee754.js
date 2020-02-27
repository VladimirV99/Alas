import { 
  NumberTypes, ArithmeticOperations, UOARNumber, PLUS, MINUS, isInBounds, standardizeUOARNumber, toUOARNumber, fromDecimal, toDecimal, digitToBinary, trimNumber,
  baseToDecimalInteger, numberToBinary, wholeToLength, fractionToLength, trimSign, toLength, addZeroesBefore, decimalTo8421, decimalFrom8421, add, isGreater, createZeroString
} from '../uoar_core';
import { 
  IEEE754Formats, IEEE754Number, SignificandExponentPair, BINARY32, BINARY64, DECIMAL32, HEXADECIMAL32,
  normalizeBinary, normalizeDecimal, normalizeHexadecimal, decimalToDPD, DPDtoDecimal, toIEEE754Number, isValidIEEE754,
  getSpecialValueBinary32, getSpecialValueBinary64, getSpecialValueDecimal32, BINARY32_SPECIAL_VALUES
} from '../ieee754_core';
import { addToStackTrace, getStackTrace, clearStackTrace, addToOutput, getOutput, clearOutput } from '../output';

import '../common.scss';

function convertToIEEE754(format, log=true){
  let solution = document.getElementById('solution1');
  let error = document.getElementById('error1');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();
  addToOutput("<hr>");

  let significand = document.getElementById('input_significand').value;
  let exponent = document.getElementById('input_exponent').value;
  if(significand==""){
    addToStackTrace("convertToIEEE754", "Significand is empty", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(exponent == "")
    exponent = "0";
  significand = toUOARNumber(significand, 10, NumberTypes.SIGNED, false);
  if(significand==null){
    addToStackTrace("convertToIEEE754", "Significand is invalid", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  
  let res = null;
  switch(format){
    case IEEE754Formats.BINARY32:
      res = convertToIEEE754Binary32(significand, exponent);
      break;
    case IEEE754Formats.BINARY64:
      res = convertToIEEE754Binary64(significand, exponent);
      break;
    case IEEE754Formats.DECIMAL32DPD:
      res = convertToIEEE754Decimal32DPD(significand, exponent);
      break;
    case IEEE754Formats.DECIMAL32BID:
      res = convertToIEEE754Decimal32BID(significand, exponent);
      break;
    case IEEE754Formats.HEXADECIMAL32:
      res = convertToIEEE754Hexadecimal32(significand, exponent);
      break;
    default:
      addToStackTrace("convertToIEEE754", "Invalid operation", log);
      res = null;
  }
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

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
  let work1 = "";
  let work2 = "";
  work1 = work1.concat(significand.sign + "(" + significand.toUnsigned() + ")10");
  significand = fromDecimal(significand, 2, true, false);
  work2 = work2.concat(significand.sign + "(" + significand.toUnsigned() + ")2");
  if(significand.whole.length>BINARY32.SIGNIFICAND_LENGTH){
    let res;
    if(significand.sign==PLUS)
      res = new IEEE754Number("0", "11111111", "00000000000000000000000");
    else
      res = new IEEE754Number("1", "11111111", "00000000000000000000000");
    addToOutput("<p>"+res.toString()+"</p>");
    return res;
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Binary32", "Invalid exponent \"" + exponent + "\" for base 10", log);
    return null;
  }
  work1 = work1.concat(" * 2^" + exponent);
  work2 = work2.concat(" * 2^" + exponent);

  let normalize_exponent = normalizeBinary(significand, true, log);
  exponent = exponent + normalize_exponent;
  if(!isInBounds(exponent, BINARY32.MIN_EXPONENT, BINARY32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Binary32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }
  addToOutput("<p>" + work1 + " = " + work2 + " = " + significand.sign + "(" + significand.toUnsigned() + ")2 * 2^" + exponent + "</p>");
  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH-significand.whole.length, log);

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent = toLength(fromDecimal(trimSign(toUOARNumber((BINARY32.OFFSET+exponent).toString(), 10 , NumberTypes.SIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();
  addToOutput("<p>eksp: " + exponent.toString() + " + " + BINARY32.OFFSET.toString() + " = " + (BINARY32.OFFSET+exponent) + " = (" + res_exponent + ")2 </p>");
  let res_significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, log).fraction;
  let res = new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.BINARY32);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

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
  let work1 = "";
  let work2 = "";
  work1 = work1.concat(significand.sign + "(" + significand.toUnsigned() + ")10");
  significand = fromDecimal(significand, 2, true, false);
  work2 = work2.concat(significand.sign + "(" + significand.toUnsigned() + ")2");
  if(significand.whole.length>BINARY64.SIGNIFICAND_LENGTH){
    let res;
    if(significand.sign==PLUS){
      res = new IEEE754Number("0", "11111111111", "0000000000000000000000000000000000000000000000000000");
    }else{
      res = new IEEE754Number("1", "11111111111", "0000000000000000000000000000000000000000000000000000");
    }
    addToOutput("<p>"+res.toString()+"</p>");
    return res;
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Binary64", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  work1 = work1.concat(" * 2^" + exponent);
  work2 = work2.concat(" * 2^" + exponent);

  let normalize_exponent = normalizeBinary(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, BINARY64.MIN_EXPONENT, BINARY64.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Binary64", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }
  addToOutput("<p>" + work1 + " = " + work2 + " = " + significand.sign + "(" + significand.toUnsigned() + ")2 * 2^" + exponent + "</p>");
  significand = fractionToLength(significand, BINARY64.SIGNIFICAND_LENGTH-significand.whole.length, log);

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent = toLength(fromDecimal(trimSign(toUOARNumber((BINARY64.OFFSET+exponent).toString(), 10 , NumberTypes.SIGNED, log)), 2, true, log), BINARY64.EXPONENT_LENGTH, 0, log).toUnsigned();
  addToOutput("<p>eksp: " + exponent.toString() + " + " + BINARY64.OFFSET.toString() + " = " + (BINARY64.OFFSET+exponent) + " = (" + res_exponent + ")2 </p>");
  let res_significand = fractionToLength(significand, BINARY64.SIGNIFICAND_LENGTH, log).fraction;
  let res = new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.BINARY64);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

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
  if(significand.whole.length>DECIMAL32.SIGNIFICAND_LENGTH){
    let res;
    if(significand.sign==PLUS)
      res = new IEEE754Number("0", "11110000000", "00000000000000000000");
    else
      res = new IEEE754Number("1", "11110000000", "00000000000000000000");
    addToOutput("<p>"+res.toString()+"</p>");
    return res;
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  let work1 = significand.sign + "(" + significand.toUnsigned() + ")10 * 10^" + exponent;

  let normalize_exponent = normalizeDecimal(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, DECIMAL32.MIN_EXPONENT, DECIMAL32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }

  significand = wholeToLength(significand, DECIMAL32.DIGITS, log);
  if(significand===null){
    addToStackTrace("convertToIEEE754Decimal32DPD", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }
  addToOutput("<p>" + work1 + " = " + significand.sign + "(" + significand.toUnsigned() + ")10 * 10^" + exponent + "</p>");

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent;
  let na = addZeroesBefore(digitToBinary(significand.whole, 0), 10, NumberTypes.UNSIGNED, 4, log);
  let nb = wholeToLength(fromDecimal(trimSign(toUOARNumber((DECIMAL32.OFFSET+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 8, log).toUnsigned();
  addToOutput("<p>eksp: " + exponent.toString() + " + " + DECIMAL32.OFFSET.toString() + " = " + (DECIMAL32.OFFSET+exponent) + " = (" + nb + ")2 </p>");
  if(na.charAt(0)=='0'){
    addToOutput("<p>komb: " + nb.substr(0,2) + " " + na.substr(1,3) + " " + nb.substr(2,6) + "</p>");
    res_exponent = nb.substr(0,2)+na.substr(1,3)+nb.substr(2,6);
  }else{
    addToOutput("<p>komb: 11 " + nb.substr(0, 2) + na.charAt(3) + " " +nb.substr(2, 6) + "</p>");
    res_exponent = "11"+nb.substr(0, 2)+na.charAt(3)+nb.substr(2, 6);
  }
  let res_significand;
  addToOutput("<table>");
  addToOutput("<tbody>");
  addToOutput("<tr>");
  for(let i=1; i<=6; i++){
    addToOutput("<td>" + significand.whole.charAt(i) + "</td>");
  }
  addToOutput("</tr>");
  addToOutput("<tr>");
  for(let i=1; i<=6; i++){
    addToOutput("<td>" + addZeroesBefore(numberToBinary(significand.whole.charAt(i), log), 2, NumberTypes.UNSIGNED, 4, log) + "</td>");
  }
  addToOutput("</tr>");
  let nc1 = decimalToDPD(decimalTo8421(significand.whole.substr(1, 3)));
  let nc2 = decimalToDPD(decimalTo8421(significand.whole.substr(4, 3)));
  addToOutput("<tr><td colspan=\"3\">" + nc1 + "</td><td colspan=\"3\">" + nc2 + "</td></tr>");
  addToOutput("</tbody>");
  addToOutput("</table>");
  res_significand = nc1 + nc2;
  let res = new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.DECIMAL32DPD);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

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
  if(significand.whole.length>DECIMAL32.SIGNIFICAND_LENGTH){
    let res;
    if(significand.sign==PLUS)
      return new IEEE754Number("0", "11110000000", "00000000000000000000");
    else
      return new IEEE754Number("1", "11110000000", "00000000000000000000");
    addToOutput("<p>"+res.toString()+"</p>");
    return res;
  }
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  let work1 = significand.sign + "(" + significand.toUnsigned() + ")10 * 10^" + exponent;

  let normalize_exponent = normalizeDecimal(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, DECIMAL32.MIN_EXPONENT, DECIMAL32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Decimal32BID", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }
  addToOutput("<p>" + work1 + " = ");
  addToOutput(significand.sign+ "(" + significand.toUnsigned() + ")10 * 10^" + exponent + " = ");

  significand = wholeToLength(fromDecimal(significand, 2, true, log), 1+BINARY32.SIGNIFICAND_LENGTH, log);
  if(significand===null){
    addToStackTrace("convertToIEEE754Decimal32BID", "Significand out of bounds \"" + significand.toSigned() + "\"", log);
    return null;
  }
  addToOutput(significand.sign + "(" + significand.toUnsigned() + ")2 * 10^" + exponent + "</p>");

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent;
  let na = significand.whole.substr(0,4);
  let nb = wholeToLength(fromDecimal(trimSign(toUOARNumber((DECIMAL32.OFFSET+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), 8, log).toUnsigned();
  addToOutput("<p>eksp: " + exponent.toString() + " + " + DECIMAL32.OFFSET.toString() + " = " + (DECIMAL32.OFFSET+exponent) + " = (" + nb + ")2 </p>");
  if(na.charAt(0)=='0'){
    addToOutput("<p>komb: " + nb + " " + na.substr(1,3) + "</p>");
    res_exponent = nb+na.substr(1,3);
  }else{
    addToOutput("<p>komb: 11 " + nb + " " + na.charAt(3) + "</p>");
    res_exponent = "11"+nb+na.charAt(3);
  }
  let res_significand = significand.whole.substr(4);
  let res = new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.DECIMAL32BID);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

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
  if(significand.whole.length>HEXADECIMAL32.SIGNIFICAND_LENGTH){
    let res;
    if(significand.sign==PLUS)
      res = new IEEE754Number("0", "11111111", "00000000000000000000000");
    else
      res = new IEEE754Number("1", "11111111", "00000000000000000000000");
    addToOutput("<p>"+res.toString()+"</p>");
    return res;
  }
  let work1 = "";
  let work2 = "";
  work1 = work1.concat(significand.sign + "(" + significand.toUnsigned() + ")10");
  significand = fromDecimal(significand, 16, true, log);
  work2 = work2.concat(significand.sign + "(" + significand.toUnsigned() + ")16");
  exponent = baseToDecimalInteger(exponent, 10, NumberTypes.SIGNED, false, log);
  if(exponent===null){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Invalid number \"" + exponent + "\" for base 10", log);
    return null;
  }
  work1 = work1.concat(" * 16^" + exponent);
  work2 = work2.concat(" * 16^" + exponent);

  let normalize_exponent = normalizeHexadecimal(significand, true, log);
  exponent = exponent + normalize_exponent; 
  if(!isInBounds(exponent, HEXADECIMAL32.MIN_EXPONENT, HEXADECIMAL32.MAX_EXPONENT)){
    addToStackTrace("convertToIEEE754Hexadecimal32", "Exponent out of bounds \"" + exponent + "\"", log);
    return null;
  }
  addToOutput("<p>" + work1 + " = ");
  addToOutput(work2 + " = ");
  addToOutput(significand.sign + "(" + significand.toUnsigned() + ")16 * 16^" + exponent + "</p>");

  let res_sign = significand.sign==PLUS ? "0" : "1";
  let res_exponent = toLength(fromDecimal(trimSign(toUOARNumber((HEXADECIMAL32.OFFSET+exponent).toString(), 10, NumberTypes.SIGNED, log)), 2, true, log), HEXADECIMAL32.EXPONENT_LENGTH, 0, log).toUnsigned();
  addToOutput("<p>eksp: " + exponent.toString() + " + " + HEXADECIMAL32.OFFSET + " = " + (HEXADECIMAL32.OFFSET+exponent) + " = (" + res_exponent + ")2 </p>");
  let res_significand = decimalTo8421(significand.fraction);
  let res = new IEEE754Number(res_sign, res_exponent, res_significand, IEEE754Formats.HEXADECIMAL32);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

function convertFromIEEE754(format, log=true){
  let solution = document.getElementById('solution2');
  let error = document.getElementById('error2');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();
  addToOutput("<hr>");

  let ieee = document.getElementById('input_ieee754').value.toString();
  let res = null;
  switch(format){
    case IEEE754Formats.BINARY32:
      ieee = toIEEE754Number(ieee, IEEE754Formats.BINARY32, false);
      if(ieee!=null){
        res = convertFromIEEE754Binary32(ieee);
      }
      break;
    case IEEE754Formats.BINARY64:
      ieee = toIEEE754Number(ieee, IEEE754Formats.BINARY64, false);
      if(ieee!=null){
        res = convertFromIEEE754Binary64(ieee);
      }
      break;
    case IEEE754Formats.DECIMAL32DPD:
      ieee = toIEEE754Number(ieee, IEEE754Formats.DECIMAL32DPD, false);
      if(ieee!=null){
        res = convertFromIEEE754Decimal32DPD(ieee);
      }
      break;
    case IEEE754Formats.DECIMAL32BID:
      ieee = toIEEE754Number(ieee, IEEE754Formats.DECIMAL32BID, false);
      if(ieee!=null){
        res = convertFromIEEE754Decimal32BID(ieee);
      }
      break;
    case IEEE754Formats.HEXADECIMAL32:
      ieee = toIEEE754Number(ieee, IEEE754Formats.HEXADECIMAL32, false);
      if(ieee!=null){
        res = convertFromIEEE754Hexadecimal32(ieee);
      }
      break;
    default:
      addToStackTrace("convertFromIEEE754", "Invalid operation", log);
      res = null;
      break;
  }
  if(ieee==null){
    addToStackTrace("convertFromIEEE754", "Invalid Number", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function convertFromIEEE754Binary32(number, log=true){
  if(!isValidIEEE754(number, IEEE754Formats.BINARY32)){
    addToStackTrace("convertFromIEEE754Binary32", "Invalid IEEE754 Binary32 number \"" + number + "\"", log);
    return null;
  }

  let res = getSpecialValueBinary32(number);
  if(res!=null){
    addToOutput("<p>specijalna vrednost: " + res.toString() + "</p>");
    return res;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand;
  let exponent = baseToDecimalInteger(number.exponent, 2, NumberTypes.UNSIGNED, log);
  addToOutput("<p>eksp: (" + number.exponent + ")2 - " + BINARY32.OFFSET.toString() + " = " + exponent + " - " + BINARY32.OFFSET.toString() + " = ");
  exponent -= BINARY32.OFFSET;
  addToOutput(exponent + "</p>");

  if(exponent==-BINARY32.OFFSET){
    addToOutput("<p>subnormalan broj</p>");
    significand = trimNumber(new UOARNumber(sign, "0", number.significand, 2, NumberTypes.SIGNED));
    addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + (exponent+1) + "</p>");
    exponent += 1+normalizeBinary(significand, true, log);
  }else{
    significand = trimNumber(new UOARNumber(sign, "1", number.significand, 2, NumberTypes.SIGNED));
    addToOutput("<p>frakc: (" + significand.toSigned() + ")2</p>");
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
  addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + exponent + " = ");
  significand = toDecimal(significand, true, log);
  addToOutput("(" + significand.toSigned() + ")2 * 2^" + exponent + "</p>");
  return new SignificandExponentPair(significand, 2, exponent);
}

function convertFromIEEE754Binary64(number, log=true){
  if(!isValidIEEE754(number, IEEE754Formats.BINARY64)){
    addToStackTrace("convertFromIEEE754Binary64", "Invalid IEEE754 Binary64 number \"" + number + "\"", log);
    return null;
  }

  let res = getSpecialValueBinary64(number);
  if(res!=null){
    addToOutput("<p>specijalna vrednost: " + res.toString() + "</p>");
    return res;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand;
  let exponent = baseToDecimalInteger(number.exponent, 2, NumberTypes.UNSIGNED, log);
  addToOutput("<p>eksp: (" + number.exponent + ")2 - " + BINARY32.OFFSET.toString() + " = " + exponent + " - " + BINARY32.OFFSET.toString() + " = ");
  exponent -= BINARY64.OFFSET;
  addToOutput(exponent + "</p>");

  if(exponent==-BINARY64.OFFSET){
    addToOutput("<p>subnormalan broj</p>");
    significand = trimNumber(new UOARNumber(sign, "0", number.significand, 2, NumberTypes.SIGNED));
    addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + (exponent+1) + "</p>");
    exponent += 1+normalizeBinary(significand, true, log);
  }else{
    significand = trimNumber(new UOARNumber(sign, "1", number.significand, 2, NumberTypes.SIGNED));
    addToOutput("<p>frakc: (" + significand.toSigned() + ")2</p>");
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
  addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + exponent + " = ");
  significand = toDecimal(significand, true, log);
  addToOutput("(" + significand.toSigned() + ")2 * 2^" + exponent + "</p>");
  return new SignificandExponentPair(significand, 2, exponent);
}

function convertFromIEEE754Decimal32DPD(number, log=true){
  if(!isValidIEEE754(number, IEEE754Formats.DECIMAL32DPD)){
    addToStackTrace("convertFromIEEE754Decimal32DPD", "Invalid IEEE754 Decimal32 number \"" + number + "\"", log);
    return null;
  }

  let res = getSpecialValueDecimal32(number);
  if(res!=null){
    addToOutput("<p>specijalna vrednost: " + res.toString() + "</p>");
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
    addToOutput("<p>subnormalan broj</p>");
    exponent = -DECIMAL32.OFFSET - DECIMAL32.DIGITS;
    addToOutput("<p>eksp: " + exponent + "</p>");
  }else{
    addToOutput("<p>eksp: (" + comb + ")2 - " + DECIMAL32.OFFSET + " = " + exponent + " - " + DECIMAL32.OFFSET + " = ");
    exponent -= DECIMAL32.OFFSET;
    addToOutput(exponent + "</p>");
  }

  let dpd1 = DPDtoDecimal(number.significand.substr(0, DECIMAL32.TRIPLET_LENGTH), log);
  let dpd2 = DPDtoDecimal(number.significand.substr(DECIMAL32.TRIPLET_LENGTH, DECIMAL32.TRIPLET_LENGTH), log);
  addToOutput("<p>frakc: (" + significand + " " + dpd1 + " " + dpd2 + ")2 = ");
  significand = significand + dpd1 + dpd2;
  significand = trimNumber(new UOARNumber(sign, decimalFrom8421(significand, log), "", 10, NumberTypes.SIGNED));
  addToOutput("(" + significand.toUnsigned() + ")10 </p>");

  addToOutput("<p>(" + significand.toSigned() + ")10 * 10^" + exponent);
  let normalize_exponent = normalizeDecimal(significand, true, log);
  if(normalize_exponent>0){
    exponent += normalize_exponent;
    addToOutput(" = (" + significand.toSigned() + ")10 * 10^" + exponent);
  }
  addToOutput("</p>");

  return new SignificandExponentPair(significand, 10, exponent);
}

function convertFromIEEE754Decimal32BID(number, log=true){
  if(!isValidIEEE754(number, IEEE754Formats.DECIMAL32BID)){
    addToStackTrace("convertFromIEEE754Decimal32BID", "Invalid IEEE754 Decimal32 number \"" + number + "\"", log);
    return null;
  }

  let res = getSpecialValueDecimal32(number);
  if(res!=null){
    addToOutput("<p>specijalna vrednost: " + res.toString() + "</p>");
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
    addToOutput("<p>subnormalan broj</p>");
    exponent = -DECIMAL32.OFFSET - DECIMAL32.DIGITS;
    addToOutput("<p>eksp: " + exponent + "</p>");
  }else{
    addToOutput("<p>eksp: (" + comb + ")2 - " + DECIMAL32.OFFSET + " = " + exponent + " - " + DECIMAL32.OFFSET + " = ");
    exponent -= DECIMAL32.OFFSET;
    addToOutput(exponent + "</p>");
  }

  addToOutput("<p>frakc: (" + significand + " " + number.significand + ")2 = ");
  significand = significand + number.significand;
  significand = toDecimal(new UOARNumber(sign, significand, "", 2, NumberTypes.SIGNED), false, log);
  addToOutput("(" + significand.toUnsigned() + ")10 </p>");

  addToOutput("<p>(" + significand.toSigned() + ")10 * 10^" + exponent);
  let normalize_exponent = normalizeDecimal(significand, true, log);
  if(normalize_exponent>0){
    exponent += normalize_exponent;
    addToOutput(" = (" + significand.toSigned() + ")10 * 10^" + exponent);
  }
  addToOutput("</p>");

  return new SignificandExponentPair(significand, 10, exponent);
}

function convertFromIEEE754Hexadecimal32(number, log=true){
  if(!isValidIEEE754(number, IEEE754Formats.HEXADECIMAL32)){
    addToStackTrace("convertFromIEEE754Hexadecimal32", "Invalid IEEE754 Hexadecimal32 number \"" + number + "\"", log);
    return null;
  }

  let sign = number.sign=="0" ? PLUS : MINUS;
  let significand = trimNumber(new UOARNumber(sign, "0", decimalFrom8421(number.significand), 16, NumberTypes.SIGNED));
  let exponent = baseToDecimalInteger(number.exponent, 2, NumberTypes.UNSIGNED, log);
  addToOutput("<p>eksp: (" + number.exponent + ")2 - " + HEXADECIMAL32.OFFSET.toString() + " = " + exponent + " - " + HEXADECIMAL32.OFFSET + " = ");
  exponent -= HEXADECIMAL32.OFFSET;
  addToOutput(exponent + "</p>");

  addToOutput("<p>frakc: (0." + number.significand + ")2 = (" + significand.toUnsigned() + ")16 </p>");
  addToOutput("<p>(" + significand.toUnsigned() + ")16 * 16^" + exponent + " = ");

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
  addToOutput("(" + significand.toUnsigned() + ")16 * 16^" + exponent + " = ");
  significand = toDecimal(significand, false, log);
  addToOutput("(" + significand.toUnsigned() + ")10 * 16^" + exponent + "</p>");
  return new SignificandExponentPair(significand, 16, exponent);
}

function doOperation(operation, log=true){
  let solution = document.getElementById('solution3');
  let error = document.getElementById('error3');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();
  addToOutput("<hr>");

  let operand1 = document.getElementById("input_operand1").value;
  let operand2 = document.getElementById("input_operand2").value;
  if(operand1=="" || operand2==""){
    addToStackTrace("doOperation", "Empty Operand", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  operand1 = toIEEE754Number(operand1, IEEE754Formats.BINARY32, false);
  operand2 = toIEEE754Number(operand2, IEEE754Formats.BINARY32, false);
  if(operand1===null || operand2===null){
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  let res;
  switch(operation){
    case ArithmeticOperations.ADDITION:
      res = addIEEE754(operand1, operand2, log);
      break;
    case ArithmeticOperations.SUBTRACTION:
      res = subtractIEEE754(operand1, operand2, log);
      break;
    case ArithmeticOperations.MULTIPLICATION:
      res = multiplyIEEE754(operand1, operand2, log);
      break;
    case ArithmeticOperations.DIVISION:
      res = divideIEEE754(operand1, operand2, log);
      break;
    default:
      addToStackTrace("doOperation", "Invalid operation", log);
      res = null;
  }
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function addIEEE754(operand1, operand2, log=true){
  if(operand1==null || operand2==null || operand1.format!=IEEE754Formats.BINARY32 || operand2.format!=IEEE754Formats.BINARY32 || !isValidIEEE754(operand1) || !isValidIEEE754(operand2)){
    addToStackTrace("addIEEE754", "Invalid operands", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special2==QNAN){
      addToOutput("<p>x + "+QNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    } else if(special1==SNAN || special2==SNAN){
      addToOutput("<p>x + "+SNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==POS_INF && special2==NEG_INF){
      addToOutput("<p>"+POS_INF.toString()+" + "+NEG_INF.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==NEG_INF && special2==POS_INF){
      addToOutput("<p>"+NEG_INF.toString()+" + "+POS_INF.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==POS_INF && special2==POS_INF){
      addToOutput("<p>"+POS_INF.toString()+" + "+POS_INF.toString()+" = "+POS_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if(special1==NEG_INF && special2==NEG_INF){
      addToOutput("<p>"+NEG_INF.toString()+" + "+NEG_INF.toString()+" = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }else if((special1==POS_INF && special2!=NEG_INF) || (special2==POS_INF && special1!=NEG_INF)){
      addToOutput("<p>x + "+POS_INF.toString()+" = "+POS_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if((special1==NEG_INF && special2!=POS_INF) || (special2==NEG_INF && special1!=POS_INF)){
      addToOutput("<p>x + "+NEG_INF.toString()+" = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = Math.min(exponent1, exponent2);
  addToOutput("<p>eksp: " + exponent + " = " + BINARY32.OFFSET + " + " + (exponent-BINARY32.OFFSET) + "</p>");
  exponent1 -= exponent;
  exponent2 -= exponent;

  let significand1 = trimNumber(new UOARNumber(operand1.sign=="0"?PLUS:MINUS, (exponent==0?"0":"1")+operand1.significand.substr(0, exponent1), operand1.significand.substr(exponent1), 2, NumberTypes.SIGNED));
  let significand2 = trimNumber(new UOARNumber(operand2.sign=="0"?PLUS:MINUS, (exponent==0?"0":"1")+operand2.significand.substr(0, exponent2), operand2.significand.substr(exponent2), 2, NumberTypes.SIGNED));
  addToOutput("<p>frakc:");
  addToOutput("<table class=\"calculation\"><tr><td>"+significand1.sign+"</td><td class=\"align-right\">"+significand1.whole+".</td><td class=\"align-left\">"+significand1.fraction+"</td></tr>");
  addToOutput("<tr><td>"+significand2.sign+"</td><td class=\"align-right\">"+significand2.whole+".</td><td>"+significand2.fraction+"</td class=\"align-left\"></tr>");

  let significand = add(significand1, significand2, NumberTypes.SIGNED, true, false);
  addToOutput("<tr><td>"+significand.sign+"</td><td class=\"align-right\">"+significand.whole+".</td><td class=\"align-left\">"+significand.fraction+"</td></table></p>");
  
  addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  let normalize_exponent = normalizeBinary(significand, true, false);
  exponent += normalize_exponent;
  if(normalize_exponent!=0)
    addToOutput(" = (" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    if(significand.sign==PLUS){
      addToOutput(" = +Inf</p>");
      return POS_INF;
    }else{
      addToOutput(" = -Inf</p>");
      return NEG_INF;
    }
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
    addToOutput("</p>");
    addToOutput("<p>subnormalan broj: " + significand.toSigned());
  }
  addToOutput("</p>");

  addToOutput("<p>znak: " + (significand.sign==PLUS?"0":"1") + "</p>");

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  let res = new IEEE754Number(significand.sign==PLUS?"0":"1", exponent, significand.fraction, IEEE754Formats.BINARY32);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

function subtractIEEE754(operand1, operand2, log=true){
  if(operand1==null || operand2==null || operand1.format!=IEEE754Formats.BINARY32 || operand2.format!=IEEE754Formats.BINARY32 || !isValidIEEE754(operand1) || !isValidIEEE754(operand2)){
    addToStackTrace("subtractIEEE754", "Invalid operands", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special2==QNAN){
      addToOutput("<p>x - "+QNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    } else if(special1==SNAN || special2==SNAN){
      addToOutput("<p>x - "+SNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==POS_INF && special2==POS_INF){
      addToOutput("<p>"+POS_INF.toString()+" - "+POS_INF.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==NEG_INF && special2==NEG_INF){
      addToOutput("<p>"+NEG_INF.toString()+" - "+NEG_INF.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==POS_INF && special2==NEG_INF){
      addToOutput("<p>"+POS_INF.toString()+" - "+NEG_INF.toString()+" = "+POS_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if(special1==NEG_INF && special2==POS_INF){
      addToOutput("<p>"+NEG_INF.toString()+" - "+POS_INF.toString()+" = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }else if(special1==POS_INF && special2!=POS_INF){
      addToOutput("<p>"+POS_INF.toString()+" - x = "+POS_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if(special2==NEG_INF && special1!=NEG_INF){
      addToOutput("<p>x - "+NEG_INF.toString()+" = "+POS_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if(special1==NEG_INF && special2!=NEG_INF){
      addToOutput("<p>"+NEG_INF.toString()+" - x = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }else if(special2==POS_INF && special1!=POS_INF){
      addToOutput("<p>x - "+POS_INF.toString()+" = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = Math.min(exponent1, exponent2);
  addToOutput("<p>eksp: " + exponent + " = " + BINARY32.OFFSET + " + " + (exponent-BINARY32.OFFSET) + "</p>");
  exponent1 -= exponent;
  exponent2 -= exponent;

  let significand1 = trimNumber(new UOARNumber(operand1.sign=="0"?PLUS:MINUS, (exponent==0?"0":"1")+operand1.significand.substr(0, exponent1), operand1.significand.substr(exponent1), 2, NumberTypes.SIGNED));
  let significand2 = trimNumber(new UOARNumber(operand2.sign=="0"?PLUS:MINUS, (exponent==0?"0":"1")+operand2.significand.substr(0, exponent2), operand2.significand.substr(exponent2), 2, NumberTypes.SIGNED));
  significand2.sign = significand2.sign==PLUS ? MINUS : PLUS;
  addToOutput("<p>frakc:");
  addToOutput("<table class=\"calculation\"><tr><td>"+significand1.sign+"</td><td class=\"align-right\">"+significand1.whole+".</td><td class=\"align-left\">"+significand1.fraction+"</td></tr>");
  addToOutput("<tr><td>"+significand2.sign+"</td><td class=\"align-right\">"+significand2.whole+".</td><td>"+significand2.fraction+"</td class=\"align-left\"></tr>");

  let significand = add(significand1, significand2, NumberTypes.SIGNED, true, false);
  addToOutput("<tr><td>"+significand.sign+"</td><td class=\"align-right\">"+significand.whole+".</td><td class=\"align-left\">"+significand.fraction+"</td></table></p>");
  
  addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  let normalize_exponent = normalizeBinary(significand, true, false);
  exponent += normalize_exponent;
  if(normalize_exponent!=0)
    addToOutput(" = (" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    if(significand.sign==PLUS){
      addToOutput(" = +Inf</p>");
      return POS_INF;
    }else{
      addToOutput(" = -Inf</p>");
      return NEG_INF;
    }
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
    addToOutput("</p>");
    addToOutput("<p>subnormalan broj: " + significand.toSigned());
  }
  addToOutput("</p>");

  addToOutput("<p>znak: " + (significand.sign==PLUS?"0":"1") + "</p>");

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  let res = new IEEE754Number(significand.sign==PLUS?"0":"1", exponent, significand.fraction, IEEE754Formats.BINARY32);
  addToOutput(res.toString());
  return res;
}

function multiplyIEEE754(operand1, operand2, log=true){
  if(operand1==null || operand2==null || operand1.format!=IEEE754Formats.BINARY32 || operand2.format!=IEEE754Formats.BINARY32 || !isValidIEEE754(operand1) || !isValidIEEE754(operand2)){
    addToStackTrace("multiplyIEEE754", "Invalid operands", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special2==QNAN){
      addToOutput("<p>x * "+QNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    } else if(special1==SNAN || special2==SNAN){
      addToOutput("<p>x * "+SNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(((special1==POS_ZERO || special1==NEG_ZERO) && (special2==POS_INF || special2==NEG_INF)) ||
            ((special1==POS_ZERO || special1==NEG_ZERO) && (special2==POS_INF || special2==NEG_INF))){
      addToOutput("<p>"+POS_ZERO.toString()+" * "+POS_INF.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special1==POS_ZERO || special2==POS_ZERO || special1==NEG_ZERO || special2==NEG_ZERO){
      addToOutput("<p>x * "+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+" = "+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+"</p>");
      return operand1.sign==operand2.sign? BINARY32_SPECIAL_VALUES.POS_ZERO : BINARY32_SPECIAL_VALUES.NEG_ZERO;
    }else if((special1==POS_INF && special2==NEG_INF) || (special1==NEG_INF && special2==POS_INF)){
      addToOutput("<p>"+POS_INF.toString()+" * "+NEG_INF.toString()+" = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }else if(special1==POS_INF || special2==POS_INF){
      addToOutput("<p>x * "+POS_INF.toString()+" = "+POS_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.POS_INF;
    }else if(special1==NEG_INF || special2==NEG_INF){
      addToOutput("<p>x * "+NEG_INF.toString()+" = "+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let sign = operand1.sign==operand2.sign ? "0" : "1";
  addToOutput("<p>znak: " + sign + "</p>");

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = exponent1 + exponent2 - BINARY32.OFFSET;
  addToOutput("<p>eksp: " + exponent + " = " + BINARY32.OFFSET + " + " + (exponent-BINARY32.OFFSET) + "</p>");

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
  addToOutput("<p>frakc: " + significand1.toUnsigned() + " * " + significand2.toUnsigned() + " = " + significand.toUnsigned() + "</p>");

  addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  let normalize_exponent = normalizeBinary(significand, true, false);
  exponent += normalize_exponent;
  if(normalize_exponent!=0)
    addToOutput(" = (" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    if(significand.sign==PLUS){
      addToOutput(" = +Inf</p>");
      return POS_INF;
    }else{
      addToOutput(" = -Inf</p>");
      return NEG_INF;
    }
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
    addToOutput("</p>");
    addToOutput("<p>subnormalan broj: " + significand.toSigned());
  }
  addToOutput("</p>");

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  let res = new IEEE754Number(sign, exponent, significand.fraction, IEEE754Formats.BINARY32);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

function divideIEEE754(operand1, operand2, log=true){
  if(operand1==null || operand2==null || operand1.format!=IEEE754Formats.BINARY32 || operand2.format!=IEEE754Formats.BINARY32 || !isValidIEEE754(operand1) || !isValidIEEE754(operand2)){
    addToStackTrace("divideIEEE754", "Invalid operands", log);
    return null;
  }

  let special1 = getSpecialValueBinary32(operand1);
  let special2 = getSpecialValueBinary32(operand2);
  if(special1!=null || special2!=null){
    if(special1==QNAN || special2==QNAN){
      addToOutput("<p>x / "+QNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    } else if(special1==SNAN || special2==SNAN){
      addToOutput("<p>x / "+SNAN.toString()+" = "+QNAN.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if((special1==POS_ZERO || special1==NEG_ZERO) && (special2==POS_ZERO || special2==NEG_ZERO)){
      addToOutput("<p>"+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+" / "+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+" = "+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if((special1==POS_INF || special1==NEG_INF) && (special2==POS_INF || special2==NEG_INF)){
      addToOutput("<p>"+POS_INF.toString()+"/"+NEG_INF.toString()+" / "+POS_INF.toString()+"/"+NEG_INF.toString()+" = "+POS_INF.toString()+"/"+NEG_INF.toString()+"</p>");
      return BINARY32_SPECIAL_VALUES.QNAN;
    }else if(special2==POS_INF || special2==NEG_INF){
      addToOutput("<p>x / "+POS_INF.toString()+"/"+NEG_INF.toString()+" = "+POS_INF.toString()+"/"+NEG_INF.toString()+"</p>");
      return operand1.sign==operand2.sign? BINARY32_SPECIAL_VALUES.POS_ZERO : BINARY32_SPECIAL_VALUES.NEG_ZERO;
    }else if(special2==POS_ZERO || special2==NEG_ZERO){
      addToOutput("<p>x / "+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+" = "+POS_ZERO.toString()+"/"+NEG_ZERO.toString()+"</p>");
      return operand1.sign==operand2.sign? BINARY32_SPECIAL_VALUES.POS_INF : BINARY32_SPECIAL_VALUES.NEG_INF;
    }
  }

  let sign = operand1.sign==operand2.sign ? "0" : "1";
  addToOutput("<p>znak: " + sign + "</p>");

  let exponent1 = baseToDecimalInteger(operand1.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent2 = baseToDecimalInteger(operand2.exponent, 2, NumberTypes.UNSIGNED, false);
  let exponent = exponent1 - exponent2 + BINARY32.OFFSET;
  addToOutput("<p>eksp: " + exponent + " = " + BINARY32.OFFSET + " + " + (exponent-BINARY32.OFFSET) + "</p>");

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
  while(significand.whole.length+significand.fraction.length <= BINARY32.SIGNIFICAND_LENGTH+1 && dividend.whole!="0"){
    if(isGreater(dividend, divider, true, false) || dividend.whole==divider.whole){
      dividend = add(dividend, neg_divider, NumberTypes.SIGNED, false);
      significand.fraction = significand.fraction.concat("1");
    }else{
      significand.fraction = significand.fraction.concat("0");
    }
    dividend.whole = dividend.whole + "0";
  }
  trimNumber(significand);
  addToOutput("<p>frakc: " + significand1.toUnsigned() + " / " + significand2.toUnsigned() + " = " + significand.toUnsigned() + "</p>");

  addToOutput("<p>(" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  let normalize_exponent = normalizeBinary(significand, true, false);
  exponent += normalize_exponent;
  if(normalize_exponent!=0)
    addToOutput(" = (" + significand.toSigned() + ")2 * 2^" + (exponent-BINARY32.OFFSET));
  if(exponent > BINARY32.MAX_EXPONENT+BINARY32.OFFSET){
    if(significand.sign==PLUS){
      addToOutput(" = +Inf</p>");
      return POS_INF;
    }else{
      addToOutput(" = -Inf</p>");
      return NEG_INF;
    }
  } else if(exponent <= 0){
    significand.fraction = createZeroString(-exponent-1) + significand.whole + significand.fraction;
    significand.whole = "0";
    addToOutput("</p>");
    addToOutput("<p>subnormalan broj: " + significand.toSigned());
  }
  addToOutput("</p>");

  significand = fractionToLength(significand, BINARY32.SIGNIFICAND_LENGTH, false);
  exponent = toLength(fromDecimal(trimSign(toUOARNumber(exponent.toString(), 10 , NumberTypes.UNSIGNED, log)), 2, true, log), BINARY32.EXPONENT_LENGTH, 0, log).toUnsigned();

  let res = new IEEE754Number(sign, exponent, significand.fraction, IEEE754Formats.BINARY32);
  addToOutput("<p>"+res.toString()+"</p>");
  return res;
}

window.convertToIEEE754 = convertToIEEE754;
window.convertFromIEEE754 = convertFromIEEE754;
window.doOperation = doOperation;
window.IEEE754Formats = IEEE754Formats;
window.ArithmeticOperations = ArithmeticOperations;