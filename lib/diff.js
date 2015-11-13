// Returns an array of unique array values not included in the other provided array
function diff(a1, a2) {
  var result = [];

  for (var i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) === -1) {
      result.push(a1[i]);
    }
  }
  return result;
}

module.exports = diff;
