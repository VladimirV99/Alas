import { multiplyUnsigned, multiplyBooth, multiplyModifiedBooth, divideUnsigned, divideSigned } from './arithmetic.mjs';
import { getStackTraceLast, clearStackTrace, getOutput, clearOutput } from '../output.mjs';

import '../common.scss';

function multiplyUnsigned_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let operand1 = document.getElementById('input_operand1').value.trim();
  let operand2 = document.getElementById('input_operand2').value.trim();
  clearOutput();
  clearStackTrace();
  
  let res = multiplyUnsigned(operand1, operand2, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function multiplyBooth_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let operand1 = document.getElementById('input_operand1').value.trim();
  let operand2 = document.getElementById('input_operand2').value.trim();
  clearOutput();
  clearStackTrace();
  
  let res = multiplyBooth(operand1, operand2, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function multiplyModifiedBooth_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let operand1 = document.getElementById('input_operand1').value.trim();
  let operand2 = document.getElementById('input_operand2').value.trim();
  clearOutput();
  clearStackTrace();

  let res = multiplyModifiedBooth(operand1, operand2, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    if(solution.classList.contains('hidden'))
      solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function divideUnsigned_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let operand1 = document.getElementById('input_operand1').value.trim();
  let operand2 = document.getElementById('input_operand2').value.trim();
  clearOutput();
  clearStackTrace();

  let res = divideUnsigned(operand1, operand2, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function divideSigned_wrapper(log=true) {
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let operand1 = document.getElementById('input_operand1').value.trim();
  let operand2 = document.getElementById('input_operand2').value.trim();
  clearOutput();
  clearStackTrace();

  let res = divideSigned(operand1, operand2, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

window.multiplyUnsigned = multiplyUnsigned_wrapper;
window.multiplyBooth = multiplyBooth_wrapper;
window.multiplyModifiedBooth = multiplyModifiedBooth_wrapper;
window.divideUnsigned = divideUnsigned_wrapper;
window.divideSigned = divideSigned_wrapper;