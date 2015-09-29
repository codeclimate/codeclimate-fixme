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

// Returns an array of unique array values not included in the other provided array
var diff = function(a1, a2) {
  var result = [];

  for (var i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) === -1) {
      result.push(a1[i]);
    }

  }
  return result;
}

// Returns all the file paths in the main directory that match the given pattern
var buildFiles = function(paths) {
  var files = [];

  paths.forEach(function(path, i, a) {
    var pattern = "/code/" + path + "**"
    files.push.apply(files, glob.sync(pattern, {}));
  });

  return files;
}

// Filters the directory paths out
var filterFiles = function(files) {
  return files.filter(function(file) {
    return !fs.lstatSync(file).isDirectory();
  });
}

// Returns file paths based on the exclude_paths values in config file
var buildFilesWithExclusions = function(exclusions) {
  var allFiles = glob.sync("/code/**/**", {});
  var excludedFiles = buildFiles(exclusions);

  return diff(allFiles, excludedFiles);
}

// Returns file paths based on the include_paths values in config file
var buildFilesWithInclusions = function(inclusions) {
  return buildFiles(inclusions);
}

FixMe.prototype.runEngine = function(){
  var analysisFiles = []

  if (fs.existsSync("/config.json")) {
    var engineConfig = JSON.parse(fs.readFileSync("/config.json"));

    if (engineConfig.hasOwnProperty("include_paths")) {
      analysisFiles = buildFilesWithInclusions(engineConfig.include_paths);
    } else if (engineConfig.hasOwnProperty("exclude_paths")) {
      analysisFiles = buildFilesWithExclusions(engineConfig.exclude_paths);
    }
  }

  analysisFiles = filterFiles(analysisFiles);
  // Execute main loop and find fixmes in valid files
  analysisFiles.forEach(function(f, i, a){
    findFixmes(f);
  });
}
