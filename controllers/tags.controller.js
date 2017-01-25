const slugify = require('../helpers/slug');
const asyncMap = require('async/mapSeries');

const Tag = require('../models/tag');
const validator = require('../helpers/validation/validator');

function getTags (sendToRouter) {
  Tag.find({}, function (err, tags) {
    if (err) return sendToRouter(err);
    if (!tags) {
      const err = new Error('No tags found');
      err.status = 404;
      return sendToRouter(err);
    }
    sendToRouter(null, tags);
  });
}

function addTag (tagTitle, sendToRouter) {
  if(!tagTitle) {
    console.log('**********************HELLO************************')
    const err = new Error('Tag must have title');
    err.status = 422;
    return sendToRouter(err);
  }
  if(!validator.isString(tagTitle)) {
    const err = new Error('Title must be a string');
    err.status = 422;
    return sendToRouter(err);
  }
  Tag.findOne({slug: slugify(tagTitle)},  function (err, existingSlug) {
    if (existingSlug) {
      const err = new Error('Title is already in use');
      err.status = 422;
      return sendToRouter(err);
    }
    if (err) return sendToRouter(err);
    const newTag = new Tag({title: tagTitle, slug: slugify(tagTitle)});
    newTag.save(sendToRouter);
  });
}

function getTagsById (tag_ids, sendToRouter) {
  asyncMap(tag_ids, function (tag_id, cbMap) {
      Tag.findById(tag_id, {__v: 0}, function (err, tag) {
        if (err) return cbMap(err);
        cbMap(null, tag.toObject());
      });
    }, function (err, tags) {
      if (err) return sendToRouter(err);
      sendToRouter(null, tags);
    });
}

module.exports = {
  getTags,
  addTag,
  getTagsById
}
