const async = require('async');
const models = require('../models');

const user = new models.User({
  username: 'northcoder',
  name: 'Awesome Northcoder',
  avatar_url: 'https://avatars3.githubusercontent.com/u/6791502?v=3&s=200',
  password: 'manda'
});

function saveUser (waterfallCallback) {
  user.save(function (err, user) {
    if (err) return waterfallCallback(err);
    waterfallCallback(null, user);
  });
}

const event = new models.Event({
  title: 'Redux',
  start_date: ('October 27, 2016, 09:30:00'),
  end_date: ('October 27, 2016 10:30:00'),
  description: 'Lecture on Redux',
  event_type: 'lecture',
  repo: 'https://github.com/northcoders/student-portal-api',
  lecturer: 'Chris Hill',
  all_day: false
});

function saveEvent (user, waterfallCallback) {
  event.save(function (err, event) {
    if (err) waterfallCallback(err)
    else waterfallCallback(null, {user, event})
  });
}

function saveTestData (done) {
  async.waterfall([
    saveUser,
    saveEvent
  ], (err, data) => {
    if (err) console.log(err); // eslint-disable-line no-console
    else {
      console.log('Test data seeded successfully.'); // eslint-disable-line no-console
      done(data);
    }
  });
}

module.exports = saveTestData;
