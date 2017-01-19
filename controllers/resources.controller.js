const {Resource} = require('../models');
const asyncMap = require('async/mapSeries');
const {getTagsById} = require('./tags.controller');

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

module.exports = {
  getAllResources, getResourcesById
};