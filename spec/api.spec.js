const {expect} = require('chai');
const mongoose = require('mongoose');
const request = require('supertest');
const saveTestData = require('../seed/test.seed.js');

process.env.NODE_ENV = 'test';
require('../server/index.js');
const config = require('../config');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

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
  describe('GET /api/events', function () {
    it('return an array of event objects', function (done) {
      request(ROOT)
      .get('/api/events')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body[0].title).to.equal('Redux');
        expect(res.body[0].event_type).to.equal('lecture');
        expect(Date(res.body[0].start_date)).to.equal(Date('October 27, 2016, 09:30:00'));
        expect(Date(res.body[0].end_date)).to.equal(Date('October 27, 2016 10:30:00'));
        expect(res.body[0].description).to.equal('Lecture on Redux');
        expect(res.body[0].event_type).to.equal('lecture');
        expect(res.body[0].repo).to.equal('https://github.com/northcoders/student-portal-api');
        expect(res.body[0].lecturer).to.equal('Chris Hill');
        expect(res.body[0].all_day).to.equal(false);
        done();
      });
    });
  });
});
