import { 
  UOARNumber, NumberTypes, PLUS, MINUS, trimSign, toUOARNumber,
  equalizeLength, getSignMultiplierForNumber, wholeToLength, toLength
} from '../uoar_core.mjs';
import { ShiftTypes, add, complement, shift } from '../uoar_arithmetic.mjs';
import { fromDecimal, toDecimal } from '../base_converter.mjs';
import { convertToType, convertToSigned } from '../type_converter.mjs';
import { createZeroString } from '../util.mjs';
import { addToStackTrace, addToOutput } from '../output.mjs';

/**
 * Multiplies two unsigned binary numbers
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Product of operands
 */
export function multiplyUnsigned(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("multiplyUnsigned", "Empty input", log);
    return null;
  }
  operand1 = fromDecimal(toUOARNumber(operand1, 10, NumberTypes.SIGNED, false), 2, false, log);
  operand2 = fromDecimal(toUOARNumber(operand2, 10, NumberTypes.SIGNED, false), 2, false, log);
  if(operand1===null || operand2===null){
    addToStackTrace("multiplyUnsigned", "Invalid operand", log);
    return null;
  }
  if(getSignMultiplierForNumber(operand1)!=1 || getSignMultiplierForNumber(operand2)!=1){
    addToStackTrace("multiplyUnsigned", "Operands must be positive", log);
    return null;
  }

  operand1 = convertToType(trimSign(operand1), NumberTypes.TC, true, log);
  operand2 = convertToType(trimSign(operand2), NumberTypes.TC, true, log);
  equalizeLength(operand1, operand2, true, log);
  let len = operand1.sign.length + operand1.whole.length + operand1.fraction.length;

  let c = new UOARNumber("0", "", "", 2, NumberTypes.TC);
  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, operand1.fraction.length);
  let m = operand1;
  let p = operand2;
  let registers = [c, a, p];

  addToOutput("<p>");
  addToOutput("M: (" + m.toSigned() + ")2<br>");
  addToOutput("P: (" + p.toSigned() + ")2");
  addToOutput("</p>");

  addToOutput("<table style=\"border: none;\">");
  addToOutput("<thead><tr><th>C</th><th>A</th><th>P</th><th>Komentar</th></tr></thead>");
  addToOutput("<tbody>");
  addToOutput("<tr><td>" + registers[0].toWhole() + "</td><td class=\"align-right\">" + registers[1].toWhole() + "</td><td>" + registers[2].toWhole() + "</td><td>Init</td></tr>");
  let work1 = "";
  let work2 = "";
  let op = "";
  for(let im=0; im<len; im++){
    addToOutput("<tr>");
    
    op = registers[2].toWhole().charAt(registers[2].toWhole().length-1);
    work1 = "";
    work2 = "p0=" + op + " -> ";
    if(op=="0"){
      work2 = work2.concat("NOOP");
    }else if(op=="1"){
      registers[1] = add(registers[1], m, true, log);
      work1 = "+" + m.toWhole() + "<br>" + registers[1].toWhole() + "<br>";
      if(registers[1].whole.length>m.whole.length){
        registers[0].sign = registers[1].whole.charAt(0);
        registers[1].whole = registers[1].whole.substr(1);
      }
      work2 = work2.concat("A = A + M");
    }
    
    if(!shift(registers, 1, ShiftTypes.RIGHT_L, false)){
      addToStackTrace("multiplyUnsigned", "Unable to shift registers", log);
      return null;
    }
    work1 = work1.concat(registers[1].toWhole());

    addToOutput("<td>" + registers[0].toWhole() + "</td>");
    addToOutput("<td class=\"align-right\">" + work1 + "</td>");
    addToOutput("<td>" + registers[2].toWhole() + "</td>");
    addToOutput("<td>" + work2 + "</td>");
    addToOutput("</tr>");
  }
  addToOutput("</tbody>");
  addToOutput("</table>");

  addToOutput("<p>");
  addToOutput("AP = (" + registers[1].toWhole() + " " + registers[2].toWhole() + ")2<br>");
  let AP = registers[1].toWhole() + registers[2].toWhole();
  let AP_frac_len = 2 * operand1.fraction.length;
  AP = AP.substr(0, AP.length-AP_frac_len) + "." + AP.substr(AP.length-AP_frac_len);
  let res = toUOARNumber(AP, 2, NumberTypes.TC, false);
  addToOutput("Rezultat: (" + res.toSigned() + ")2");
  addToOutput("</p>");
  return res;
}

