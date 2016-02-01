var glob = require('glob'),
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    diff = require('./diff'),
    fileBuilder = require('./file-builder');

module.exports = FixMe;

function FixMe() { }

FixMe.prototype.runEngine = function(){
  var analysisFiles = [],
      config = {
        include_paths: ["./"],
        strings: ["FIXME", "TODO", "HACK", "XXX", "BUG"]
      },
      self = this;

  if (fs.existsSync('/config.json')) {
    var userConfig = JSON.parse(fs.readFileSync('/config.json'));

    config.include_paths = userConfig.include_paths;

    if (userConfig.config) {
      for (var prop in userConfig.config) {
        config[prop] = userConfig.config[prop];
      }
    }
  }

  analysisFiles = fileBuilder.withIncludes(config.include_paths);
  analysisFiles = fileBuilder.filterFiles(analysisFiles);

  analysisFiles.forEach(function(f, i, a){
    self.find(f, config.strings);
  });
}

FixMe.prototype.find = function(file, strings){
  var fixmeStrings = "'(" + strings.join("|") + ")'",
      self = this;

  // Prepare the grep string for execution (uses BusyBox grep)
  var grepString = ["grep -nHwoE", fixmeStrings, '"' + file + '"'].join(" ");


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
            self.printIssue(fileName, parseInt(lineNum), matchedString);
          }
        }
      })
    }
  })
}

FixMe.prototype.printIssue = function(fileName, lineNum, matchedString) {
// Prints properly structured Issue data to STDOUT according to Code Climate Engine specification.
  var issue = {
    "type": "issue",
    "check_name": matchedString,
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

  var issueString = JSON.stringify(issue)+"\0";
  console.log(issueString);
}
