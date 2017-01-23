const {Resource, Event} = require('../models');
const asyncMap = require('async/mapSeries');
const {getTagsById} = require('./tags.controller');
const validator = require('../helpers/validation/validator.js');

function getAllResources (sendToRouter) {
  Resource.find({}, {_id: 1}, function (err, resource_ids) {
    if (err) return sendToRouter(err);
    getResourcesById(resource_ids.map(o => o._id), function (err, resources) {
      if (err) return sendToRouter(err);
      sendToRouter(null, resources);
    });
  });
}

function getResourcesById (resource_ids, cb) {
  asyncMap(resource_ids, function (resource_id, cbMap) {
    Resource.findById(resource_id, {__v: 0}, function (err, resource) {
      if (err) return cbMap(err);
      getTagsById(resource.tags, function (err, tags) {
        if (err) return cb(err);
        cbMap(null, Object.assign(resource.toObject(), {tags}))
      } )
    });
  }, function (err, resources) {
    if (err) return cb(err);
    cb(null, resources);
  });
}

function addResource (event_id, resource, sendToRouter) {
  // Validation rules depend heavily on the 'type' of resource - file/snippet/link
  // type validation
  const {type} = resource;
  if (!type) {
    return sendToRouter(validator.buildError('Validation', 'You must provide a type'));
  }
  if (!(validator.isString(type))) {
    return sendToRouter(validator.buildError('Validation', 'Type must be a string'));
  }
  if (!validator.contains(['file', 'link', 'snippet'], type)) {
    return sendToRouter(validator.buildError('Validation', 'Resource must be a file, link or snippet'));
  }
  // filename validation
  if (type === 'file' && (!resource.filename || !validator.isString(resource.filename))){
    return sendToRouter(validator.buildError('Validation', 'Filename required'));
  }
  // url validation
  if ((type === 'file' || type === 'link') && (!resource.url || !validator.isString(resource.url))) {
    return sendToRouter(validator.buildError('Validation', 'URL required'));
  }
  // snippet text validation
  if (type === 'snippet' && (!resource.text || !validator.isString(resource.text))) {
    return sendToRouter(validator.buildError('Validation', 'Snippet text required'));
  }
  const newResource = new Resource(resource);
  newResource.save(function(err, resource){
    if (err) return sendToRouter(err);
    // Add this new resource oid to the event 'resources' array
    Event.findByIdAndUpdate(event_id, 
      {$addToSet: {resources: resource._id }}, 
      {new: true}, 
      function (err, event) {
        if (err) return sendToRouter(err);
        // Mongoose always creates an empty array in resources field, so no need to check that the .resources attrib exists
        sendToRouter(null, event, resource)
      }
    );
  });
}

function editResource (resource_id, resource, sendToRouter) {
  // TODO refactor this validation to re-use addResource validation
  // type validation
  if (!resource.type) return sendToRouter(validator.buildError('Validation', 'You must provide a type'));
  var type = resource.type;
  if (!(validator.isString(type))) return sendToRouter(validator.buildError('Validation', 'Type must be a string'));
  if (!validator.contains(['file', 'link', 'snippet'], type)) return sendToRouter(validator.buildError('Validation', 'Resource must be a file, link or snippet'));
  // filename validation
  if (type === 'file'){
    if (!resource.filename || !validator.isString(resource.filename)) return sendToRouter(validator.buildError('Validation', 'Filename required'));
  }
  // url validation
  if (type === 'file' || type === 'link') {
    if (!resource.url || !validator.isString(resource.url)) return sendToRouter(validator.buildError('Validation', 'URL required'));
  }
  // snippet text validation
  if (type === 'snippet'){
    if (!resource.text || !validator.isString(resource.text)) return sendToRouter(validator.buildError('Validation', 'Snippet text required'));
  }

  // If all input fields are valid, look for the resource in DB
  Resource.findByIdAndUpdate(resource_id, {$set: resource}, {new: true}, function (err, modifiedResource) {
    if (err) return sendToRouter(err);
    sendToRouter(null, modifiedResource)
  });
}

module.exports = {
  getAllResources, getResourcesById, addResource, editResource
};
