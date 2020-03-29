import { 
  UOARNumber, NumberTypes, PRECISION, PRECISION_NUMBER, isValidNumber, getValueAt, toValue,
  toUOARNumber, fractionToLength, trimNumber, standardizeUOARNumber
} from '../uoar_core.mjs';
import { baseToDecimalInteger } from '../base_converter.mjs';
import { convertToSMR, convertToOC, convertToTC } from '../type_converter.mjs';
import { isValidBase } from '../util.mjs';
import { addToStackTrace, addToOutput } from '../output.mjs';

import '../common.scss';

/**
 * Converts a number from bases base_from to base_to
 * @param {string} val Value to convert
 * @param {number} base_from Base to convert from
 * @param {number} base_to Base to convert to
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted from base_from to base_to
 */
export function convertToBase(val, base_from, base_to, log=true){
  if(val=="" || base_from=="" || base_to==""){
    addToStackTrace("convertBase", "Empty input", log);
    return null;
  }
  if(!isValidBase(base_from)){
    addToStackTrace("convertBase", "Invalid base \"" + base1 + "\"", log);
    return null;
  }
  if(!isValidBase(base_to)){
    addToStackTrace("convertBase", "Invalid base \"" + base2 + "\"", log);
    return null;
  }

  let number = toUOARNumber(val, base_from, NumberTypes.SIGNED, log);
  if(number===null){
    addToStackTrace("convertBase", "Invalid number \"" + val + "\" for base " + base_from, log);
    return null;
  }

  if(number.base==base_to){
    return number;
  }
  let res = fromDecimal(toDecimal(number, log), base_to, log);
  if(res===null){
    addToStackTrace("convertBase", "Conversion error", log);
  }
  return res;
}

/**
 * Converts given nimber to base 10
 * @param {UOARNumber} number Standardized signed number to convert
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to base 10
 */
function toDecimal(number, log=true){
  number = number.copy();
  if(number.base==10){
    return number;
  }

  let work1 = "";
  let work2 = "";

  let whole = 0;
  let num_length = number.whole.length-1;
  let temp;
  for(let i = 0; i<number.whole.length; i++){
    temp = getValueAt(number.whole, i, log);
    work1 = work1.concat(temp + "*" + number.base + "^" + num_length);
    work2 = work2.concat(temp * Math.pow(number.base, num_length));
    whole = whole * number.base + temp;

    num_length--;
    if(num_length>=0){
      work1 = work1.concat(" + ");
      work2 = work2.concat(" + ");
    }
  }
  whole = whole.toString();

  let fraction = 0;
  let precision = PRECISION_NUMBER / number.base;
  let base_deg = number.base;
  for(let i = 0; i<number.fraction.length; i++){
    temp = getValueAt(number.fraction, i, log);
    work1 = work1.concat(" + " + temp + "*" + number.base + "^(-" + (i+1) + ")");
    work2 = work2.concat(" + " + temp + "/" + base_deg);
    fraction += Math.floor(temp * precision);
    precision = precision / number.base;
    base_deg = base_deg * number.base;
  }
  fraction = fraction.toString();
  
  let res = new UOARNumber(number.sign, whole, fraction, 10, number.number_type);
  res = trimNumber(res);
  addToOutput("<p>");
  addToOutput("(" + number.toSigned() + ")" + number.base + " = ");
  addToOutput(work1 + " = ");
  addToOutput(work2 + " = ");
  addToOutput("(" + res.toSigned() + ")10");
  addToOutput("</p>");
  addToOutput("<hr>");

  return res;
}

/**
 * Converts given number from base 10 to the given base
 * @param {UOARNumber} number Standardized signed number to convert
 * @param {number} base Base to convert to
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Number converted to specified base
 */
