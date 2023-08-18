/* global define, it, describe, context */

const expect = require('chai').expect;
const FixMe = require('../lib/fixme.js');
const IssueBuffer = require('./support/issue_buffer.js');

describe("fixMe", function(){
  describe("#run(engineConfig)", function() {
    context('without engine configuration', function() {
      it('uses default strings', function(done) {
        const engine = new FixMe();

        engine.find = function(_, strings) {
          expect(strings).to.have.members(['BUG', 'FIXME', 'HACK', 'TODO', 'XXX']);
          done();
        };

        engine.run({ include_paths: ['./'] });
      });

      it('defaults to the current working directory', function(done) {
        const engine = new FixMe();

        engine.find = function(paths) {
          expect(paths).to.have.members(['./']);
          done();
        };

        engine.run({ include_paths: ['./'] });
      });
    });

    it('passes configured include paths', function(done) {
      const engine = new FixMe();
      const config = {
        include_paths: ['test/fixtures/code/src/code/test.js'],
      };

      engine.find = function(paths) {
        expect(paths).to.have.members(['test/fixtures/code/src/code/test.js']);
        done();
      };

      engine.run(config);
    });

    it('passes configured strings', function(done) {
      const engine = new FixMe();
      const engineConfig = {
        config: {
          strings: ['SUP']
        }
      };

      engine.find = function(_, strings) {
        expect(strings).to.have.members(['SUP']);
        done();
      };

      engine.run(engineConfig);
    });

    it('ignores .codeclimate.yml, except for comments', function(done) {
      const buf = new IssueBuffer();
      const engine = new FixMe(buf);
      // Assuming your method and the callback structure:
      engine.find(['test/fixtures/'], ['URGENT'], function(issues) {
        const issue_paths = issues.map(issue => issue.location.path);
        const cc_config_issue = issues.find(issue => issue.location.path === 'test/fixtures/.codeclimate.yml');
        
        expect(cc_config_issue).to.exist;
        expect(issues.length).to.eq(2);
        expect(issue_paths).to.have.members(['test/fixtures/.codeclimate.yml', 'test/fixtures/urgent.js']);
        done();
      });
    });
  });

  describe('#find(paths, strings)', function() {
    it('returns issues for instances of the given strings in the given paths', function(done) {
      const buf = new IssueBuffer();
      const engine = new FixMe(buf);

      engine.find(['test/fixtures/file.js'], ['TODO', 'SUP'], function(issues) {
        expect(issues).to.have.lengthOf(2);
        // Add more assertions if needed
        done();
      });
    });

    it('matches case sensitively', function(done) {
      const buf = new IssueBuffer();
      const engine = new FixMe(buf);

      engine.find(['test/fixtures/case-sensitivity.js'], ['BUG'], function(issues) {
        const bugIssues = issues.filter(issue => issue.check_name === 'BUG');
        
        expect(bugIssues).to.have.lengthOf(1);
        done();
      });
    });

    it('only matches whole words', function(done) {
      const buf = new IssueBuffer();
      const engine = new FixMe(buf);

      engine.find(['test/fixtures/whole-words.js'], ['FIXME'], function(issues) {
        const fixmeIssues = issues.filter(issue => issue.check_name === 'FIXME');
        
        expect(fixmeIssues).to.have.lengthOf(1);
        done();
      });
    });

    it('skips binary files', function(done) {
      const buf = new IssueBuffer();
      const engine = new FixMe(buf);

      engine.find(['test/fixtures/binary.out'], ['.*'], function(issues) {
        expect(issues).to.be.empty;
        done();
      });
    });
  });
});
