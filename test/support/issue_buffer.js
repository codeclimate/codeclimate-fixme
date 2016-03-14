var stream = require('stream');
var util = require('util');

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
  if (this._data.length === 0) {
    return [];
  }

  return this._data.slice(0, -1).split('\0').map((json) => JSON.parse(json));
};

module.exports = IssueBuffer;
