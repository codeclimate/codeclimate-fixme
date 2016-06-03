var readline = require('readline');
var spawn = require('child_process').spawn;

var DEFAULT_PATHS = ['./'];
var DEFAULT_STRINGS = ['BUG', 'FIXME', 'HACK', 'TODO', 'XXX'];
var GREP_OPTIONS = [
  '--binary-files=without-match',
  '--extended-regexp',
  '--line-number',
  '--only-matching',
  '--recursive',
  '--with-filename',
  '--word-regexp',
];

function FixMe(writable) {
  this.output = writable || process.stdout;
}

FixMe.prototype.run = function(engineConfig) {
  var paths, strings;

  if (engineConfig && engineConfig.include_paths) {
    paths = engineConfig.include_paths;
  } else if (engineConfig && engineConfig.config && engineConfig.config.include_paths) {
    paths = engineConfig.config.include_paths;
  } else {
    paths = DEFAULT_PATHS;
  }

  if (engineConfig && engineConfig.config && engineConfig.config.strings) {
    strings = engineConfig.config.strings;
  } else {
    strings = DEFAULT_STRINGS;
  }

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
    var issue = {
      'categories': ['Bug Risk'],
      'check_name': matchedString,
      'description': `${matchedString} found`,
      'location': {
        'lines': {
          'begin': lineNumber,
          'end': lineNumber,
        },
        'path': path,
      },
      'type': 'issue',
    };

    this.output.write(JSON.stringify(issue) + '\0');
  });

  if (callback) {
    grep.stdout.on('close', _ => callback());
  }
};

module.exports = FixMe;
