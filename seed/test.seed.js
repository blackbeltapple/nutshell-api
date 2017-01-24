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

const tag =  {
  title: 'Redux',
  slug: 'redux',
  category: 'Topic'
}

const tag2 = {
  title: 'Lowbar',
  slug: 'lowbar',
  category: 'Topic'
}

var tagArr = [tag, tag2]

function saveTag (user, waterfallCallback) {
  models.Tag.insertMany(tagArr, function (err, tags) {
    if (err) return waterfallCallback(err)
    waterfallCallback(null, user, tags)
  });
}

function saveResource (user, tag, waterfallCallback) {
  const resource1 = {
    type: 'snippet',
    text: 'Lorem ipsum',
    tags: [tag[0]._id, tag[1]._id],
    url: 'http://www.bbc.co.uk',
    description: 'Excellent snippet',
    filename: 'file.jpg'
  }

  const resource2 = {
    type: 'snippet',
    text: 'Lorem ipsum',
    tags: [tag[0]._id, tag[1]._id],
    url: 'http://www.bbc.co.uk',
    description: 'Excellent snippet',
    filename: 'file.jpg'
  }
  var resourceArr = [resource1, resource2]
  models.Resource.insertMany(resourceArr, function (err, resources) {
    if (err) return waterfallCallback(err);
    waterfallCallback(null, {user, tag, resources});
  });
}

function saveEvent (obj, waterfallCallback) {
  const event = new models.Event({
    title: 'Redux',
    start_date: ('October 27, 2016, 09:30:00'),
    end_date: ('October 27, 2016 10:30:00'),
    description: 'Lecture on Redux',
    event_type: 'lecture',
    resources: [obj.resources[0]._id, obj.resources[1]._id],
    repo: 'https://github.com/northcoders/student-portal-api',
    lecturer: 'Chris Hill',
    all_day: false
  });
  event.save(function (err, event) {
    if (err) waterfallCallback(err)
    else waterfallCallback(null, user, event)
  });
}

function saveTestData (done) {
  async.waterfall([
    saveUser,
    saveTag,
    saveResource,
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
