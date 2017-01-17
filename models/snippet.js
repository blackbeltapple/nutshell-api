const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const snippetSchema = new Schema({
  text: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('snippet', snippetSchema);
