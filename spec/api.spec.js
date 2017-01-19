process.env.NODE_ENV = 'test';
const PORT = require('../config.js').PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;
require('../server/index.js');
const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');

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
        done();
      });
    });
  })
});