/**
 * Multiplies two signed binary numbers using Booth algorithm
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Product of operands
 */
export function multiplyBooth(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("multiplyBooth", "Empty input", log);
    return null;
  }
  operand1 = fromDecimal(toUOARNumber(operand1, 10, NumberTypes.SIGNED, false), 2, false, log);
  operand2 = fromDecimal(toUOARNumber(operand2, 10, NumberTypes.SIGNED, false), 2, false, log);
  if(operand1===null || operand2===null){
    addToStackTrace("multiplyBooth", "Invalid operand", log);
    return null;
  }

  operand1 = convertToType(trimSign(operand1), NumberTypes.TC, true, log);
  operand2 = convertToType(trimSign(operand2), NumberTypes.TC, true, log);
  equalizeLength(operand1, operand2, true, log);
  let len = operand1.sign.length + operand1.whole.length + operand1.fraction.length;

  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, operand1.fraction.length);
  let m = operand1;
  let neg_m = complement(operand1, true, log);
  let p = operand2;
  let p1 = new UOARNumber("0", "", "", 2, NumberTypes.TC);
  let registers = [a, p, p1];

  addToOutput("<p>");
  addToOutput("M: (" + m.toSigned() + ")2<br>");
  addToOutput("-M: (" + neg_m.toSigned() + ")2<br>");
  addToOutput("P: (" + p.toSigned() + ")2");
  addToOutput("</p>");

  addToOutput("<table style=\"border: none;\">");
  addToOutput("<thead><tr><th>A</th><th>P</th><th>P0</th><th>Komentar</th></tr></thead>");
  addToOutput("<tbody>");
  addToOutput("<tr><td class=\"align-right\">" + registers[0].toWhole() + "</td><td>" + registers[1].toWhole() + "</td><td>" + registers[2].toWhole() + "</td><td>Init</td></tr>");
  let work1 = "";
  let work2 = "";
  let op = "";
  for(let im=0; im<len; im++){
    addToOutput("<tr>");
    
    op = registers[1].toWhole().charAt(registers[1].toWhole().length-1) + registers[2].toWhole();
    work1 = "";
    work2 = op + " -> ";
    if(op=="00" || op=="11"){
      work2 = work2.concat("NOOP");
    }else if(op=="10"){
      registers[0] = add(registers[0], neg_m, true, log);
      work1 = "+" + neg_m.toWhole() + "<br>" + registers[0].toWhole() + "<br>";
      work2 = work2.concat("A = A - M");
    }else if(op=="01"){
      registers[0] = add(registers[0], m, true, log);
      work1 = "+" + m.toWhole() + "<br>" + registers[0].toWhole() + "<br>";
      work2 = work2.concat("A = A + M"); 
    }
    
    if(!shift(registers, 1, ShiftTypes.RIGHT_A, false)){
      addToStackTrace("multiplyBooth", "Unable to shift registers", log);
      return null;
    }
    work1 = work1.concat(registers[0].toWhole());

    addToOutput("<td class=\"align-right\">" + work1 + "</td>");
    addToOutput("<td>" + registers[1].toWhole() + "</td>");
    addToOutput("<td>" + registers[2].toWhole() + "</td>");
    addToOutput("<td>" + work2 + "</td>");
    addToOutput("</tr>");
  }
  addToOutput("</tbody>");
  addToOutput("</table>");

  addToOutput("<p>");
  addToOutput("AP = (" + registers[0].toWhole() + " " + registers[1].toWhole() + ")2<br>");
  let AP = registers[0].toWhole() + registers[1].toWhole();
  let AP_frac_len = 2 * operand1.fraction.length;
  AP = AP.substr(0, AP.length-AP_frac_len) + "." + AP.substr(AP.length-AP_frac_len);
  let res = toUOARNumber(AP, 2, NumberTypes.TC, false);
  addToOutput("Rezultat: (" + res.toSigned() + ")2");
  addToOutput("</p>");
  return res;
}

