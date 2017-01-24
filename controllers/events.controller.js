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
    if (!event) return sendToRouter(validator.buildError('Not Found', 'Event not found'))
    event = event.toObject();
    getResourcesById(event.resources, function (err, resources) {
      if (err) return sendToRouter(err);
      sendToRouter(null, Object.assign(event, {resources}));
    });
  });
}

function addEvent(details, sendToRouter) {
  var requiredDetails = validator.eventsValidation(details)
  if (!details.title || !details.start_date || !details.end_date || !details.event_type) {
    return sendToRouter(validator.buildError('Validation', 'You must enter a title, start date, end date and a event type'))
  }
  if (!validator.checkArrString(requiredDetails)) {
    return sendToRouter(validator.buildError('Validation', 'Title, description, repo and lecturer must be a string'))
  }
  const newEvent = new Event(details);
  newEvent.save(function (err, event) {
    if (err) return sendToRouter(err)
    sendToRouter(null, event)
  });
}

module.exports = {
  getAllEvents, getEvent, addEvent
};
