const express = require('express');
const {events, resources, tags} = require('.');
const router = express.Router();

router.use('/events', events);
router.use('/resources', resources);
router.use('/tags', tags);
/****************************************
  /events  - GET ALL EVENTS & POST EVENT
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
    res.status(200).json({event});
  });
});

router.post('/events', function (req, res, next) {
  const event = req.body;
  Events.addEvent(event, function (err, event) {
    if (err) return next(err);
    res.status(200).json({event})
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

router.get('/resources', function (req, res, next) {
  Resources.getAllResources(function (err, resources) {
    if (err) return next(err);
    res.status(200).json({resources});
  });
});

/*******************************************
/resources - POST resources
/*********************************************/
router.post('/resources', function (req, res, next) {
  var resource = req.body;
  Resources.addResource(resource, function (err, resource) {
    if (err) return next(err);
    res.status(200).json({resource});
  })
})

>>>>>>> 6400c71... Rename the POST /resources/resource route to /resources

module.exports = router;
