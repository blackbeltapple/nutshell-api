const async = require('async');
const models = require('../models/models');

const user = new models.User({
  username: 'northcoder',
  name: 'Awesome Northcoder',
  avatar_url: 'https://avatars3.githubusercontent.com/u/6791502?v=3&s=200',
  password: 'manda'
});

function saveUser (cb) {
  user.save(cb)
}

function saveTestData (cb) {
  async.waterfall([saveUser], (err, ids) => {
    if (err) console.log(err); // eslint-disable-line no-console
    else {
      console.log('Test data seeded successfully.'); // eslint-disable-line no-console
      cb(ids);
    }
  });
}

module.exports = saveTestData;
