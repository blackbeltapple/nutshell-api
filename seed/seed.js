if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev';

const async = require('async');
const models = require('../models');
const mongoose = require('mongoose');

const credentials = require('../credentials');
const eventData = require('./data/event.data');
const tagData = require('./data/tag.data');
const cohortData = require('./data/cohorts.data');
const resourceData = require('./data/resource.data');

const DB = credentials.DB[process.env.NODE_ENV];

mongoose.connect(DB, function (err) {
  if (err) {
    console.log(`Error connecting to database ${DB}: ${err}`); // eslint-disable-line no-console
  } else {
    console.log(`Connected to database ${DB}`); // eslint-disable-line no-console
    mongoose.connection.db.dropDatabase();
    async.waterfall([
      saveStudent,
      saveStaff,
      addTags,
      addResources,
      addCohorts,
      addEvents
    ], (err) => {
      if (err) {
        console.log(err); //eslint-disable-line no-console
        process.exit();
      }
        console.log('Data seeded successfully'); //eslint-disable-line no-console
        process.exit();
    })
  }
})

const student = new models.User({
  username: 'northcoder',
  name: 'Awesome Northcoder',
  avatar_url: 'https://avatars3.githubusercontent.com/u/6791502?v=3&s=200',
  password: 'manda',
  role: 'student'
});

const staff = new models.User({
  username: 'Mauro username',
  name: 'Mauro name',
  avatar_url: 'https://avatars3.githubusercontent.com/u/6791502?v=3&s=200',
  password: 'mauropassword',
  role: 'staff'
})

function saveStudent (cb) {
  student.save(err => {
    if (err) cb(err);
    else cb(null);
  });

}
function saveStaff (cb) {
  staff.save(err => {
    if (err) cb(err);
    else cb(null);
  });
}

function addTags (done) {
  async.map(tagData, function (tag, cb) {
    var tagDoc = new models.Tag(tag);
    tagDoc.save(function (err, data) {
      if (err) return cb(err)
      return cb(null, data)
    })
  }, function (err, tags) {
    if (err) return done(err);
    console.log('Tags saved successfully'); // eslint-disable-line no-console
    return done(null, tags)
  })
}

function addResources (theTags, done) {
  const resources = resourceData.map(r => Object.assign(r, {
    tags: [theTags[1]._id, theTags[3]._id]
  }));
  async.map(resources, function (resource, cb) {
    var resourceDoc = new models.Resource(resource);
    resourceDoc.save(function (err, data) {
      if (err) return cb(err);
      return cb(null, data)
    })
  }, function (err, resources) {
    if (err) return done(err);
    console.log('Resources saved successfully'); // eslint-disable-line no-console
    return done(null, resources)
  })
}

function addCohorts (resources, done) {
  async.map(cohortData, function (cohort, cb) {
    var cohortDoc = new models.Cohort({
      name: cohort.name,
      start_date: cohort.start_date,
      end_date: cohort.end_date
    })
    cohortDoc.save(function (err, data) {
      if (err) return cb(err)
      cb(null, data)
    })
  }, function (err, cohort) {
    if (err) return done(err)
    console.log('Cohort saved successfully'); // eslint-disable-line no-console
    return done(null, {resources, cohort})
  })
}

function addEvents (eventResources, done) {
  async.map(eventData, function (event, cb) {
    var eventDoc = new models.Event({
      title: event.title,
      start_date: event.start_date,
      end_date: event.end_date,
      event_type: event.event_type,
      description: event.description,
      resources: [eventResources.resources[3]._id, eventResources.resources[2]._id],
      repo: event.repo,
      all_day: event.all_day,
      cohort: eventResources.cohort[0]._id
    })
    eventDoc.save(function (err, data) {
      if (err) return cb(err)
      cb(null, data)
    })
  }, function (err, events) {
    if (err) return done(err);
    console.log('Events saved successfully'); // eslint-disable-line no-console
    return done(null, events)
  })
}
