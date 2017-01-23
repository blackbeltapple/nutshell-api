const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

/**
 * The purpose of this test suite is to test that the API is behaving
 * correctly in terms of what it is sending back to the client. It is
 * NOT to interrogate the database and check that items have been added
 * and deleted.  We are just testing that the RESPONSE is correct, i.e.
 * the status code/number,
 * the length of res.body,
 * the content of res.body,
 * that res.body contains the correct keys. We need to test that PUT and
 * POST requests return the new/editted data to the client - this
 * is convention. The client should receive the new full mongo document.
 * They may well need the _id that the DB created.
 * We can also test that the schemas are working correctly
 */

describe('Authentication Routes', function () {
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

  describe('GET / route', function () {
    it('permits access to the / route to all users', function (done) {
      request(ROOT)
        .get('/')
        .expect(200, {message: 'It works!'}, done);
    });
  });

  describe('GET /loggedin (unauthorised) route', function () {
    it('prevents access to /loggedin route to unauthorised users', function (done) {
      request(ROOT)
        .get('/loggedin')
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.text).to.equal('Unauthorized');
          done();
        });
    });
  });

  describe('POST /signup and GET /loggedin (authorised) routes', function () {
    var validToken = '';
    it('notifies user at /signup route if they have not supplied username, name and password ', function (done) {
      request(ROOT)
        .post('/signup')
        .expect(422, {error: 'You must provide username, name and password'}, done);
    });

    // Need to retain the callback to obtain the newly created token for use in next test
    it('enables new user to sign up and returns user info and token to client', function (done) {
      var username = 'BobBobBob';
      var name = 'Bob';
      var password = 'password123';
      var avatarUrl = 'https://avatar3.githubusercontent.com/u/6791502?v=3&s=200';
      request(ROOT)
        .post('/signup')
        .send({username, name, password})
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          validToken = res.body.token;
          expect(res.body.token).to.be.a('string').of.length(153);
          expect(res.body).to.have.all.keys('token', 'user');
          expect(res.body.user).to.have.all.keys('username', 'name', 'avatar_url');
          expect(res.body.user.username).to.equal(username);
          expect(res.body.user.name).to.equal(name);
          expect(res.body.user.avatar_url).to.equal(avatarUrl);
          done();
        });
    });

    // This test relies on the token produced in previous test
    it('permits access to /loggedin route to authorised user', function (done) {
      request(ROOT)
        .get('/loggedin')
        .set('Authorization', validToken)
        .expect(200, {message: 'You are massively authorizzzzzzed'}, done);
    });

    it('prevents a pre-existing user from signing up again', function (done) {
      var username = 'BobBobBob';
      var name = 'Bob';
      var password = 'password123';
      request(ROOT)
        .post('/signup')
        .send({username, name, password})
        .expect(422, {error: `Username '${username}' already exists`}, done)
    });
  });

  describe('POST /signin route', function () {
    it('returns an error if an unknown user tries to sign in', function (done) {
      var username = 'Sherlock'; // unknown user
      var name = 'Benedict Cumberbatch';
      var password = 'password123';
      request(ROOT)
        .post('/signin')
        .send({username, name, password})
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.text).to.equal('Unauthorized');
          done();
        });
    });

    it('returns user info and token when an existing user signs in', function (done) {
      var username = 'BobBobBob';
      var name = 'Bob';
      var password = 'password123';
      var avatarUrl = 'https://avatar3.githubusercontent.com/u/6791502?v=3&s=200';
      request(ROOT)
        .post('/signin')
        .send({username, name, password})
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.all.keys('token', 'user');
          expect(res.body.token).to.be.a('string').of.length(153);
          expect(res.body.user).to.have.all.keys('username', 'name', 'avatar_url');
          expect(res.body.user.username).to.equal(username);
          expect(res.body.user.name).to.equal(name);
          expect(res.body.user.avatar_url).to.equal(avatarUrl);
          done();
        });
    });
  });
});
