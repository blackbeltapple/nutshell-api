const slugify = require('../helpers/slug');
const asyncMap = require('async/mapSeries');

const {Tag, Resource} = require('../models');
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
    return sendToRouter(validator.buildError(422, 'Tag must have title'));
  }
  if(!validator.isString(tagTitle)) {
    return sendToRouter(validator.buildError(422, 'Title must be a string'));
  }
  Tag.findOne({slug: slugify(tagTitle)},  function (err, existingSlug) {
    if (err) return sendToRouter(err);
    if (existingSlug) {
      return sendToRouter(validator.buildError(422, 'Title is already in use'));
    }
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

function deleteTag (tagId, sendToRouter) {
  Tag.findById(tagId, function (err, tag) {
    if (err) {
      if (err.name === 'CastError') return sendToRouter(validator.buildError(422, 'You must enter a valid tag ID'));
      return sendToRouter(err);
    }
    if (!tag) {
      return sendToRouter(validator.buildError(422, 'You must enter a valid tag ID'));
    }
    tag.remove();
    Resource.find({tags: {$in: [tagId]}}, function (err, resources) {
      if (err) return sendToRouter(err);
      if (!resources) return sendToRouter(null, []);
      deleteTagsFromResources(tagId, resources, function (err, resources) {
          if (err) return sendToRouter(err);
          sendToRouter(null, resources)
      });
    });
  });
}

function deleteTagsFromResources(tagId, resources, cb) {
 asyncMap(resources, function (resource, cbMap) {
   Resource.findOneAndUpdate({tags: {$in: [tagId]}}, {$pull: {tags: {$in:[tagId]}}}, {'new': true}, function (err, resource) {
     if (err) return cbMap(err)
     cbMap(null, resource)
   });
 }, function (err, resources) {
   if (err) return cb(err)
   cb(null, resources)
 });
}

module.exports = {
  getTags,
  addTag,
  getTagsById,
  deleteTag
}
