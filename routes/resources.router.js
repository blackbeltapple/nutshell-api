const express = require('express');
const {Resources} = require('../controllers');

const router = express.Router();

router.get('/', function (req, res, next) {
  Resources.getAllResources(function (err, resources) {
    if (err) return next(err);
    res.status(200).json({resources});
  });
});

router.post('/', function (req, res, next) {
  var resource = req.body;
  Resources.addResource(resource, function (err, resource) {
    if (err) return next(err);
    res.status(200).json({resource});
  })
});

module.exports = router;