function fromDecimal(number, base, log=true){
  number = number.copy();
  if(base==10){
    return number;
  }
  
  let work1 = "";
  let work2 = "";

  let whole = "";
  let whole_dec = baseToDecimalInteger(number.whole, number.base, NumberTypes.UNSIGNED, log);
  if(whole_dec==0){
    whole = "0";
  }else{
    work1 = "<td>" + whole_dec + "</td>";
    work2 = "";
    do {
      work1 = work1.concat("<td>" + Math.floor(whole_dec/base) + "</td>");
      work2 = work2.concat("<td>" + (whole_dec%base) + "</td>");
      whole = toValue(whole_dec%base, false).concat(whole);
      whole_dec = Math.floor(whole_dec/base);
    } while(whole_dec>0)
    work2 = work2.concat("<td></td>");
    addToOutput("<table>");
    addToOutput("<tr>");
    addToOutput(work1);
    addToOutput("</tr>");
    addToOutput("<tr>");
    addToOutput(work2);
    addToOutput("</tr>");
    addToOutput("</table>");
  }
  
  let fraction = "";
  if(number.fraction!="0"){
    number = fractionToLength(number, PRECISION, log);
    let fraction_dec = baseToDecimalInteger(number.fraction, number.base, NumberTypes.UNSIGNED, log);
    let limit = 0;
    let temp = 0;
    work1 = "<td>" + trimNumber(new UOARNumber(number.sign, "0", fraction_dec.toString(), number.base, number.number_type)).toUnsigned() + "</td>";
    work2 = "<td>" + temp + "</td>";
    while(fraction_dec>0 && limit<PRECISION){
      fraction_dec = fraction_dec*base;
      temp = Math.floor(fraction_dec/PRECISION_NUMBER);
      fraction_dec -= temp*PRECISION_NUMBER;
      work1 = work1.concat("<td>" + trimNumber(new UOARNumber(number.sign, "0", fraction_dec.toString(), number.base, number.number_type)).toUnsigned() + "</td>");
      work2 = work2.concat("<td>" + toValue(temp, false) + "</td>");
      fraction = fraction.concat(toValue(temp, false));
      limit++;
    }
    addToOutput("<table>");
    addToOutput("<tr>");
    addToOutput(work1);
    addToOutput("</tr>");
    addToOutput("<tr>");
    addToOutput(work2);
    addToOutput("</tr>");
    addToOutput("</table>");
  }

  let res = new UOARNumber(number.sign, whole, fraction, base, number.number_type);
  addToOutput("<p>"+res.toSigned()+"</p>");
  return res;
}

/**
 * Converts given number to all number types
 * @param {string} val Value to convert 
 * @param {number} base Base of the value
 * @param {boolean} [log=true] Should log
 * @returns {object} Object containing the value represented as different types
 */
export function convertToType(val, base, log=true){
  if(val=="" || base==""){
    addToStackTrace("convertToType", "Empty input", log);
    return null;
  }
    
  let number = toUOARNumber(val, base, NumberTypes.SIGNED, false);
  if(number===null){
    addToStackTrace("convertToType", "Invalid number \"" + val + "\" for base " + base_from, log);
    return null;
  }

  let number_smr = convertToSMR(number, false, true);
  let number_oc = convertToOC(number, false, true);
  let number_tc = convertToTC(number, false, true);
  if(number===null || number_smr===null || number_oc===null || number_tc===null){
    addToStackTrace("convertToType", "Conversion error", log);
    return null;
  }

  addToOutput("<table id=\"representations\">");
  addToOutput("<tr><th colspan=\"2\">");
  addToOutput("(" + number.toSigned() + ")" + number.base + "</th></tr>");
  addToOutput("<tr><td>ZAV:</td>");
  addToOutput("<td>(" + number_smr.toSigned() + ")" + number.base + "</td></tr>");
  addToOutput("<tr><td>NK:</td>");
  addToOutput("<td>(" + number_oc.toSigned() + ")" + number.base + "</td></tr>");
  addToOutput("<tr><td>PK:</td>");
  addToOutput("<td>(" + number_tc.toSigned() + ")" + number.base + "</td></tr>");
  addToOutput("</table>");

  return { signed: number, smr: number_smr, oc: number_oc, tc: number_tc };
}