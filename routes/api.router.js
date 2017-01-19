const express = require('express');
const {Events, Tags} = require('../controllers');

const router = express.Router();

/****************************************
  /events  - GET ALL EVENTS
*****************************************/
router.get('/events', function (req, res) {
  Events.getAllEvents(function (err, events) {
    if (err) res.sendStatus(500);
    res.status(200).json({events});
  });
});

router.get('/events/:id', function (req, res, next) {
  const {id} = req.params;
  if (!id) return next(new Error('Missing parameter')); // TODO: error handle this properly
  Events.getEvent(id, function (err, event) {
    if (err) return next(err);  // TODO: error handle this properly
    res.json({event});
  });
});

/*****************************************
 /tags - POST AND GET tags
*****************************************/
router.get('/tags', function (req, res, next) {
  Tags.getTags(function (err, tags) {
    if (err) return next(err)
    res.status(200).json(tags);
  });
});

router.post('/tags', Tags.addTag);

module.exports = router;
