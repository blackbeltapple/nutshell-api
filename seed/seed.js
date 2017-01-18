if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev';

const async = require('async');
const models = require('../models');
const mongoose = require('mongoose');

const credentials = require('../credentials');
const eventsData = require('./data/event.data');
const fileData = require('./data/file.data');
const linkData = require('./data/link.data');
const snippetData = require('./data/snippet.data');
const tagData = require('./data/tag.data');

const DB = credentials.DB[process.env.NODE_ENV];

mongoose.connect(DB, function (err) {
  if (err) {
    console.log(`Error connecting to database ${DB}: ${err}`); // eslint-disable-line no-console
  } else {
    console.log(`Connected to database ${DB}`); // eslint-disable-line no-console
    mongoose.connection.db.dropDatabase();
    async.waterfall([
      saveUser,
      saveCohort,
      saveEvent,
      saveFiles,
      saveLinks,
      saveSnippets,
      saveTags
    ], (err) => {
      if (err) {
        console.log(err); //eslint-disable-line no-console
        process.exit();
      }
        console.log('Data seeded successfully'); //eslint-disable-line no-console
        process.exit();
    });
  }
});

const user = new models.User({
  username: 'northcoder',
  name: 'Awesome Northcoder',
  avatar_url: 'https://avatars3.githubusercontent.com/u/6791502?v=3&s=200',
  password: 'manda'
});

function saveUser (cb) {
  user.save(err => {
    if (err) cb(err);
    else cb(null);
  });
}

const cohort = new models.Cohort({
  name: 'October2016',
  start_date: new Date('October 17, 2016'),
  end_date: new Date('January 28, 2017')
});

function saveCohort (cb) {
  cohort.save(err => {
    if (err) cb(err);
    else cb(null);
  });
}

function saveEvent (done) {
  async.eachSeries(eventsData, function (event, cb) {
    var eventDoc = new models.Event(event);
    eventDoc.save(function (err) {
      if (err) {
        return cb(err);
      }
      return cb();
    })
  }, function (error) {
    if (error) return done(error);
    return done(null)
  })
}

function saveFiles (done) {
  async.eachSeries(fileData, function (file, cb) {
    var fileDoc = new models.File(file);

    fileDoc.save(function (err, newFile) {
      if (err) { return cb(err); }

      var resourceDoc = new models.Resource({
        type: 'file',
        resource_id: newFile._id
      });
      resourceDoc.save(function (err) {
        if (err) { return cb(err); }
        return cb()
      })
    })
  }, function (error) {
    if (error) return done(error)
    console.log('Files saved successfully') // eslint-disable-line no-console
    return done(null)
  })
}

function saveLinks (done) {
  async.eachSeries(linkData, function (link, cb) {
    var linkDoc = new models.Link(link);
    linkDoc.save(function (err, newLink) {
      if (err) return cb(err)
      var resourceDoc = new models.Resource({
        type: 'link',
        resource_id: newLink._id
      })
      resourceDoc.save(function (err) {
        if (err) return cb(err)
        return cb();
      })
    })
  }, function (err) {
    if (err) return done(err)
    console.log('Links saved successfully') // eslint-disable-line no-console
    return done(null)
  })
}

function saveSnippets (done) {
  async.eachSeries(snippetData, function (snippet, cb) {
    var snippetDoc = new models.Snippet(snippet);
    snippetDoc.save(function (err, newSnippet) {
      if (err) return cb(err);
      var resourceDoc = new models.Resource({
        type: 'snippet',
        resource_id: newSnippet._id
      })
      resourceDoc.save(function (err) {
        if (err) return cb(err);
        return cb();
      })
    })
  }, function (err) {
    if (err) return done(err);
    console.log('Snippets saved successfully'); // eslint-disable-line no-console
    return done(null)
  })
}

function saveTags (done) {
  async.eachSeries(tagData, function (tag, cb) {
    var tagDoc = new models.Tag(tag);
    tagDoc.save(function (err) {
      if (err) return cb(err)
      return cb()
    })
  }, function (err) {
    if (err) return done(err);
    console.log('Tags saved successfully'); // eslint-disable-line no-console
    return done(null)
  })
}
