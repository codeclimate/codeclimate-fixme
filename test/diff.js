var expect = require('chai').expect
var diff = require('../lib/diff.js')

describe('diff(ary1, ary2)', function(){
  it('should return array of unique values from ary1 that are not present in ary2', function(){
    var aryOne = ['a', 'b', 'c', 1, 2, 3, 'foo/bar.js'],
        aryTwo = ['d', 'b', 'c', 1, 2];

    var uniqValues = diff(aryOne, aryTwo);

    expect(uniqValues).to.have.same.members(['a', 3, 'foo/bar.js']);
  });
});

