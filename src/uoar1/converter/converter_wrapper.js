import { convertToBase, convertToType } from './converter.mjs';
import { getStackTraceLast, clearStackTrace, getOutput, clearOutput } from '../output.mjs';

import '../common.scss';

function convertToBase_wrapper(log=true){
  let solution = document.getElementById('solution1');
  let error = document.getElementById('error1');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let val = document.getElementById('input_number1').value.trim();
  let base_from = document.getElementById('input_base_src').value.trim();
  let base_to = document.getElementById('input_base_dest').value.trim();
  clearStackTrace();
  clearOutput();
  
  let res = convertToBase(val, base_from, base_to, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
    return res;
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
}

function convertToType_wrapper(log=true){
  let solution = document.getElementById('solution2');
  let error = document.getElementById('error2');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let val = document.getElementById('input_number2').value.trim();
  let base = document.getElementById('input_base').value.trim();
  clearStackTrace();
  clearOutput();
  
  let res = convertToType(val, base, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
    return res;
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
    return null;
  }
}

window.convertToBase = convertToBase_wrapper;
window.convertToType = convertToType_wrapper;