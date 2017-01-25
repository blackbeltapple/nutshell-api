const express = require('express');
const {Tags} = require('../controllers');
const router = express.Router();

router.get('/', function (req, res, next) {
  Tags.getTags(function (err, tags) {
    if (err) return next(err)
    res.status(200).json(tags);
  });
});

router.post('/', function (req, res, next) {
  Tags.addTag(req.body.title, function (err, tag) {
    if (err) return next(err);
    res.status(201).json({tag});
  });
});

router.use(function (error, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(error.status || 500);
  res.send(error.message);
});

module.exports = router;
