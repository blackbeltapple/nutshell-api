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
    if (!event) return sendToRouter(validator.buildError(404, 'Event not found')); // TODO: error handle this properly
    event = event.toObject();
    getResourcesById(event.resources, function (err, resources) {
      if (err) return sendToRouter(err);
      sendToRouter(null, Object.assign(event, {resources}));
    });
  });
}

function addEvent(details, sendToRouter) {
  let requiredDetails = validator.eventsValidation(details)
  if (!details.title || !details.start_date ||!details.end_date || !details.event_type) {
    return sendToRouter(validator.buildError(422, 'You must enter a title, start date, end date and a event type'));
  }
  if (!validator.checkArrString(requiredDetails)) {
    return sendToRouter(validator.buildError(422, 'Title, description, repo and lecturer must be a string'));
  }
  const newEvent = new Event(details);
  newEvent.save(function (err, event) {
    if (err) return sendToRouter(err);
    if (event.event_type === 'sprint' || event.event_type === 'weekend review') {
      event.all_day = true;
    }
    if (err) return sendToRouter(err)
    sendToRouter(null, event)
  });
}

function editEvent(event_id, event, sendToRouter) {
  let requiredDetails = validator.eventsValidation(event)
  if (!event.title || !event.start_date ||!event.end_date || !event.event_type) {
    return sendToRouter(validator.buildError(422, 'You must enter a title, start date, end date and a event type'));
  }
  if (!validator.checkArrString(requiredDetails)) {
    return sendToRouter(validator.buildError(422, 'Title, description, repo and lecturer must be a string'));
  }
  Event.findByIdAndUpdate(event_id, {$set: event}, {new: true}, function (err, event) {
    if (err) return sendToRouter(err);
    if (!event) return sendToRouter(validator.buildError(404, 'Event not found'));
    sendToRouter(null, event.toObject());
  });
}

module.exports = {
  getAllEvents, getEvent, addEvent, editEvent
};
