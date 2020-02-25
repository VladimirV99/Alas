import { NumberTypes, createZeroString, addZeroesBefore, numberToBinary } from '../uoar_core';
import { addToStackTrace, getStackTrace, clearStackTrace, addToOutput, getOutput, clearOutput } from '../output';

import '../common.scss';

function encodeCRC(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();

  let message = document.getElementById('input_message1').value;
  let generator = document.getElementById('input_generator').value;
  if(message=="" || generator==""){
    addToStackTrace("encodeCRC", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isBinaryInteger(message) || !isBinaryInteger(generator)){
    addToStackTrace("encodeCRC", "Input isn't binary", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  for(let i=0; i<generator.length; i++){
    if(generator.charAt(i)=="0"){
      if(i==generator.length-1){
        return null;
      }
      continue;
    }
    generator = generator.substr(i);
    break;
  }

  let res = message + createZeroString(generator.length-1);
  addToOutput("<p>"+res+" % "+generator+" = ");

  while(res.length>=generator.length){
    let temp = "";
    for(let i = 0; i<generator.length; i++){
      if(res.charAt(i)==generator.charAt(i))
        temp += "0";
      else
        temp += "1";
    }
    for(let i=0; i<temp.length; i++){
      if(temp.charAt(i)=="0"){
        if(i==temp.length-1){
          temp = "";
          break;
        }
        continue;
      }
      temp = temp.substr(i);
      break;
    }
    res = temp + res.substr(generator.length);
  }
  
  if(res=="")
    res = "0";
  addToOutput(res+"</p>");
  res = message + createZeroString(generator.length-res.length-1) + res;
  addToOutput("<p>Kodirana poruka: " + res + "</p>");

  solution.innerHTML=getOutput();
  solution.classList.remove('hidden');
  return res;
}

function decodeCRC(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();

  let message = document.getElementById('input_message1').value;
  let generator = document.getElementById('input_generator').value;
  if(message=="" || generator==""){
    addToStackTrace("decodeCRC", "Empty input", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isBinaryInteger(message) || !isBinaryInteger(generator)){
    addToStackTrace("encodeCRC", "Input isn't binary", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  for(let i=0; i<generator.length; i++){
    if(generator.charAt(i)=="0"){
      if(i==generator.length-1){
        return null;
      }
      continue;
    }
    generator = generator.substr(i);
    break;
  }

  let res = message;
  while(res.length>=generator.length){
    let temp = "";
    for(let i = 0; i<generator.length; i++){
      if(res.charAt(i)==generator.charAt(i))
        temp += "0";
      else
        temp += "1";
    }
    for(let i=0; i<temp.length; i++){
      if(temp.charAt(i)=="0"){
        if(i==temp.length-1){
          temp = "";
          break;
        }
        continue;
      }
      temp = temp.substr(i);
      break;
    }
    res = temp + res.substr(generator.length);
  }

  addToOutput("<p>"+message+" % "+generator+" = ");
  if(res!=""){
    addToOutput(res+"</p>");
    addToOutput("<p>poruka nije ispravno primljena</p>");
  }else{
    addToOutput("0</p>");
    addToOutput("<p>poruka je ispravno primljena</p>");
  }

  solution.innerHTML=getOutput();
  solution.classList.remove('hidden');
  return res;
}

function isBinaryInteger(number){
  for(let i = 0; i<number.length; i++){
    if(number.charAt(i)!="0" && number.charAt(i)!="1"){
      return false;
    }
  }
  return true;
}

function encodeHammingSEC(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();

  let message = document.getElementById('input_message2').value;
  if(message.length!=8){
    addToStackTrace("encodeCRC", "Message must be 8 digits long", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isBinaryInteger(message)){
    addToStackTrace("encodeCRC", "Message isn't binary", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  let control_bits = 1;
  while(Math.pow(2, control_bits)<=message.length){
    control_bits++;
  }

  let bits = [];
  addToOutput("<p><table style=\"border: none;\">");
  addToOutput("<tbody>");
  let m_count = message.length;
  let c_count = control_bits;
  for(let i = message.length+control_bits; i>0; i--){
    addToOutput("<tr>");
    if((i&(i-1))!=0){
      bits.unshift(addZeroesBefore(numberToBinary(i, false), 2, NumberTypes.UNSIGNED, control_bits));
      addToOutput("<td>"+i+"</td><td>"+bits[bits.length-1]+"</td><td>m"+m_count+"</td>");
      m_count--;
    }else{
      addToOutput("<td>"+i+"</td><td>"+addZeroesBefore(numberToBinary(i, false), 2, NumberTypes.UNSIGNED, control_bits)+"</td><td>c"+c_count+"</td>");
      c_count--;
    }
    addToOutput("</tr>");
  }
  addToOutput("</tbody>");
  addToOutput("</table></p>");
  

  addToOutput("<p><table style=\"border: none;\">");
  addToOutput("<tbody>");
  addToOutput("<tr>");
  for(let i = 0; i<message.length; i++){
    addToOutput("<td>m" + (message.length-i) + "</td>");
  }
  addToOutput("</tr>");
  addToOutput("<tr>");
  for(let i = 0; i<message.length; i++){
    addToOutput("<td>" + message.charAt(i) + "</td>");
  }
  addToOutput("</tr>");
  addToOutput("</tbody>");
  addToOutput("</table></p>");

  let res = [];
  for(let i = 0; i<control_bits; i++){
    let ones = 0;
    for(let j = 0; j<bits.length; j++){
      if(bits[j].charAt(i)=="1" && message.charAt(message.length-j-1)=="1"){
        ones++;
      }
    }
    if(ones%2==1)
      res.push("1");
    else
      res.push("0");
  }

  addToOutput("<p>");
  for(let i = 1; i<=control_bits; i++){
    let work = "";
    addToOutput("c" + i + " = ");
    let first = true;
    for(let j=0; j<bits.length; j++){
      if(bits[j].charAt(control_bits-i)=="1"){
        if(first){
          first=false;
        }else{
          addToOutput(" + ");
          work = work + " + ";
        }
        addToOutput("m" + (j+1));
        work = work + message.charAt(message.length-j-1);
      }
    }
    addToOutput(" = " + work + " = " + res[control_bits-i] + "<br>");
  }
  addToOutput("</p>");

  res = message + res.join("");
  addToOutput("<p>Kodirana poruka: " + res + "</p>");

  solution.innerHTML=getOutput();
  solution.classList.remove('hidden');
  return res;
}

function decodeHammingSEC(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  clearStackTrace();
  clearOutput();

  let message = document.getElementById('input_message2').value;
  if(message.length!=12){
    addToStackTrace("encodeCRC", "Message must be 12 digits long", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
  if(!isBinaryInteger(message)){
    addToStackTrace("encodeCRC", "Message isn't binary", log);
    error.innerHTML="<p>"+getStackTrace()[0].message+"</p>";
    error.classList.remove('hidden');
    return null;
  }

  let control_bits = 4;

  let bits = [];
  addToOutput("<p><table style=\"border: none;\">");
  addToOutput("<tbody>");
  let m_count = message.length;
  let c_count = control_bits;
  for(let i = message.length; i>0; i--){
    addToOutput("<tr>");
    if((i&(i-1))!=0){
      bits.unshift(addZeroesBefore(numberToBinary(i, false), 2, NumberTypes.UNSIGNED, control_bits));
      addToOutput("<td>"+i+"</td><td>"+bits[bits.length-1]+"</td><td>m"+m_count+"</td>");
      m_count--;
    }else{
      addToOutput("<td>"+i+"</td><td>"+addZeroesBefore(numberToBinary(i, false), 2, NumberTypes.UNSIGNED, control_bits)+"</td><td>c"+c_count+"</td>");
      c_count--;
    }
    addToOutput("</tr>");
  }
  addToOutput("</tbody>");
  addToOutput("</table></p>");

  addToOutput("<p><table style=\"border: none;\">");
  addToOutput("<tbody>");
  addToOutput("<tr>");
  for(let i = 0; i<message.length-control_bits; i++){
    addToOutput("<td>m" + (message.length-control_bits-i) + "</td>");
  }
  for(let i = message.length-control_bits; i<message.length; i++){
    addToOutput("<td>c" + (message.length-control_bits-i) + "</td>");
  }
  addToOutput("</tr>");
  addToOutput("<tr>");
  for(let i = 0; i<message.length; i++){
    addToOutput("<td>" + message.charAt(i) + "</td>");
  }
  addToOutput("</tr>");
  addToOutput("</tbody>");
  addToOutput("</table></p>");

  let code = [];
  code.push(message.charAt(message.length-control_bits+0));
  code.push(message.charAt(message.length-control_bits+1));
  code.push(message.charAt(message.length-control_bits+2));
  code.push(message.charAt(message.length-control_bits+3));

  let check_code = [];
  for(let i = 0; i<control_bits; i++){
    let ones = 0;
    for(let j = 0; j<bits.length; j++){
      if(bits[j].charAt(i)=="1" && message.charAt(message.length-control_bits-j-1)=="1"){
        ones++;
      }
    }
    if(ones%2==1)
      check_code.push("1");
    else
      check_code.push("0");
  }

  addToOutput("<p>");
  for(let i = 1; i<=control_bits; i++){
    let work = "";
    addToOutput("c" + i + "' = ");
    let first = true;
    for(let j=0; j<bits.length; j++){
      if(bits[j].charAt(control_bits-i)=="1"){
        if(first){
          first=false;
        }else{
          addToOutput(" + ");
          work = work + " + ";
        }
        addToOutput("m" + (j+1));
        work = work + message.charAt(message.length-j-1);
      }
    }
    addToOutput(" = " + work + " = " + check_code[control_bits-i] + "<br>");
  }
  addToOutput("</p>");

  let code_error = "";
  for(let i = control_bits-1; i>=0; i--){
    code_error = (code[i]==check_code[i] ? "0" : "1") + code_error;
  }
  addToOutput("<p>c4c3c2c1 + c4'c3'c2'c1' = " + code_error + "</p>");

  let res = message;

  let has_error = false;
  for(let i = 0; i<bits.length; i++){
    if(code_error==bits[i]){
      has_error = true;
      res = res.substr(0, message.length-control_bits-i-1) + (res.charAt(message.length-control_bits-i-1)=="0"?"1":"0") + res.substr(message.length-control_bits-i);
      addToOutput("<p>greska u bitu m" + (i+1) + "<br>korekcija: " + res + "</p>");
    }
  }
  if(!has_error){
    addToOutput("<p>poruka ispravna</p>");
  }

  solution.innerHTML=getOutput();
  solution.classList.remove('hidden');
  return res;
}

window.encodeCRC = encodeCRC;
window.decodeCRC = decodeCRC;
window.encodeHammingSEC = encodeHammingSEC;
window.decodeHammingSEC = decodeHammingSEC;