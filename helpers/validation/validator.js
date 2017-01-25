function isString (str) {
  return typeof str === 'string' && str.length > 0;
}

function checkArrString (arr) {
  for (var i = 0; i < arr.length; i++) {
    if (!isString(arr[i])) {
      return false;
    }
  }
  return true
}

function buildError (status, text) {
  var newErr = new Error(text);
  newErr.status = status;
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

function eventsValidation (details) {
  let requiredDetails = [details.title, details.event_type]
  if (details.description) requiredDetails.push(details.description);
  if (details.repo) requiredDetails.push(details.repo);
  if (details.lecturer) requiredDetails.push(details.lecturer);
  return requiredDetails
}

module.exports = {
  isString,
  checkArrString,
  buildError,
  contains,
  eventsValidation
};