/**
 * Multiplies two signed binary numbers using modified Booth algorithm
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Product of operands
 */
export function multiplyModifiedBooth(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("multiplyModifiedBooth", "Empty input", log);
    return null;
  }
  operand1 = fromDecimal(toUOARNumber(operand1, 10, NumberTypes.SIGNED, false), 2, false, log);
  operand2 = fromDecimal(toUOARNumber(operand2, 10, NumberTypes.SIGNED, false), 2, false, log);
  if(operand1===null || operand2===null){
    addToStackTrace("multiplyModifiedBooth", "Invalid operand", log);
    return null;
  }

  operand1 = convertToType(trimSign(operand1), NumberTypes.TC, true, log);
  operand2 = convertToType(trimSign(operand2), NumberTypes.TC, true, log);
  if(operand2.whole.length%2==1){
    wholeToLength(operand2, operand2.whole.length+1);
  }
  if(operand1.sign!=operand1.whole[0]){
    wholeToLength(operand1, operand1.whole.length+1);
  }
  wholeToLength(operand1, 2*Math.max(operand1.whole.length, operand2.whole.length)-1);

  let work1 = "";
  let work2 = "";

  let mults = [];
  let last_char = "0";
  for(let i=operand2.whole.length-1; i>=0; i--){
    work1 = "<td>" + operand2.whole.charAt(i) + "</td>" + work1;
    if(operand2.whole.charAt(i)==last_char){
      work2 = "<td>0</td>" + work2;
      mults.unshift(0);
    }else{
      if(operand2.whole.charAt(i)=="1"){
        work2 = "<td>-1</td>" + work2;
        mults.unshift(-1);
      }else{
        work2 = "<td>+1</td>" + work2;
        mults.unshift(1);
      }
    }
    last_char = operand2.whole.charAt(i);
  }
  addToOutput("<p>Kodirani mnozilac:<table style=\"border: none;\"><tbody><tr>"+work1+"</tr><tr>"+work2+"</tr></tbody></table></p>");

  let coded_mults = [];
  for(let i = 0; i<mults.length; i+=2){
    coded_mults.unshift(2*mults[i]+mults[i+1]);
  }

  let res = new UOARNumber("0", "0", "0", 2, NumberTypes.TC);
  let registers = [operand1];

  addToOutput("<table style=\"border: none;\"");
  addToOutput("<thead><tr><th>k</th><th>v(k)</th><th>M<<2k</th><th>(M<<2k)v(k)</th></tr></thead>");
  addToOutput("<tbody>");
  for(let i = 0; i<coded_mults.length; i++){
    let temp = 1;
    let multiplier = registers[0].copy();
    if(coded_mults[i]<0){
      multiplier = complement(multiplier, true, log);
      temp = temp*-1;
    }
    if(coded_mults[i]==0){
      work1 = createZeroString(operand1.whole.length);
    }else if(coded_mults[i]==temp){
      work1 = multiplier.toWhole();
      res = add(res, multiplier, false, log);
    }else if(coded_mults[i]==2*temp){
      multiplier.whole = multiplier.whole.substr(1) + "0";
      work1 = multiplier.toWhole();
      res = add(res, multiplier, false, log);
    }

    addToOutput("<tr>");
    addToOutput("<td>" + i + "</td>");
    addToOutput("<td>" + coded_mults[i] + "</td>");
    addToOutput("<td>" + registers[0].toWhole() + "</td>");
    addToOutput("<td>" + work1 + "</td>");
    addToOutput("</tr>");

    if(!shift(registers, 2, ShiftTypes.LEFT, false)){
      addToStackTrace("multiplyModifiedBooth", "Unable to shift registers", log);
      return null;
    }
  }
  addToOutput("</tbody>");
  addToOutput("</table>");

  addToOutput("<p>Rezultat: (" + res.toSigned() + ")2</p>");
  return res;
}

