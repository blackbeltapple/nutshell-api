const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');
// const {contains} = require('../helpers/validation/validator.js')

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

describe('GET & POST tags', function () {
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
  let title = 'Redux thunk';
  let slug = 'redux-thunk';
  let category = 'Topic'

  describe('POST /tags', function () {

    it('returns an error if no tags found in database', function (done) {
      request(ROOT)
      .get('/api/tags')
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.err).to.equal('No tags found');
        done();
      });
    });

    it('successfully adds a new tag', function (done) {
      request(ROOT)
      .post('/api/tags')
      .send({title, slug, category})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.tag.title).to.equal(title);
        expect(res.body.tag.slug).to.equal(slug);
        expect(res.body.tag.category).to.equal(category);
        done();
      });
    });

    it('returns an error if try to add a new tag without a title', function (done) {
      request(ROOT)
      .post('/api/tags')
      .send({slug, category})
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.err).to.equal('Tag must have title');
        done();
      });
    });
  });

  describe('GET /tags', function () {
    it('successfully returns an array of tags', function (done) {
      request(ROOT)
      .get('/api/tags')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        let tagArray = res.body;
        expect(tagArray[0].title).to.equal(title);
        expect(tagArray[0].slug).to.equal(slug);
        expect(tagArray[0].category).to.equal(category);
        tagArray.forEach(function (tag) {
          expect(tag).to.have.all.keys('title', 'slug', 'category', '__v', '_id');
          expect(['Type', 'Topic']).to.include(tag.category)
        })
        done();
      });
    });
  });
})
