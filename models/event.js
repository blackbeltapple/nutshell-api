const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let eventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  event_type: {
    type: String,
    required: true,
    enum: ['lecture', 'sprint', 'social', 'kata', 'weekend review' ]
  },
  resources: {
    type: [Schema.Types.ObjectId]
  },
  repo: {
    type: String
  },
  cohort: {
    type: Schema.Types.ObjectId
  },
  all_day: {
    type: Boolean,
    default: false
  },
  lecturer: {
    type: String
  }
});

module.exports = mongoose.model('event', eventSchema);
