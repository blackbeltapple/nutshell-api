const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    lowercase: true,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Type', 'Topic'],
    default: 'Topic'
  }
});

module.exports = mongoose.model('tags', tagSchema);
