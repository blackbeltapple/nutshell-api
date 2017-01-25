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

router.delete('/:tag_id', function (req, res, next) {
  Tags.deleteTag(req.params.tag_id, function (err, resources) {
    if (err) return next(err);
    res.send({resources});
  });
});

module.exports = router;
