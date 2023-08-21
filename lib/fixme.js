const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');

const DEFAULT_PATHS = ['./'];
const DEFAULT_STRINGS = ['BUG', 'FIXME', 'HACK', 'TODO', 'XXX'];
const GREP_OPTIONS = [
  '--binary-files=without-match',
  '--extended-regexp',
  '--line-number',
  '--only-matching',
  '--recursive',
  '--with-filename',
  '--word-regexp',
];

class FixMe {
  constructor(writable) {
    this.output = writable || process.stdout;
    this.maxPathLength = 4;  // initial length of "Path"
    this.maxLineLength = 4;  // initial length of "Line"
    this.maxTypeLength = 4;  // initial length of "Type"
    this.issues = [];
  }

  run(engineConfig) {
    const outputPathType = process.argv.includes('--json')
      ? 'json'
      : process.argv.includes('--table')
      ? 'table'
      : 'default';

    if (outputPathType === 'default' || process.argv.includes('--help')) {
      console.log('Usage: fixme [OPTIONS] [PATH]\n\nOptions:\n --json\tOutput results in JSON format.\n --table\tOutput results in table format.\n --help\tShow help.');
      return;
    }

    let paths = DEFAULT_PATHS;
    if (engineConfig && engineConfig.include_paths) {
      paths = engineConfig.include_paths;
    } else if (process.argv.length > 3) {
      paths = process.argv.slice(3);
    }

    const strings = (engineConfig && engineConfig.config && engineConfig.config.strings) || DEFAULT_STRINGS;

    this.find(paths, strings, outputPathType);
  }

  find(paths, strings, outputPathType, callback) {
    const pattern = `(${strings.join('|')})`;
    const grep = spawn('grep', [...GREP_OPTIONS, pattern, ...paths]);

    readline.createInterface({ input: grep.stdout }).on('line', (line) => {
      const [fullPath, lineStr, matchedString] = line.split(':');
      const path = fullPath.replace(/^\/code\//, '');
      const lineNumber = parseInt(lineStr, 10);

      if (!path || !lineNumber || !matchedString) {
        process.stderr.write(`Ignoring malformed output: ${line}\n`);
        return;
      }

      // Update the maximum widths for each column for better formatting
      this.maxPathLength = Math.max(this.maxPathLength, path.length);
      this.maxLineLength = Math.max(this.maxLineLength, `${lineNumber}`.length);
      this.maxTypeLength = Math.max(this.maxTypeLength, matchedString.length);

      const issue = {
        'categories': ['Bug Risk'],
        'check_name': matchedString,
        'description': `${matchedString} found`,
        'file_path': path,
        'start_line': lineNumber,
        'type': 'issue',
      };

      this.issues.push(issue);
    });

    grep.stdout.on('close', () => {
      if (outputPathType === 'json') {
          this.output.write(JSON.stringify(this.issues));
      } else if (outputPathType === 'table') {
          // Now that we've gathered all issues, print headers with appropriate padding
          console.log(`| ${'Path'.padEnd(this.maxPathLength, ' ')} | ${'Line'.padEnd(this.maxLineLength, ' ')} | ${'Type'.padEnd(this.maxTypeLength, ' ')} |`);
          console.log(`| ${'-'.repeat(this.maxPathLength)} | ${'-'.repeat(this.maxLineLength)} | ${'-'.repeat(this.maxTypeLength)} |`);

          for (const issue of this.issues) {
              console.log(`| ${issue.location.path.padEnd(this.maxPathLength, ' ')} | ${issue.location.lines.begin.toString().padEnd(this.maxLineLength, ' ')} | ${issue.check_name.padEnd(this.maxTypeLength, ' ')} |`);
          }
      }
      if (callback) callback();
    });
  }
}

module.exports = FixMe;
