const {Event} = require('../models');
const {getResourcesById} = require('./resources.controller');
const validator = require('../helpers/validation/validator');

function getAllEvents (sendToRouter) {
  Event.find({}, {resources: 0, repo: 0, cohort: 0, description: 0, __v: 0}, function (err, events) {
    if (err) return sendToRouter(err);
    sendToRouter(null, events);
  });
}

function getEvent(id, sendToRouter) {
  Event.findById(id, {__v: 0}, function (err, event) {
    if (err) return sendToRouter(err);
    if (!event) return sendToRouter(new Error('Event not found')); // TODO: error handle this properly
    event = event.toObject();
    getResourcesById(event.resources, function (err, resources) {
      if (err) return sendToRouter(err);
      sendToRouter(null, Object.assign(event, {resources}));
    });
  });
}

function addEvent(details, cb) {
  var requiredDetails = validator.eventsValidation(details)
  if (!details.title || !details.start_date || !details.end_date || !details.event_type) {
    let err = new Error('You must enter a title, start date, end date and a event type');
    err.name = 'Validation';
    return cb(err);
  }
  if (!validator.checkArrString(requiredDetails)) {
    let err = new Error('Title, description, repo and lecturer must be a string');
    err.name = 'Validation';
    return cb(err);
  }
  const newEvent = new Event(details);
  newEvent.save(function (err, event) {
    if (err) return cb(err)
    cb(null, event)
  });
}

module.exports = {
  getAllEvents, getEvent, addEvent
};
