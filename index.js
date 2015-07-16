var glob = require('glob');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

module.exports = FixMe;
function FixMe() { }

// Strings to scan for in source
var fixmeStrings = "'(FIXME|TODO|HACK|XXX|BUG)'";

var excludeExtensions = [".jpg", ".jpeg", ".png", ".gif"];

// Prints properly structured Issue data to STDOUT according to
// Code Climate Engine specification.
var printIssue = function(fileName, lineNum, matchedString){
  var issue = {
    "type": "issue",
    "check_name": "FIXME found",
    "description": matchedString + " found",
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
  var grepString = "grep -inHwoE " + fixmeStrings + " " + file;

  // Execute grep with the FIXME patterns
  exec(grepString, function (error, stdout, stderr) {
    var results = stdout.toString();

    if (results !== ""){
      // Parses grep output
      var lines = results.split("\n");
      
      lines.forEach(function(line, index, array){
        // grep spits out an extra line that we can ignore
        if(index < (array.length-1)){
          // Grep output is colon delimited
          var cols = line.split(":");

          // Remove remnants of container paths for external display
          var fileName = cols[0].split("/code/")[1];
          var lineNum = cols[1];
          var matchedString = cols[2];

          if (matchedString !== undefined){
            printIssue(fileName, lineNum, matchedString);
          }
        }
      })
    }
  })
}

var eligibleFile = function(fp, excludePaths){
  return (excludePaths.indexOf(fp.split("/code/")[1]) < 0) &&
  !fs.lstatSync(fp).isDirectory() &&
  (excludeExtensions.indexOf(path.extname(fp)) < 0)
}

// Uses glob to traverse code directory and find files to analyze,
// excluding files passed in with by CLI config
var fileWalk = function(excludePaths){
  var analysisFiles = [];
  var allFiles = glob.sync("/code/**/**", {});

  allFiles.forEach(function(file, i, a){
    if(eligibleFile(file, excludePaths)){
      analysisFiles.push(file);
    }
  });
    
  return analysisFiles;
}

FixMe.prototype.runEngine = function(){
  // Check for existence of config.json, parse exclude paths if it exists
  if (fs.existsSync("/config.json")) {
    var engineConfig = JSON.parse(fs.readFileSync("/config.json"));
    var excludePaths = engineConfig.exclude_paths;
  } else {
    var excludePaths = [];
  }

  // Walk /code/ path and find files to analyze
  var analysisFiles = fileWalk(excludePaths);

  // Execute main loop and find fixmes in valid files
  analysisFiles.forEach(function(f, i, a){
    findFixmes(f);
  });
}
