const assert = require('assert');
const FixMe = require('../lib/fixme');
const { Writable } = require('stream');

describe('fixMe', function() {
    describe('Parsing and Outputting Issues', function() {

        let capturedOutput = '';
        const fakeStream = new Writable({
            write(chunk, encoding, callback) {
                capturedOutput += chunk.toString();
                callback();
            }
        });

        beforeEach(() => {
            capturedOutput = ''; // Reset captured output before each test
        });

        it('can parse code and find issues', function(done) {
            const engine = new FixMe(fakeStream);
            
            engine.find(['./test/fixtures/file.js'], ['TODO'], 'json', function() {
                const issues = JSON.parse(capturedOutput);
                assert.strictEqual(issues.length, 1);
                done();
            });
        });

        it('can properly output results in JSON', function(done) {
            const engine = new FixMe(fakeStream);
            
            engine.find(['./test/fixtures/file.js'], ['TODO'], 'json', function() {
                const issues = JSON.parse(capturedOutput);
                assert.strictEqual(issues[0].check_name, 'TODO');
                assert.strictEqual(issues[0].file_path, './test/fixtures/file.js');
                done();
            });
        });

        it('can properly output results in sarif', function(done) {
            const engine = new FixMe(fakeStream);

            engine.find(['./test/fixtures/file.js'], ['TODO'], 'sarif', function() {
                const sarifOutput = JSON.parse(capturedOutput);
                
                assert.strictEqual(sarifOutput.$schema, "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json");
                assert.strictEqual(sarifOutput.version, "2.1.0");
                assert.strictEqual(sarifOutput.runs[0].results[0].ruleId, 'TODO');
                assert.strictEqual(sarifOutput.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri, './test/fixtures/file.js');
                done();
            });
        });

        it('matches case sensitively', function(done) {
          const engine = new FixMe(fakeStream);
      
          engine.find(['./test/fixtures/case-sensitivity.js'], ['TODO', 'SUP'], 'json', function() {
              const issues = JSON.parse(capturedOutput);
              const matchedIssues = issues.filter(issue => issue.check_name === 'todo');
              assert.strictEqual(matchedIssues.length, 0);
              done();
          });
      });
      
      it('only matches whole words', function(done) {
          const engine = new FixMe(fakeStream);
      
          engine.find(['./test/fixtures/whole-words.js'], ['FIXME'], 'json', function() {
              const issues = JSON.parse(capturedOutput);
              const matchedIssues = issues.filter(issue => issue.check_name === 'TODOO');
              assert.strictEqual(matchedIssues.length, 0);
              done();
          });
      });
    });
});
