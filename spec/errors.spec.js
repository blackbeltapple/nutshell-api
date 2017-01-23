const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

describe('POST /resources', function () {
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

  const type = "file";
  const filename = "file.txt";
  const url = "http://www.bbc.co.uk";
  const description = "A description";
  const text = "Some text...";

  it('successfully saves and returns a new resource', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({type, filename, url, description, text})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.resource.type).to.equal('file');
        expect(res.body.resource.filename).to.equal('file.txt');
        expect(res.body.resource.url).to.equal('http://www.bbc.co.uk');
        expect(res.body.resource.description).to.equal('A description');
        expect(res.body.resource.text).to.equal('Some text...');
        done();
      });
  });
  it('returns correct error msg when client omits \'type\'', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({filename, url, description, text})
      .expect(422, {err: 'You must provide a type'}, done);
  });
  it('returns correct error msg when client sends invalid  \'type\'', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({type: 'banana', filename, url, description, text})
      .expect(422, {err: 'Resource must be a file, link or snippet'}, done);
  });
  it('returns correct error msg when type = file, but no filename sent', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({type, url, description, text})
      .expect(422, {err: 'Filename required'}, done);
  });
  it('returns correct error msg when type = link, but no URL sent', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({type: 'link', filename, description, text})
      .expect(422, {err: 'URL required'}, done);
  });
  it('returns correct error msg when type = file, but no URL sent', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({type, filename, description, text})
      .expect(422, {err: 'URL required'}, done);
  });
  it('returns correct error msg when type = snippet, but no text sent', function (done) {
    request(ROOT)
      .post('/api/resources')
      .send({type: 'snippet', filename, url, description})
      .expect(422, {err: 'Snippet text required'}, done);
  });


})
