import { encodeCRC, decodeCRC, encodeHammingSEC, decodeHammingSEC } from './error_correction.mjs';
import { getStackTraceLast, clearStackTrace, getOutput, clearOutput } from '../output.mjs';

import '../common.scss';

function encodeCRC_wrapper(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let message = document.getElementById('input_message1').value.trim();
  let generator = document.getElementById('input_generator').value.trim();
  clearStackTrace();
  clearOutput();

  let res = encodeCRC(message, generator, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function decodeCRC_wrapper(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let message = document.getElementById('input_message1').value.trim();
  let generator = document.getElementById('input_generator').value.trim();
  clearStackTrace();
  clearOutput();

  let res = decodeCRC(message, generator, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function encodeHammingSEC_wrapper(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let message = document.getElementById('input_message2').value.trim();
  clearStackTrace();
  clearOutput();

  let res = encodeHammingSEC(message, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

function decodeHammingSEC_wrapper(log=true){
  let solution = document.getElementById('solution');
  let error = document.getElementById('error');
  if(!solution.classList.contains('hidden'))
    solution.classList.add('hidden');
  if(!error.classList.contains('hidden'))
    error.classList.add('hidden');
  let message = document.getElementById('input_message2').value.trim();
  clearStackTrace();
  clearOutput();

  let res = decodeHammingSEC(message, log);

  if(res!=null){
    solution.innerHTML=getOutput();
    solution.classList.remove('hidden');
  }else{
    error.innerHTML="<p>"+getStackTraceLast().message+"</p>";
    error.classList.remove('hidden');
  }
  return res;
}

window.encodeCRC = encodeCRC_wrapper;
window.decodeCRC = decodeCRC_wrapper;
window.encodeHammingSEC = encodeHammingSEC_wrapper;
window.decodeHammingSEC = decodeHammingSEC_wrapper;