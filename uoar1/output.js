var output = "";
var stackTrace = [];

function addToOutput(text){
  output = output.concat(text + "\n");
}

function clearOutput(){
  output = "";
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