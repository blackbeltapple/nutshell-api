const express = require('express');
const {Resources} = require('../controllers');

const router = express.Router();

router.get('/', function (req, res, next) {
  Resources.getAllResources(function (err, resources) {
    if (err) return next(err);
    res.json({resources});
  });
});

module.exports = router;
