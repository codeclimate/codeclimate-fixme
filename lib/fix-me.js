var readline = require('readline');
var spawn = require('child_process').spawn;

var DEFAULT_PATHS = ['./'];
var DEFAULT_STRINGS = ['BUG', 'FIXME', 'HACK', 'XXX'];
var GREP_OPTIONS = [
  '--binary-files=without-match',
  '--extended-regexp',
  '--line-number',
  '--only-matching',
  '--recursive',
  '--with-filename',
  '--word-regexp'
];

function FixMe(writable) {
  this.output = writable || process.stdout;
}

FixMe.prototype.run = function() {
  var paths, strings;
  paths = DEFAULT_PATHS;
  strings = DEFAULT_STRINGS;
  this.find(paths, strings);
};

FixMe.prototype.find = function(paths, strings, callback) {
  var pattern = `(${strings.join('|')})`;
  var grep = spawn('grep', [...GREP_OPTIONS, pattern, ...paths]);

  readline.createInterface({ input: grep.stdout }).on('line', (line) => {
    var parts = line.split(':');
    var path = parts[0].replace(/^\/code\//, '');
    var lineNumber = parseInt(parts[1], 10);
    var matchedString = parts[2];

    if (!path || !lineNumber || !matchedString) return;

    var issue = {
      'type': matchedString,
      'description': `${matchedString} found`,
      'location': {
        'line': lineNumber,
        'path': path
      }
    };
    this.output.write(JSON.stringify(issue) + '\0');
  });

  if (callback) {
    grep.stdout.on('close', _ => callback());
  }
};

module.exports = FixMe;
