process.env.NODE_ENV = 'test';
const PORT = require('../config.js').PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;
require('../server/index.js');
const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const {Resource, Tag} = require('../models');

const title = 'SASS';
const start_date = new Date('October 27, 2016, 10:30:00');
const end_date = new Date('October 27, 2016, 12:30:00');
const description = 'Lecture on SASS';
const event_type = 'lecture';
const repo = 'http://github.com/northcoders/sass-lecture';
const all_day = true;
const lecturer = 'Chris Hill';
const testNumber = 45;

describe('Api Routes', function () {
  before(function (done) {
    mongoose.connection.once('connected', function () {
      mongoose.connection.db.dropDatabase(function () {
        console.log('db dropped'); // eslint-disable-line no-console
        saveTestData(function () {
          done();
        });
      });
    });
  });
  after(function (done) {
    mongoose.connection.db.dropDatabase(function () {
      done();
    });
  });
  let event_id;
  describe('GET /api/events', function () {
    it('return an array of event objects', function (done) {
      request(ROOT)
      .get('/api/events')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        event_id = res.body.events[0]._id;
        expect(res.body.events[0].title).to.equal('Redux');
        expect(res.body.events[0].event_type).to.equal('lecture');
        expect(Date(res.body.events[0].start_date)).to.equal(Date('October 27, 2016, 09:30:00'));
        expect(Date(res.body.events[0].end_date)).to.equal(Date('October 27, 2016 10:30:00'));
        expect(res.body.events[0].all_day).to.equal(false);
        done();
      });
    });
  });
  describe('GET /api/events/:id', function () {
    it('return an array of event objects', function (done) {
      request(ROOT)
      .get('/api/events/' + event_id)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.event.title).to.equal('Redux');
        expect(res.body.event.event_type).to.equal('lecture');
        expect(Date(res.body.event.start_date)).to.equal(Date('October 27, 2016, 09:30:00'));
        expect(Date(res.body.event.end_date)).to.equal(Date('October 27, 2016 10:30:00'));
        expect(res.body.event.all_day).to.equal(false);
        expect(res.body.event.resources[0].type).to.equal('snippet');
        expect(res.body.event.resources[0].text).to.equal('Lorem ipsum');
        expect(res.body.event.resources[0].url).to.equal('http://www.bbc.co.uk');
        expect(res.body.event.resources[0].description).to.equal('Excellent snippet');
        expect(res.body.event.resources[0].filename).to.equal('file.jpg');
        expect(res.body.event.resources[0].tags[0].title).to.equal('Redux');
        expect(res.body.event.resources[0].tags[0].slug).to.equal('redux');
        expect(res.body.event.resources[0].tags[0].category).to.equal('Topic');
        done();
      });
    });
  });
  describe('GET /api/resources', function () {
    it('responds with a 200 and an array of resources', function (done) {
      request(ROOT)
      .get('/api/resources')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.resources[0].type).to.equal('snippet');
        expect(res.body.resources[0].text).to.equal('Lorem ipsum');
        expect(res.body.resources[0].url).to.equal('http://www.bbc.co.uk');
        expect(res.body.resources[0].description).to.equal('Excellent snippet');
        expect(res.body.resources[0].filename).to.equal('file.jpg');
        expect(res.body.resources[0].tags[0].title).to.equal('Redux');
        expect(res.body.resources[0].tags[0].slug).to.equal('redux');
        expect(res.body.resources[0].tags[0].category).to.equal('Topic');
        done();
      });
    });
  });
  describe('POST /api/events', function () {
    it('adds a new event to the database', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({title, start_date, end_date, description, event_type, repo, all_day, lecturer})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.event.title).to.equal(title)
        expect(res.body.event.start_date).to.equal('2016-10-27T09:30:00.000Z')
        expect(res.body.event.end_date).to.equal('2016-10-27T11:30:00.000Z')
        expect(res.body.event.description).to.equal(description)
        expect(res.body.event.event_type).to.equal(event_type)
        expect(res.body.event.repo).to.equal(repo)
        expect(res.body.event.all_day).to.equal(all_day)
        expect(res.body.event.lecturer).to.equal(lecturer)
        done();
      });
    });
    it('should throw a 406 if the a required property is missing', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({start_date, end_date, description, event_type, repo, all_day, lecturer})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"You must enter a title, start date, end date and a event type"}')
        done()
      });
    });
    it('should throw an error if title isn\'t a string', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({title: testNumber, start_date, end_date, event_type})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"Title, description, repo and lecturer must be a string"}')
        done()
      });
    });
    it('should throw an error if description isn\'t a string', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({title, start_date, end_date, event_type, description: testNumber})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"Title, description, repo and lecturer must be a string"}')
        done()
      });
    });
    it('should throw an error if event_type isn\'t a string', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({title, start_date, end_date, event_type: testNumber})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"Title, description, repo and lecturer must be a string"}')
        done()
      });
    });
    it('should throw an error if repo isn\'t a string', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({title, start_date, end_date, event_type, repo: testNumber})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"Title, description, repo and lecturer must be a string"}')
        done()
      });
    });
    it('should throw and error if lecturer isn\'t a string', function (done) {
      request(ROOT)
      .post('/api/events')
      .send({title, start_date, end_date, event_type, lecturer: testNumber})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"Title, description, repo and lecturer must be a string"}')
        done()
      });
    });
  });
  describe('DELETE /api/tags', function () {
    it('should delete a tag from the database', function (done) {
      var tagId;
      Tag.find({}, function (err, tags) {
        tagId = tags[0]._id
        request(ROOT)
        .delete('/api/tags')
        .send({id: tagId})
        .expect(200)
        .end(function (err) {
          if (err) return done(err)
          Tag.findById({_id: tagId}, function (err, tag) {
            if(err) return done(err)
            .expect(tag).to.be(undefined)
            done();
          })
        })
      });
    });
    it('should delete the tag from all of the resources it is linked too', function (done) {
      var tagId
      Tag.find({}, function (err, tag) {
        console.log(tag)
        tagId = tag[0]._id;
        Resource.find({tags: {$in: [tagId]}}, function (err, resources) {
          expect(resources[0].tags.length).to.equal(1);
          request(ROOT)
          .delete('/api/tags')
          .send({id: tagId})
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            expect(res.body.resources[0].tags.length).to.equal(0);
            done()
          });
        });
      });
    });
    it('should throw an error if the tag ID is undefined', function (done) {
      request(ROOT)
      .delete('/api/tags')
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"You must enter a valid tag ID"}')
        done()
      });
    });
  });
  describe('DELETE /api/resources', function () {
    it('should delete a resources from the database', function (done) {
      var resourceId;
      Resource.find({}, function (err, resources) {
        resourceId = resources[0]._id
        request(ROOT)
        .delete('/api/tags')
        .send({id: resourceId})
        .expect(200)
        .end(function (err) {
          if (err) return done(err)
          Tag.findById({_id: resourceId}, function (err, tag) {
            if(err) return done(err)
            .expect(tag).to.be(undefined)
            done();
          })
        })
      });
    });
    xit('should delete the resource from all of the events it is linked too', function () {

    });
    it('should throw an error if the resource ID is undefined', function (done) {
      request(ROOT)
      .delete('/api/resources')
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.error.text).to.equal('{"err":"You must send a valid resource ID"}')
        done()
      });
    });
  });
});
