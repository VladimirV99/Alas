import '../uoar_core';
import '../type_converter';
import '../output';

import '../common.css';

function unsigned_multiply_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearOutput();
  clearStackTrace();
  let multiplicand = document.getElementById('input_operand1').value.trim();
  let multiplier = document.getElementById('input_operand2').value.trim();
  if(multiplicand=="" || multiplier==""){
    addToStackTrace("unsigned_multiply", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  multiplicand = toUOARNumber(multiplicand, 10, NumberTypes.SIGNED, false);
  multiplier = toUOARNumber(multiplier, 10, NumberTypes.SIGNED, false);
  if(multiplicand===null || multiplier===null){
    if(multiplicand===null){
      addToStackTrace("unsigned_multiply", "Invalid multiplicand", log);
    }else{
      addToStackTrace("unsigned_multiply", "Invalid multiplier", log);
    }
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  multiplicand = fromDecimal(multiplicand, 2, false, true);
  multiplier = fromDecimal(multiplier, 2, false, true);
  
  let res = unsigned_multiply(multiplicand, multiplier, false, log);
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function unsigned_multiply(num1, num2, standardized=false, log=true){
  if(num1===null || num2===null || num1.base!=2 || num2.base!=2){
    addToStackTrace("unsigned_multiply", "Operands are invalid", log);
    return null;
  }
  if(getSignMultiplierForNumber(num1)!=1 || getSignMultiplierForNumber(num2)!=1){
    addToStackTrace("unsigned_multiply", "Operands must be positive", log);
    return null;
  }

  num1 = convertToType(trimSign(num1), NumberTypes.TC, standardized, log);
  num2 = convertToType(trimSign(num2), NumberTypes.TC, standardized, log);
  equalizeLength(num1, num2, true, log);
  let len = num1.sign.length + num1.whole.length + num1.fraction.length;

  let c = new UOARNumber("0", "", "", 2, NumberTypes.TC);
  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, num1.fraction.length);
  let m = num1;
  let p = num2;
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
      registers[1] = add(registers[1], m, NumberTypes.TC, true, log);
      work1 = "+" + m.toWhole() + "<br>" + registers[1].toWhole() + "<br>";
      if(registers[1].whole.length>m.whole.length){
        registers[0].sign = registers[1].whole.charAt(0);
        registers[1].whole = registers[1].whole.substr(1);
      }
      work2 = work2.concat("A = A + M");
    }
    
    shift(registers, 1, ShiftTypes.RIGHT_L);
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
  let AP_frac_len = 2 * num1.fraction.length;
  AP = AP.substr(0, AP.length-AP_frac_len) + "." + AP.substr(AP.length-AP_frac_len);
  let res = toUOARNumber(AP, 2, NumberTypes.TC, false);
  addToOutput("Rezultat: (" + res.toSigned() + ")2");
  addToOutput("</p>");
  return res;
}

function booth_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearOutput();
  clearStackTrace();
  let multiplicand = document.getElementById('input_operand1').value.trim();
  let multiplier = document.getElementById('input_operand2').value.trim();
  if(multiplicand=="" || multiplier==""){
    addToStackTrace("booth", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  multiplicand = toUOARNumber(multiplicand, 10, NumberTypes.SIGNED, false);
  multiplier = toUOARNumber(multiplier, 10, NumberTypes.SIGNED, false);
  if(multiplicand===null || multiplier===null){
    if(multiplicand===null){
      addToStackTrace("booth", "Invalid multiplicand", log);
    }else{
      addToStackTrace("booth", "Invalid multiplier", log);
    }
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  multiplicand = fromDecimal(multiplicand, 2, false, true);
  multiplier = fromDecimal(multiplier, 2, false, true);
  
  let res = booth(multiplicand, multiplier, false, log);
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function booth(num1, num2, standardized=false, log=true){
  if(num1===null || num2===null || num1.base!=2 || num2.base!=2){
    addToStackTrace("booth", "Operands are not binary", log);
    return;
  }

  num1 = convertToType(trimSign(num1), NumberTypes.TC, standardized, log);
  num2 = convertToType(trimSign(num2), NumberTypes.TC, standardized, log);
  equalizeLength(num1, num2, true, log);
  let len = num1.sign.length + num1.whole.length + num1.fraction.length;

  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, num1.fraction.length);
  let m = num1;
  let neg_m = complement(num1);
  let p = num2;
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
      registers[0] = add(registers[0], neg_m, NumberTypes.TC, true, log);
      work1 = "+" + neg_m.toWhole() + "<br>" + registers[0].toWhole() + "<br>";
      work2 = work2.concat("A = A - M");
    }else if(op=="01"){
      registers[0] = add(registers[0], m, NumberTypes.TC, true, log);
      work1 = "+" + m.toWhole() + "<br>" + registers[0].toWhole() + "<br>";
      work2 = work2.concat("A = A + M"); 
    }
    
    shift(registers, 1, ShiftTypes.RIGHT_A);
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
  let AP_frac_len = 2 * num1.fraction.length;
  AP = AP.substr(0, AP.length-AP_frac_len) + "." + AP.substr(AP.length-AP_frac_len);
  let res = toUOARNumber(AP, 2, NumberTypes.TC, false);
  addToOutput("Rezultat: (" + res.toSigned() + ")2");
  addToOutput("</p>");
  return res;
}

function modified_booth_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearOutput();
  clearStackTrace();
  let multiplicand = document.getElementById('input_operand1').value.trim();
  let multiplier = document.getElementById('input_operand2').value.trim();
  if(multiplicand=="" || multiplier==""){
    addToStackTrace("modified_booth", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  multiplicand = toUOARNumber(multiplicand, 10, NumberTypes.SIGNED, false);
  multiplier = toUOARNumber(multiplier, 10, NumberTypes.SIGNED, false);
  if(multiplicand===null || multiplier===null){
    if(multiplicand===null){
      addToStackTrace("modified_booth", "Invalid multiplicand", log);
    }else{
      addToStackTrace("modified_booth", "Invalid multiplier", log);
    }
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  multiplicand = fromDecimal(multiplicand, 2, false, true);
  multiplier = fromDecimal(multiplier, 2, false, true);

  let res = modified_booth(multiplicand, multiplier, false, log);
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function modified_booth(num1, num2, standardized=false, log=true){
  if(num1===null || num2===null || num1.base!=2 || num2.base!=2){
    addToStackTrace("modified_booth", "Operands are not binary", log);
    return;
  }

  num1 = convertToType(trimSign(num1), NumberTypes.TC, standardized, log);
  num2 = convertToType(trimSign(num2), NumberTypes.TC, standardized, log);
  if(num2.whole.length%2==1){
    wholeToLength(num2, num2.whole.length+1);
  }
  if(num1.sign!=num1.whole[0]){
    wholeToLength(num1, num1.whole.length+1);
  }
  wholeToLength(num1, 2*Math.max(num1.whole.length, num2.whole.length)-1);

  let work1 = "";
  let work2 = "";

  let mults = [];
  let last_char = "0";
  for(let i=num2.whole.length-1; i>=0; i--){
    work1 = "<td>" + num2.whole.charAt(i) + "</td>" + work1;
    if(num2.whole.charAt(i)==last_char){
      work2 = "<td>0</td>" + work2;
      mults.unshift(0);
    }else{
      if(num2.whole.charAt(i)=="1"){
        work2 = "<td>-1</td>" + work2;
        mults.unshift(-1);
      }else{
        work2 = "<td>+1</td>" + work2;
        mults.unshift(1);
      }
    }
    last_char = num2.whole.charAt(i);
  }
  addToOutput("<p>Kodirani mnozilac:<table style=\"border: none;\"><tbody><tr>"+work1+"</tr><tr>"+work2+"</tr></tbody></table></p>");

  let coded_mults = [];
  for(let i = 0; i<mults.length; i+=2){
    coded_mults.unshift(2*mults[i]+mults[i+1]);
  }

  let res = new UOARNumber("0", "0", "0", 2, NumberTypes.TC);
  let registers = [num1];

  addToOutput("<table style=\"border: none;\"");
  addToOutput("<thead><tr><th>k</th><th>v(k)</th><th>M<<2k</th><th>(M<<2k)v(k)</th></tr></thead>");
  addToOutput("<tbody>");
  for(let i = 0; i<coded_mults.length; i++){
    let temp = 1;
    let multiplier = registers[0].copy();
    if(coded_mults[i]<0){
      multiplier = complement(multiplier);
      temp = temp*-1;
    }
    if(coded_mults[i]==0){
      work1 = createZeroString(num1.whole.length);
    }else if(coded_mults[i]==temp){
      work1 = multiplier.toWhole();
      res = add(res, multiplier, NumberTypes.TC, false);
    }else if(coded_mults[i]==2*temp){
      multiplier.whole = multiplier.whole.substr(1) + "0";
      work1 = multiplier.toWhole();
      res = add(res, multiplier, NumberTypes.TC, false);
    }

    addToOutput("<tr>");
    addToOutput("<td>" + i + "</td>");
    addToOutput("<td>" + coded_mults[i] + "</td>");
    addToOutput("<td>" + registers[0].toWhole() + "</td>");
    addToOutput("<td>" + work1 + "</td>");
    addToOutput("</tr>");

    shift(registers, 2, ShiftTypes.LEFT);
  }
  addToOutput("</tbody>");
  addToOutput("</table>");

  addToOutput("<p>Rezultat: (" + res.toSigned() + ")2</p>");
  return res;
}

function unsigned_divide_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearOutput();
  clearStackTrace();
  let dividend = document.getElementById('input_operand1').value.trim();
  let divider = document.getElementById('input_operand2').value.trim();
  if(dividend=="" || divider==""){
    addToStackTrace("unsigned_divide", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  dividend = toUOARNumber(dividend, 10, NumberTypes.SIGNED, false);
  divider = toUOARNumber(divider, 10, NumberTypes.SIGNED, false);
  if(dividend===null || divider===null){
    if(dividend===null){
      addToStackTrace("unsigned_divide", "Invalid dividend", log);
    }else{
      addToStackTrace("unsigned_divide", "Invalid divider", log);
    }
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  dividend = fromDecimal(dividend, 2, false, true);
  divider = fromDecimal(divider, 2, false, true);

  let res = unsigned_divide(dividend, divider, false, log);
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function unsigned_divide(num1, num2, standardized=false, log=true){
  if(num1===null || num2===null || num1.base!=2 || num2.base!=2){
    addToStackTrace("unsigned_divide", "Operands are not binary", log);
    return null;
  }
  if(getSignMultiplierForNumber(num1)!=1 || getSignMultiplierForNumber(num2)!=1){
    addToStackTrace("unsigned_divide", "Operands must be positive", log);
    return null;
  }

  num1 = convertToType(trimSign(num1), NumberTypes.TC, standardized, log);
  num2 = convertToType(trimSign(num2), NumberTypes.TC, standardized, log);
  equalizeLength(num1, num2, true, log);
  let len = num1.sign.length + num1.whole.length;

  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, num1.fraction.length);
  let p = num1;
  let m = num2;
  let neg_m = complement(num2);
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
    
    shift(registers, 1, ShiftTypes.LEFT);

    registers[0] = wholeToLength(add(registers[0], neg_m, NumberTypes.TC, true, log), registers[0].whole.length, false);
    work1 = registers[0].toWhole() + "<br>" + "-" + m.toWhole() + "<br>" + registers[0].toWhole();
    work2 = "A = A - M<br>";

    if(registers[0].sign=="1"){
      registers[0] = wholeToLength(add(registers[0], m, NumberTypes.TC, true, log), registers[0].whole.length, false);
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

function signed_divide_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearOutput();
  clearStackTrace();
  let dividend = document.getElementById('input_operand1').value.trim();
  let divider = document.getElementById('input_operand2').value.trim();
  if(dividend=="" || divider==""){
    addToStackTrace("signed_divide", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  dividend = toUOARNumber(dividend, 10, NumberTypes.SIGNED, false);
  divider = toUOARNumber(divider, 10, NumberTypes.SIGNED, false);
  if(dividend===null || divider===null){
    if(dividend===null){
      addToStackTrace("signed_divide", "Invalid dividend", log);
    }else{
      addToStackTrace("signed_divide", "Invalid divider", log);
    }
    error.innerHTML="<p>"+getStackTrace().last().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  dividend = fromDecimal(dividend, 2, false, true);
  divider = fromDecimal(divider, 2, false, true);

  let res = signed_divide(dividend, divider, false, log);
  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function signed_divide(num1, num2, standardized=false, log=true){
  if(num1===null || num2===null || num1.base!=2 || num2.base!=2){
    addToStackTrace("signed_divide", "Operands are not binary", log);
    return null;
  }

  num1 = convertToType(trimSign(num1), NumberTypes.TC, standardized, log);
  num2 = convertToType(trimSign(num2), NumberTypes.TC, standardized, log);
  equalizeLength(num1, num2, true, log);
  let len = num1.sign.length + num1.whole.length;

  let a = toLength(new UOARNumber("0", "0", "0", 2, NumberTypes.TC), len-1, num1.fraction.length);
  let p = num1;
  let m = num2;
  let neg_m = complement(num2);
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
    
    shift(registers, 1, ShiftTypes.LEFT);

    work1 = registers[0].toWhole() + "<br>"
    registers[0] = wholeToLength(add(registers[0], operation==PLUS?m:neg_m, NumberTypes.TC, true, log), registers[0].whole.length, false);
    work1 = work1 + operation + m.toWhole() + "<br>" + registers[0].toWhole();
    work2 = "A = A " + operation + " M";

    if(registers[0].sign!=sign){
      registers[0] = wholeToLength(add(registers[0], operation==PLUS?neg_m:m, NumberTypes.TC, true, log), registers[0].whole.length, false);
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
    quotient = complement(quotient);
    addToOutput("Kolicnik: -P = -(" + registers[1].toWhole() + ")2 = " + quotient.toSigned() + "<br>");
  }else{
    addToOutput("Kolicnik: P = (" + registers[1].toWhole() + ")2 = " + quotient.toSigned() + "<br>");
  }
  
  let rest = convertToSigned(toDecimal(registers[0], false ,false));
  addToOutput("Ostatak: A = (" + registers[0].toWhole() + ")2 = " + rest.toUnsigned() + "<br>");
  addToOutput("</p>");
  
  return quotient;
}

window.unsigned_multiply_wrapper = unsigned_multiply_wrapper;
window.booth_wrapper = booth_wrapper;
window.modified_booth_wrapper = modified_booth_wrapper;
window.unsigned_divide_wrapper = unsigned_divide_wrapper;
window.signed_divide_wrapper = signed_divide_wrapper;