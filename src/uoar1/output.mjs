let output = "";
let stackTrace = [];

export function addToOutput(text){
  output = output.concat(text + "\n");
}

export function clearOutput(){
  output = "";
}

export function getOutput(){
  return output;
}

export function addToStackTrace(source, message, log=true){
  stackTrace.push({"source": source, "message": message});
  if(log)
    console.error(source + ": " + message);
}

export function clearStackTrace(){
  stackTrace = [];
}

export function printStackTrace(){
  for(item of stackTrace){
    console.error(stackTrace.source + ": " + stackTrace.message);
  }
}

export function getStackTrace(){
  return stackTrace;
}

export function getStackTraceLast(){
  if(stackTrace.length==0)
    return "";
  return stackTrace[stackTrace.length-1];
}