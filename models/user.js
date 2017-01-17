const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');


const userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    default: 'https://avatar3.githubusercontent.com/u/6791502?v=3&s=200'
  },
  cohort: {
    type: Schema.Types.ObjectId
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['staff', 'student'],
    default: 'student',
    required: true
  }
});

userSchema.pre('save', function (next) {
  const user = this;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('users', userSchema);
