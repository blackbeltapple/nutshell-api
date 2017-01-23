const express = require('express');
const {Events, Resources} = require('../controllers');
const router = express.Router();

router.get('/', function (req, res) {
  Events.getAllEvents(function (err, events) {
    if (err) res.sendStatus(500);
    res.status(200).json({events});
  });
});

router.post('/', function (req, res, next) {
  const event = req.body;
  Events.addEvent(event, function (err, event) {
    if (err) return next(err);
    res.status(200).json({event})
  });
});

router.get('/:id', function (req, res, next) {
  const {id} = req.params;
  if (!id) return next(new Error('Missing parameter')); // TODO: error handle this properly
  Events.getEvent(id, function (err, event) {
    if (err) return next(err);  // TODO: error handle this properly
    res.status(200).json({event});
  });
});

router.put('/:id', function (req, res, next) {
  const event = req.body;
  Events.editEvent(req.params.id, event, function (err, event) {
    if (err) return next(err);
    res.status(200).json({event})
  });
});

router.post('/:id/resources', function (req, res, next) {
  const {id} = req.params;
  const {body} = req;
  if (!id || !body) return next(new Error('Missing parameter or body')); // TODO: error handle this properly
  Resources.addResource(id, body, function (err, event, resource) {
    if (err) return next(err);
    res.status(200).json({event, resource});
  })
});

module.exports = router;
