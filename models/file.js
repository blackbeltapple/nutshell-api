const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('file', fileSchema);
