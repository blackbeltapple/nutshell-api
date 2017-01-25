const {Resource, Event} = require('../models');
const asyncMap = require('async/mapSeries');
const {getTagsById} = require('./tags.controller');
const validator = require('../helpers/validation/validator.js');
const getTitle = require('../helpers/getTitle');

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
  if (validator.resourcesValidation(resource, sendToRouter)) {
    if (resource.type === 'link') {
      saveLink(resource, sendToRouter)
    } else {
      saveResource(event_id, resource, sendToRouter)
    }
  }
}

function saveLink (resource, sendToRouter) {
  return getTitle(resource.url)
    .then((title) => {
      const newResource = new Resource({
        title, url: resource.url, type: resource.type
      });
      return newResource.save()
    })
    .then((savedResource) => {
      // console.log('error handler', savedResource)
      sendToRouter(null, savedResource);
    })
    .catch((err) => {
      sendToRouter(err);
    });
}
function saveResource (event_id, resource, sendToRouter) {
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
  if (!resource.type) return sendToRouter(validator.buildError(422, 'You must provide a type'));
  var type = resource.type;
  if (!(validator.isString(type))) return sendToRouter(validator.buildError(422, 'Type must be a string'));
  if (!validator.contains(['file', 'link', 'snippet'], type)) return sendToRouter(validator.buildError(422, 'Resource must be a file, link or snippet'));
  // filename validation
  if (type === 'file'){
    if (!resource.filename || !validator.isString(resource.filename)) return sendToRouter(validator.buildError(422, 'Filename required'));
  }
  // url validation
  if (type === 'file' || type === 'link') {
    if (!resource.url || !validator.isString(resource.url)) return sendToRouter(validator.buildError(422, 'URL required'));
  }
  // snippet text validation
  if (type === 'snippet'){
    if (!resource.text || !validator.isString(resource.text)) return sendToRouter(validator.buildError(422, 'Snippet text required'));
  }
  // If all input fields are valid, look for the resource in DB
  Resource.findByIdAndUpdate(resource_id, {$set: resource}, {new: true}, function (err, modifiedResource) {
    if (err) return sendToRouter(err);
    sendToRouter(null, modifiedResource)
  });
}

function deleteResource (resourceId, sendToRouter) {
  Resource.findById(resourceId, function (err, resource) {
    if (err) {
      if (err.name === 'CastError') return sendToRouter(validator.buildError(422, 'You must enter a valid resource ID'));
      return sendToRouter(err);
    }
    if (!resource) {
      return sendToRouter(validator.buildError(422, 'You must enter a valid resource ID'));
    }
    resource.remove();
    Event.find({resources: {$in : [resourceId]}}, function (err, events) {
      if (err) return sendToRouter(err)
      deleteResourceFromEvents(resourceId, events, function (err, events) {
        if (err) return sendToRouter(err)
        sendToRouter(null, events)
      })
    })
  })
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
  getAllResources,
  getResourcesById,
  addResource,
  editResource,
  deleteResource
};
