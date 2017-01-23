const express = require('express');
const {Resources} = require('../controllers');

const router = express.Router();

router.get('/', function (req, res, next) {
  Resources.getAllResources(function (err, resources) {
    if (err) return next(err);
    res.json({resources});
  });
});

router.put('/:resource_id', function (req, res, next) {
  const {body, params: {resource_id}} = req.params;
  if (!resource_id || !body) next(new Error('Missing parameter or body')); // TODO: error handle this properly
  Resources.editResource(resource_id, body, function (err, resource) {
    if (err) return next(err);
    res.json({resource});
  });
});

module.exports = router;
