var fs = require('fs');
var glob = require('glob');
var path = require('path');
var readline = require('readline');
var spawn = require('child_process').spawn;

function FixMe() {}

FixMe.prototype.runEngine = function() {
  var config = {
    include_paths: ['./'],
    strings: ['FIXME', 'TODO', 'HACK', 'XXX', 'BUG']
  };

  if (fs.existsSync('/config.json')) {
    var userConfig = JSON.parse(fs.readFileSync('/config.json'));

    config.include_paths = userConfig.include_paths;

    if (userConfig.config) {
      for (var prop in userConfig.config) {
        config[prop] = userConfig.config[prop];
      }
    }
  }

  this.find(config.include_paths, config.strings);
}

FixMe.prototype.find = function(files, strings) {
  var fixmeStrings = '(' + strings.join('|') + ')';
  var args = ['--line-number', '--with-filename', '--word-regexp',
    '--only-matching', '--extended-regexp', '--recursive',
    '--binary-files=without-match', fixmeStrings];
  var grep = spawn('grep', args.concat(files));

  readline.createInterface({ input: grep.stdout }).on('line', function(line) {
    var cols = line.split(':');
    var fileName = cols[0].replace(/^\/code\//, '');
    var lineNum = parseInt(cols[1]);
    var matchedString = cols[2];

    if (matchedString !== undefined){
      var issue = JSON.stringify({
        'type': 'issue',
        'check_name': matchedString,
        'description': matchedString + ' found',
        'categories': ['Bug Risk'],
        'location':{
          'path': fileName,
          'lines': {
            'begin': lineNum,
            'end': lineNum
          }
        }
      });

      console.log(issue + '\0');
    }
  });
}

module.exports = FixMe;
