const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let cohortSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  }
});

module.exports = mongoose.model('cohort', cohortSchema);