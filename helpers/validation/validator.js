const validUrl = require('valid-url');

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

function checkURL(str) {
  if (validUrl.isUri(str)) return true;
  return false
}

function eventsValidation (details, cb) {
  let requiredDetails = [details.title, details.event_type]
  if (details.description) requiredDetails.push(details.description);
  if (details.repo) requiredDetails.push(details.repo);
  if (details.lecturer) requiredDetails.push(details.lecturer);
  if (!details.title || !details.start_date ||!details.end_date || !details.event_type) {
    return cb(buildError(422, 'You must enter a title, start date, end date and a event type'));
  }
  if (!checkArrString(requiredDetails)) {
    return cb(buildError(422, 'Title, description, repo and lecturer must be a string'));
  }
  return true;
}

function resourcesValidation (resource, sendToRouter) {
  const {type = undefined} = resource;
  if (!type) {
    return sendToRouter(buildError(422, 'You must provide a type'));
  }
  if (!(isString(type))) {
    return sendToRouter(buildError(422, 'Type must be a string'));
  }
  if (!contains(['file', 'link', 'snippet'], type)) {
    return sendToRouter(buildError(422, 'Resource must be a file, link or snippet'));
  }
  // filename validation
  if (type === 'file' && (!resource.filename || !isString(resource.filename))){
    return sendToRouter(buildError(422, 'Filename required'));
  }
  // url validation
  if ((type === 'file' || type === 'link') && (!resource.url || !isString(resource.url))) {
    return sendToRouter(buildError(422, 'URL required'));
  }
  // snippet text validation
  if (type === 'snippet' && (!resource.text || !isString(resource.text))) {
    return sendToRouter(buildError(422, 'Snippet text required'));
  }
  return true;
}

module.exports = {
  isString,
  checkArrString,
  buildError,
  contains,
  eventsValidation,
  resourcesValidation
};
