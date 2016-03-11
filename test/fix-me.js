var expect = require('chai').expect,
    intercept = require("intercept-stdout"),
    fixMe = require('../lib/fix-me.js'),
    engine = new fixMe;

describe("fixMe", function(){
  describe("#runEngine()", function(){
    xit("checks for /config.json", function(){
      // expect();
    });
  });

  describe('#find(file)', function(){
    it('finds and correctly prints TODO issues', function(done){
      var capturedText = "",
          unhookIntercept = intercept(function(txt) {
            capturedText += txt;
          });

      engine.find('test/fixtures/code/src/code/test.js', ["FIXME", "TODO", "HACK", "XXX", "BUG"]);

      // to capture standard output from engine, wait.
      setTimeout(function() {
          unhookIntercept();

          expect(capturedText).to.eq('{"type":"issue","check_name":"TODO","description":"TODO found","categories":["Bug Risk"],"location":{"path":"test/fixtures/code/src/code/test.js","lines":{"begin":5,"end":5}}}\0\n');
          done();
      }, 100);
    });
  });

  describe('#formatPath(path)', function(){
    it('returns correct filename for files with /code in them', function(){
      var path = '/code/src/javascripts/code/test.js',
          formatted = engine.formatPath(path);

      expect(formatted).to.eq('src/javascripts/code/test.js');
    });
  });
});
