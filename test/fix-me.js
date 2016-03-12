var expect = require('chai').expect;
var stream = require('stream');
var util = require('util');
var FixMe = require('../lib/fix-me.js');

describe("fixMe", function(){
  describe("#run(engineConfig)", function() {
    context('without engine configuration', function() {
      it('uses default strings', function(done) {
        var engine = new FixMe();

        engine.find = function(_, strings) {
          expect(strings).to.have.members(['BUG', 'FIXME', 'HACK', 'TODO', 'XXX']);
          done();
        }

        engine.run();
      });

      it('defaults to the current working directory', function(done) {
        var engine = new FixMe();

        engine.find = function(paths) {
          expect(paths).to.have.members(['./']);
          done();
        }

        engine.run();
      });
    });

    it('passes configured include paths', function(done) {
      var engine = new FixMe();
      var config = {
        include_paths: ['test/fixtures/code/src/code/test.js'],
      };

      engine.find = function(paths) {
        expect(paths).to.have.members(['test/fixtures/code/src/code/test.js'])
        done();
      }

      engine.run(config);
    });

    it('passes configured strings', function(done) {
      var engine = new FixMe();
      var engineConfig = {
        config: {
          strings: ['SUP']
        }
      };

      engine.find = function(_, strings) {
        expect(strings).to.have.members(['SUP']);
        done();
      }

      engine.run(engineConfig);
    });
  });

  describe('#find(paths, strings)', function() {
    it('returns issues for instances of the given strings in the given paths', function(done) {
      var buf = new IssueBuffer();
      var engine = new FixMe(buf);

      engine.find(['test/fixtures/file.js'], ['TODO', 'SUP'], function() {
        var issues = buf.toIssues();

        expect(issues.length).to.eq(2)

        expect(issues[0].categories).to.have.members(['Bug Risk']);
        expect(issues[0].check_name).to.eq('TODO');
        expect(issues[0].description).to.eq('TODO found');
        expect(issues[0].location.lines.begin).to.eq(1);
        expect(issues[0].location.lines.end).to.eq(1);
        expect(issues[0].location.path).to.eq('test/fixtures/file.js');
        expect(issues[0].type).to.eq('issue');

        expect(issues[1].categories).to.have.members(['Bug Risk']);
        expect(issues[1].check_name).to.eq('SUP');
        expect(issues[1].description).to.eq('SUP found');
        expect(issues[1].location.lines.begin).to.eq(6);
        expect(issues[1].location.lines.end).to.eq(6);
        expect(issues[1].location.path).to.eq('test/fixtures/file.js');
        expect(issues[1].type).to.eq('issue');

        done();
      });
    });

    it('returns relative paths by stripping /code', function(done) {
      var buf = new IssueBuffer();
      var engine = new FixMe(buf);

      engine.find(['/code/file.js'], ['TODO'], function() {
        expect(buf.toIssues()[0].location.path).to.eq('file.js');
        done();
      });
    });

    it('matches case sensitively', function(done) {
      var buf = new IssueBuffer();
      var engine = new FixMe(buf);

      // Fixture contains both BUG and bug
      engine.find(['test/fixtures/case-sensitivity.js'], ['BUG'], function() {
        var issues = buf.toIssues();

        expect(issues.length).to.eq(1);
        expect(issues[0].check_name).to.eq('BUG');

        done();
      });
    });

    it('only matches whole words', function(done) {
      var buf = new IssueBuffer();
      var engine = new FixMe(buf);

      // Fixture contains both FIXME and FIXMESOON
      engine.find(['test/fixtures/whole-words.js'], ['FIXME'], function() {
        var issues = buf.toIssues();

        expect(issues.length).to.eq(1);
        expect(issues[0].check_name).to.eq('FIXME');

        done();
      });
    });

    it('skips binary files', function(done) {
      var buf = new IssueBuffer();
      var engine = new FixMe(buf);

      // Fixture contains output from /dev/urandom
      engine.find(['test/fixtures/binary.out'], ['.*'], function() {
        expect(buf.toIssues()).to.be.empty;
        done();
      });
    });
  });
});

function IssueBuffer() {
  this._data = "";
  stream.Writable.call(this);
}

util.inherits(IssueBuffer, stream.Writable);

IssueBuffer.prototype._write = function(chunk, encoding, done) {
  this._data += chunk.toString();
  done();
};

IssueBuffer.prototype.toIssues = function() {
  if (this._data.length === 0) return [];
  return this._data.slice(0, -1).split('\0').map((json) => JSON.parse(json));
}
