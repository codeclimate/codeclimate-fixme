var glob = require('glob');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var readline = require('readline');

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

  self.find(config.include_paths, config.strings);
}

FixMe.prototype.find = function(files, strings){
  var fixmeStrings = '(' + strings.join('|') + ')';
  var grep = spawn('grep', ['-nHwoEr', fixmeStrings].concat(files));
  var output = "";
  var self = this;

  readline.createInterface({ input: grep.stdout }).on('line', function(line) {
    var cols = line.split(":");
    var fileName = cols[0].replace(/^\/code\//, '');
    var lineNum = parseInt(cols[1]);
    var matchedString = cols[2];

    if (matchedString !== undefined){
      var issue = JSON.stringify({
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
      });

      console.log(issue+'\0');
    }
  });
}
