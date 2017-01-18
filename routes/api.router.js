const express = require('express');
const {Events} = require('../controllers');

const router = express.Router();

/****************************************
  /events  - GET ALL EVENTS
*****************************************/
router.get('/events', function (req, res) {
  Events.getEvents(function (err, events) {
    if (err) res.sendStatus(500);
    res.status(200).json(events);
  });
});

module.exports = router;
