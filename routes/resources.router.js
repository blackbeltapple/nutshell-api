const express = require('express');
const {Resources} = require('../controllers');

const router = express.Router();

router.get('/', function (req, res, next) {
  Resources.getAllResources(function (err, resources) {
    if (err) return next(err);
    res.json({resources});
  });
});

router.delete('/:resource_id', function (req, res, next) {
  Resources.deleteResource(req.params.resource_id, function (err, events) {
    if (err) return next(err);
    res.json({events})
  });
});

module.exports = router;
