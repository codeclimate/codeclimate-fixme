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
      }, 10);
    });
  });
});
