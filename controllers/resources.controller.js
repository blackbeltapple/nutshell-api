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

function addResource (resource, cb) {
  // 'type' validation
  if (!resource.type) return cb(validator.buildError('Validation', 'You must provide a type'));
  var type = resource.type;
  if (!(validator.isString(type))) return cb(validator.buildError('Validation', 'Type must be a string'));
  if (!validator.contains(['file', 'link', 'snippet'], type)) return cb(validator.buildError('Validation', 'Resource must be a file, link or snippet'));
  // filename validation
  if (type === 'file'){
    if (!resource.filename || !validator.isString(resource.filename)) return cb(validator.buildError('Validation', 'Filename required'));
  }
  // url validation
  if (type === 'file' || type === 'link') {
    if (!resource.url || !validator.isString(resource.url)) return cb(validator.buildError('Validation', 'URL required'));
  }
  // snippet text validation
  if (type === 'snippet'){
    if (!resource.text || !validator.isString(resource.text)) return cb(validator.buildError('Validation', 'Snippet text required'));
  }

  const newResource = new Resource(resource);
  newResource.save(function(err, resource){
    if (err) return cb(err);
    cb(null, resource);
  })
}

function deleteResource (resourceId, cb) {
  if (!resourceId) return cb(validator.buildError('Validation', 'You must send a valid resource ID'))
  Resource.findById({_id: resourceId}, function (err) {
    if (err) return cb(err);
    Event.find({resources: {$in : [resourceId]}}, function (err, events) {
      if (err) return cb(err)
      deleteResourceFromEvents(resourceId, events, function (err, events) {
        if (err) return cb(err)
        cb(null, events)
      })
    })
  }).remove().exec();
}

function deleteResourceFromEvents (resourceId, events, cb) {
  asyncMap(events, function (event, cbMap) {
    Event.findOneAndUpdate({resources: {$in: [resourceId]}}, {$pull: {resources: {$in:[resourceId]}}}, {new: true}, function (err, event) {
      if (err) return cbMap(err)
      cbMap(null, event)
    })
  }, function (err, events) {
    if (err) return cb(err)
    cb(null, events)
  })
}

module.exports = {
  getAllResources, getResourcesById, addResource, deleteResource
};
