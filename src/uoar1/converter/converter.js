import '../uoar_core';
import '../type_converter';
import '../output';

import '../common.css';

export function convertBase(log=true){
  var solution = document.getElementById('solution');
  var error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  var val = document.getElementById('input_number').value;
  var base1 = document.getElementById('input_base_src').value;
  var base2 = document.getElementById('input_base_dest').value;
  clearStackTrace();
  clearOutput();
  if(val=="" || base1=="" || base2==""){
    addToStackTrace("convertBase", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isValidBase(base1)){
    addToStackTrace("convertBase", "Invalid base \"" + base1 + "\"", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isValidBase(base2)){
    addToStackTrace("convertBase", "Invalid base \"" + base2 + "\"", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isValidNumber(val, base1, NumberTypes.SIGNED)){
    addToStackTrace("convertBase", "Number is invalid", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  var res = convertBases(toUOARNumber(val, base1, NumberTypes.SIGNED, true), base2, false, true);
  if(res===null){
    addToStackTrace("convertBase", "Conversion Error", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  solution.innerHTML=getOutput();
  solution.classList.remove('hidden');
  return res;
}

function convertBases(number, base_to, log=true){
  if(number.base==base_to){
    return number;
  }
  var res = fromDecimal(toDecimal(number, true, log), base_to, true, log);
  if(res===null){
    addToStackTrace("convertBases", "Conversion error, result null", log);
  }
  return res;
}

function toDecimal(number, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), false);
    if(number === null){
      addToStackTrace("toDecimal", "Invalid number \"" + number + "\" for base " + base, log);
      return null;
    }
  }
  if(number.base==10){
    return number;
  }
  var work1 = "";
  var work2 = "";
  

  var whole = 0;
  var num_length = number.whole.length-1;
  var temp;
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

  var fraction = 0;
  var precision = PRECISION_NUMBER / number.base;
  var base_deg = number.base;
  for(let i = 0; i<number.fraction.length; i++){
    temp = getValueAt(number.fraction, i, log);
    work1 = work1.concat(" + " + temp + "*" + number.base + "^(-" + (i+1) + ")");
    work2 = work2.concat(" + " + temp + "/" + base_deg);
    fraction += Math.floor(temp * precision);
    precision = precision / number.base;
    base_deg = base_deg * number.base;
  }
  fraction = fraction.toString();
  
  var res = new UOARNumber(number.sign, whole, fraction, 10, number.number_type);
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

function fromDecimal(number, base, standardized=false, log=true){
  if(!standardized){
    number = standardizeUOARNumber(number.copy(), log);
    if(number === null){
      addToStackTrace("fromDecimal", "Invalid number \"" + number + "\" for base 10", log);
      return null;
    }
  }
  if(base==10){
    return number;
  }
  
  var work1 = "";
  var work2 = "";

  var whole = "";
  var whole_dec = baseToDecimalInteger(number.whole, number.base, NumberTypes.UNSIGNED, log);
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
  
  var fraction = "";
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

  var res = new UOARNumber(number.sign, whole, fraction, base, number.number_type);
  addToOutput("<p>"+res.toSigned()+"</p>");
  return res;
}

function convertType(log=true){
  var solution = document.getElementById('solution');
  var error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  var val = document.getElementById('input_number').value;
  var base = document.getElementById('input_base_src').value;
  clearStackTrace();
  clearOutput();

  if(val=="" || base==""){
    addToStackTrace("convertBase", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
    
  var number = toUOARNumber(val, base, NumberTypes.SIGNED, false);
  if(number===null){
    addToStackTrace("convertType", "Invalid number", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  
  addToOutput("<table id=\"representations\">");
  addToOutput("<tr><th colspan=\"2\">");
  addToOutput("(" + number.toSigned() + ")" + number.base + "</th></tr>");
  addToOutput("<tr><td>ZAV:</td>");
  addToOutput("<td>(" + convertToSMR(number, false, true).toSigned() + ")" + number.base + "</td></tr>");
  addToOutput("<tr><td>NK:</td>");
  addToOutput("<td>(" + convertToOC(number, false, true).toSigned() + ")" + number.base + "</td></tr>");
  addToOutput("<tr><td>PK:</td>");
  addToOutput("<td>(" + convertToTC(number, false, true).toSigned() + ")" + number.base + "</td></tr>");
  addToOutput("</table>");

  solution.innerHTML=getOutput();
  solution.classList.remove('hidden');
  return number;
}

window.convertBase = convertBase;
window.convertType = convertType;

// document.getElementById('convertBase').onclick = convertBase;