var glob = require('glob');
var exec = require('child_process').exec;

module.exports = FixMe;
function FixMe() { }

// Strings to scan for in source
var fixmeStrings = "'FIXME|TODO|HACK|BUG'";

// Prints properly structured Issue data to STDOUT according to
// Code Climate Engine specification.
var printIssue = function(fileName, lineNum){
  var issue = {
    "type": "issue",
    "check_name": "FIXME found",
    "description": "Code comment found that needs your attention.",
    "categories": ["Bug Risk"],
    "location":{
      "path": fileName,
      "lines": {
        "begin": lineNum,
        "end": lineNum 
      }
    }
  };

  // Issues must be followed by a null byte
  var issueString = JSON.stringify(issue)+"\0";
  console.log(issueString);
}

var findFixmes = function(file){
  // Prepare the grep string for execution (uses BusyBox grep)
  var grepString = "grep -inH -E " + fixmeStrings + " " + file;

  // Execute grep with the FIXME patterns
  exec(grepString, function(error, stdout, stderr) {

    // Parses grep output
    var lines = stdout.split("\n");
    lines.forEach(function(line, index, array){

      // grep spits out an extra line that we can ignore
      if(index < (array.length-1)){
        
        var cols = line.split(":");

        // Remove remnants of container paths for external display
        var fileName = cols[0].split("/code/")[1];
        var lineNum = cols[1];
        
        printIssue(fileName, lineNum);
      }
    })
  })
}

// Uses glob to traverse code directory and find files to analyze,
// excluding files passed in with by CLI config
var fileWalk = function(excludePaths){
  var analysisFiles = [];
  var allFiles = glob.sync("/code/**/**", {});

  allFiles.forEach(function(file, i, a){
    if(excludePaths.indexOf(file.split("/code/")[1]) < 0) {
      analysisFiles.push(file);
    }
  });
    
  return analysisFiles;
}

FixMe.prototype.runEngine = function(){
  // Pull engine config from env for exclude files
  var config = JSON.parse(process.env.ENGINE_CONFIG);

  // Walk /code/ path and find files to analyze
  var analysisFiles = fileWalk(config.exclude_paths);

  // Execute main loop and find fixmes in valid files
  analysisFiles.forEach(function(f, i, a){
    findFixmes(f);
  });
}
