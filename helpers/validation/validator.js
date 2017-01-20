function isString (str) {
  return typeof str === 'string' && str.length > 0;
}

function buildError (title, text) {
  var newErr = new Error(text);
  newErr.name = title;
  return newErr;
}

function contains (arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      return true;
    }
  }
  return false;
}

module.exports = {
  isString,
  buildError,
  contains
};
