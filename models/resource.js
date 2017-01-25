const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let resourceSchema = new Schema({
  type: {
    type: String,
    enum : ['snippet', 'file', 'link'],
    required: true
  },
  tags: {
    type: [Schema.Types.ObjectId]
  },
  filename: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('resources', resourceSchema);
