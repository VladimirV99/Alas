let output = "";
let stackTrace = [];

if (!Array.prototype.last){
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};

function addToOutput(text){
  output = output.concat(text + "\n");
}

function clearOutput(){
  output = "";
}

function getOutput(){
  return output;
}

function addToStackTrace(source, message, log=true){
  stackTrace.push({"source": source, "message": message});
  if(log)
    console.error(source + ": " + message);
}

function clearStackTrace(){
  stackTrace = [];
}

function printStackTrace(){
  for(item of stackTrace){
    console.log(stackTrace.source + ": " + stackTrace.message);
  }
}

function getStackTrace(){
  return stackTrace;
}

window.addToOutput = addToOutput;
window.clearOutput = clearOutput;
window.getOutput = getOutput;
window.addToStackTrace = addToStackTrace;
window.clearStackTrace = clearStackTrace;
window.printStackTrace = printStackTrace;
window.getStackTrace = getStackTrace;