/**
 * Divides two unsigned binary numbers
 * @param {string} operand1 First operand
 * @param {string} operand2 Second operand
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Division quotient of operands
 */
export function divideUnsigned(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("divideUnsigned", "Empty input", log);
    return null;
  }
  operand1 = fromDecimal(toUOARNumber(operand1, 10, NumberTypes.SIGNED, false), 2, false, log);
  operand2 = fromDecimal(toUOARNumber(operand2, 10, NumberTypes.SIGNED, false), 2, false, log);
  if(operand1===null || operand2===null){
    addToStackTrace("divideUnsigned", "Invalid operand", log);
    return null;
  }
  if(getSignMultiplierForNumber(operand1)!=1 || getSignMultiplierForNumber(operand2)!=1){
    addToStackTrace("divideUnsigned", "Operands must be positive", log);
    return null;
  }

  operand1 = convertToType(trimSign(operand1), NumberTypes.TC, true, log);
  operand2 = convertToType(trimSign(operand2), NumberTypes.TC, true, log);
  equalizeLength(operand1, operand2, true, log);
  let len = operand1.sign.length + operand1.whole.length;

  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, operand1.fraction.length);
  let p = operand1;
  let m = operand2;
  let neg_m = complement(operand2, true, log);
  let registers = [a, p];

  addToOutput("<p>");
  addToOutput("P: (" + p.toSigned() + ")2<br>");
  addToOutput("M: (" + m.toSigned() + ")2");
  addToOutput("</p>");

  addToOutput("<table style=\"border: none;\">");
  addToOutput("<thead><tr><th>A</th><th>P</th><th>Komentar</th></tr></thead>");
  addToOutput("<tbody>");
  addToOutput("<tr><td class=\"align-right\">" + registers[0].toWhole() + "</td><td>" + registers[1].toWhole() + "</td><td>Init</td></tr>");
  let work1 = "";
  let work2 = "";
  for(let im=0; im<len; im++){
    addToOutput("<tr>");
    
    if(!shift(registers, 1, ShiftTypes.LEFT, false)){
      addToStackTrace("divideUnsigned", "Unable to shift registers", log);
      return null;
    }

    registers[0] = wholeToLength(add(registers[0], neg_m, true, log), registers[0].whole.length, false);
    work1 = registers[0].toWhole() + "<br>" + "-" + m.toWhole() + "<br>" + registers[0].toWhole();
    work2 = "A = A - M<br>";

    if(registers[0].sign=="1"){
      registers[0] = wholeToLength(add(registers[0], m, true, log), registers[0].whole.length, false);
      work1 = work1 + "<br>" + registers[0].toWhole();
      work2 = work2 + " A<0 Restauracija";
    }else{
      registers[1].whole = registers[1].whole.substr(0, registers[1].whole.length-1) + "1";
      work2 = work2 + " A>0";
    }

    addToOutput("<td class=\"align-right\">" + work1 + "</td>");
    addToOutput("<td>" + registers[1].toWhole() + "</td>");
    addToOutput("<td>" + "AP <-<br>" + work2 + "</td>");
    addToOutput("</tr>");
  }
  addToOutput("</tbody>");
  addToOutput("</table>");

  addToOutput("<p>");
  let quotient = toDecimal(registers[1], false, false);
  addToOutput("Kolicnik: P = (" + registers[1].toWhole() + ")2 = " + quotient.toUnsigned() + "<br>");
  let rest = toDecimal(registers[0], false ,false);
  addToOutput("Ostatak: A = (" + registers[0].toWhole() + ")2 = " + rest.toUnsigned() + "<br>");
  addToOutput("</p>");
  
  return quotient;
}

/**
 * Divides two signed binary numbers
 * @param {UOARNumber} operand1 First operand
 * @param {UOARNumber} operand2 Second operand
 * @param {boolean} [standardized=false] Treat as standardized
 * @param {boolean} [log=true] Should log
 * @returns {UOARNumber} Division quotient of operands
 */
