let output = "";
let stackTrace = [];

if (!Array.prototype.last){
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};

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
    console.log(stackTrace.source + ": " + stackTrace.message);
  }
}

export function getStackTrace(){
  return stackTrace;
}
