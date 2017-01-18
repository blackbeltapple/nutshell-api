const Event = require('../models/event');

function getEvents (cb) {
  Event.find({}, function (err, events) {
    if (err) return cb(err);
    cb(null, events);
  });
}

module.exports = {
  getEvents
};
