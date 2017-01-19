const {Event, Resource} = require('../models');
const asyncMap = require('async/mapSeries');

function getAllEvents (sendToRouter) {
  Event.find({}, {resources: 0, repo: 0, cohort: 0, description: 0, __v: 0}, function (err, events) {
    if (err) return sendToRouter(err);
    sendToRouter(null, events);
  });
}

function getEvent(id, sendToRouter) {
  Event.findById(id, {}, function (err, event) {
    if (err) return sendToRouter(err);
    if (!event) return sendToRouter(new Error('Event not found')); // TODO: error handle this properly
    event = event.toObject();
    getResourcesById(event.resources, function (err, resources) {
      if (err) return sendToRouter(err);
      sendToRouter(null, Object.assign(event, {resources}));
    });
  });
}

function getResourcesById (resource_ids, cb) {
  asyncMap(resource_ids, function (resource_id, cbMap) {
    Resource.findById(resource_id, function (err, resource) {
      if (err) return cbMap(err);
      cbMap(null, resource.toObject());
    });
  }, function (err, resources) {
    if (err) return cb(err);
    cb(null, resources);
  });
}

module.exports = {
  getAllEvents, getEvent
};
