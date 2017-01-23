const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');
const {contains} = require('../helpers/validation/validator.js')

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

describe('POST /events/:id/resources', function () {
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

  // Need to create a new event first, and THEN attach the new resource to it
  let newEvent;
  const title = 'SASS';
  const start_date = 'October 27, 2016, 10:30:00';
  const end_date = 'October 27, 2016, 12:30:00';
  const e_description = 'Lecture on SASS';
  const event_type = 'lecture';
  const repo = 'http://github.com/northcoders/sass-lecture';
  const all_day = true;
  const lecturer = 'Chris Hill';

  it('adds a new event to the database', function (done) {
    request(ROOT)
    .post('/api/events')
    .send({title, start_date, end_date, description: e_description, event_type, repo, all_day, lecturer})
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err)
      newEvent = res.body.event._id;
      expect(res.body.event.title).to.equal(title)
      done();
    });
  });

  const type = "file";
  const filename = "file.txt";
  const url = "http://www.bbc.co.uk";
  const description = "A description";
  const text = "Some text...";

  it('successfully saves and returns a new resource, and modified event.resource array', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({type, filename, url, description, text})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.resource.type).to.equal('file');
        expect(res.body.resource.filename).to.equal('file.txt');
        expect(res.body.resource.url).to.equal('http://www.bbc.co.uk');
        expect(res.body.resource.description).to.equal('A description');
        expect(res.body.resource.text).to.equal('Some text...');
        expect(res.body.event.resources.length).to.equal(1);
        expect(contains(res.body.event.resources, res.body.resource._id)).to.be.true;
        done();
      });
  });
  it('returns correct error msg when client omits \'type\'', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({filename, url, description, text})
      .expect(422, {err: 'You must provide a type'}, done);
  });
  it('returns correct error msg when client sends invalid  \'type\'', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({type: 'banana', filename, url, description, text})
      .expect(422, {err: 'Resource must be a file, link or snippet'}, done);
  });
  it('returns correct error msg when type = file, but no filename sent', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({type, url, description, text})
      .expect(422, {err: 'Filename required'}, done);
  });
  it('returns correct error msg when type = link, but no URL sent', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({type: 'link', filename, description, text})
      .expect(422, {err: 'URL required'}, done);
  });
  it('returns correct error msg when type = file, but no URL sent', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({type, filename, description, text})
      .expect(422, {err: 'URL required'}, done);
  });
  it('returns correct error msg when type = snippet, but no text sent', function (done) {
    request(ROOT)
      .post(`/api/events/${newEvent}/resources`)
      .send({type: 'snippet', filename, url, description})
      .expect(422, {err: 'Snippet text required'}, done);
  });
})
