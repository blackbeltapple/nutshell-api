const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let resourceSchema = new Schema({
  type: {
    type: String,
    enum : ['snippet', 'file', 'link'],
    required: true
  },
  resource_id :{
    type: Schema.Types.ObjectId
  },
  tags: {
    type: [Schema.Types.ObjectId]
  }
});

module.exports = mongoose.model('resources', resourceSchema);
