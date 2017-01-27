const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

describe('Slack Integration', function () {
  before(function (done) {
    mongoose.connection.db.dropDatabase();
    console.log('db dropped\n') // eslint-disable-line no-console
    saveTestData(function () {
      done();
    });
  });
  after(function (done) {
    mongoose.connection.db.dropDatabase();
    done();
  });

  describe('POST /slack', function () {
    it('should return "Message sent" if successful', function (done) {
      request(ROOT)
      .post('/api/slack')
      .send({text: 'Testing slack integration', username: 'supertest', icon_emoji: ':ghost:'})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.message).to.equal('Message Sent');
        done();
      });
    });
    it('should return an error if username is not sent', function (done) {
      request(ROOT)
      .post('/api/slack')
      .send({text: 'Testing slack integration', icon_emoji: ':ghost:'})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.error.text).to.equal('You must enter a username');
        done();
      })
    });
    it('should return an error if text is not sent', function (done) {
      request(ROOT)
      .post('/api/slack')
      .send({username: 'supertest', icon_emoji: ':ghost:'})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.error.text).to.equal('You must enter text');
        done();
      })
    });
  });
});
