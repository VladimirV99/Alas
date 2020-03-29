import { IEEE754Formats } from '../ieee754_core.mjs';
import { ArithmeticOperations } from '../ieee754_arithmetic.mjs';
import { convertToIEEE754, convertFromIEEE754, doOperation } from './ieee754.mjs';
import { getStackTraceLast, clearStackTrace, addToOutput, getOutput, clearOutput } from '../output.mjs';

import '../common.scss';

function convertToIEEE754_wrapper(format, log=true){
  let solution = document.getElementById('solution1');
  let error = document.getElementById('error1');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let significand = document.getElementById('input_significand').value.trim();
  let exponent = document.getElementById('input_exponent').value.trim();
  clearStackTrace();
  clearOutput();
  addToOutput("<hr>");

  let res = convertToIEEE754(significand, exponent, format, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function convertFromIEEE754_wrapper(format, log=true){
  let solution = document.getElementById('solution2');
  let error = document.getElementById('error2');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let ieee = document.getElementById('input_ieee754').value.trim();
  clearStackTrace();
  clearOutput();
  addToOutput("<hr>");

  let res = convertFromIEEE754(ieee, format, log);
  
  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function doOperation_wrapper(operation, log=true){
  let solution = document.getElementById('solution3');
  let error = document.getElementById('error3');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let operand1 = document.getElementById("input_operand1").value.trim();
  let operand2 = document.getElementById("input_operand2").value.trim();
  clearStackTrace();
  clearOutput();
  addToOutput("<hr>");

  let res = doOperation(operand1, operand2, operation, log);
  
  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

window.convertToIEEE754 = convertToIEEE754_wrapper;
window.convertFromIEEE754 = convertFromIEEE754_wrapper;
window.doOperation = doOperation_wrapper;
window.IEEE754Formats = IEEE754Formats;
window.ArithmeticOperations = ArithmeticOperations;