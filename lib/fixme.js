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
      : process.argv.includes('--sarif')
      ? 'sarif'
      : 'default';

    if (outputPathType === 'default' || process.argv.includes('--help')) {
      console.log('Usage: fixme [OPTIONS] [PATH]\n\nOptions:\n --json\tOutput results in JSON format.\n --table\tOutput results in table format.\n --sarif\tOutput results in SARIF format.\n --help\tShow help.');
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
        // Print table format here...
      } else if (outputPathType === 'sarif') {
        this.outputSARIF();
      }
      if (callback) callback();
    });
  }

  outputSARIF() {
    const sarifResults = this.issues.map(issue => ({
      ruleId: issue.check_name,
      message: {
        text: issue.description,
      },
      locations: [{
        physicalLocation: {
          artifactLocation: {
            uri: issue.file_path,
          },
          region: {
            startLine: issue.start_line,
          },
        },
      }],
    }));

    const sarifOutput = {
      $schema: "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json",
      version: "2.1.0",
      runs: [{
        tool: {
          driver: {
            name: "fixMe",
            rules: this.issues.map(issue => ({
              id: issue.check_name,
              name: issue.check_name,
              shortDescription: {
                text: issue.description,
              },
            })),
          },
        },
        results: sarifResults,
      }],
    };

    this.output.write(JSON.stringify(sarifOutput));
  }
}

module.exports = FixMe;
