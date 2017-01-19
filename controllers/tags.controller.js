const slugify = require('../helpers/slug');

const Tag = require('../models/tag');
const validator = require('../helpers/validation/validator');

function getTags (cb) {
  Tag.find({}, function (err, tags) {
    if (err) return cb(err)
    cb(null, tags)
  });
}

function addTag (req, res, next) {
  var tagTitle = req.body.title
  if(!validator.isString(tagTitle)) {
    res.status(422).send('Title must be a string');
  }
  Tag.findOne({slug: slugify(tagTitle)},  function (err, existingSlug) {
    if (existingSlug) {
      return res.status(422).send({error: 'Title is already in use'})
    }
    if (err)  {
      return res.send(err);
    }
    const newTag = new Tag({title: tagTitle, slug: slugify(tagTitle)});
    newTag.save(function (err, tag) {
      if (err) {
        next(err)
      }
      res.json({tag})
    });
  })
}

module.exports = {
  getTags,
  addTag
}