export function divideSigned(operand1, operand2, log=true){
  if(operand1=="" || operand2==""){
    addToStackTrace("divideSigned", "Empty input", log);
    return null;
  }
  operand1 = fromDecimal(toUOARNumber(operand1, 10, NumberTypes.SIGNED, false), 2, false, log);
  operand2 = fromDecimal(toUOARNumber(operand2, 10, NumberTypes.SIGNED, false), 2, false, log);
  if(operand1===null || operand2===null){
    addToStackTrace("divideSigned", "Invalid operand", log);
    return null;
  }

  operand1 = convertToType(trimSign(operand1), NumberTypes.TC, true, log);
  operand2 = convertToType(trimSign(operand2), NumberTypes.TC, true, log);
  equalizeLength(operand1, operand2, true, log);
  let len = operand1.sign.length + operand1.whole.length;

  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, operand1.fraction.length);
  let p = operand1;
  let m = operand2;
  let neg_m = complement(operand2, true, log);
  let registers = [a, p];

  addToOutput("<p>");
  addToOutput("P: (" + p.toSigned() + ")2<br>");
  addToOutput("M: (" + m.toSigned() + ")2");
  addToOutput("</p>");

  let operation;
  if(p.sign!=m.sign){
    operation = PLUS;
    addToOutput("<p>A i M su razlicitog znaka => A + M</p>");
  }else{
    operation = MINUS;
    addToOutput("<p>A i M su istog znaka => A - M</p>");
  }

  let sign = p.sign;

  addToOutput("<table style=\"border: none;\">");
  addToOutput("<thead><tr><th>A</th><th>P</th><th>Komentar</th></tr></thead>");
  addToOutput("<tbody>");
  addToOutput("<tr><td class=\"align-right\">" + registers[0].toWhole() + "</td><td>" + registers[1].toWhole() + "</td><td>Init</td></tr>");
  let work1 = "";
  let work2 = "";
  for(let im=0; im<len; im++){
    addToOutput("<tr>");
    
    if(!shift(registers, 1, ShiftTypes.LEFT, false)){
      addToStackTrace("divideSigned", "Unable to shift registers", log);
      return null;
    }

    work1 = registers[0].toWhole() + "<br>"
    registers[0] = wholeToLength(add(registers[0], operation==PLUS?m:neg_m, true, log), registers[0].whole.length, false);
    work1 = work1 + operation + m.toWhole() + "<br>" + registers[0].toWhole();
    work2 = "A = A " + operation + " M";

    if(registers[0].sign!=sign){
      registers[0] = wholeToLength(add(registers[0], operation==PLUS?neg_m:m, true, log), registers[0].whole.length, false);
      work1 = work1 + "<br>" + registers[0].toWhole();
      work2 = work2 + "<br>A menja znak <br> Restauracija";
    }else{
      registers[1].whole = registers[1].whole.substr(0, registers[1].whole.length-1) + "1";
    }

    addToOutput("<td class=\"align-right\">" + work1 + "</td>");
    addToOutput("<td>" + registers[1].toWhole() + "</td>");
    addToOutput("<td>" + "AP <-<br>" + work2 + "</td>");
    addToOutput("</tr>");
  }
  addToOutput("</tbody>");
  addToOutput("</table>");

  addToOutput("<p>");
  let quotient = convertToSigned(toDecimal(registers[1], false, false));
  if(operation==PLUS){
    quotient = complement(quotient, true, log);
    addToOutput("Kolicnik: -P = -(" + registers[1].toWhole() + ")2 = " + quotient.toSigned() + "<br>");
  }else{
    addToOutput("Kolicnik: P = (" + registers[1].toWhole() + ")2 = " + quotient.toSigned() + "<br>");
  }
  
  let rest = convertToSigned(toDecimal(registers[0], false ,false));
  addToOutput("Ostatak: A = (" + registers[0].toWhole() + ")2 = " + rest.toUnsigned() + "<br>");
  addToOutput("</p>");
  
  return quotient;
}