const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');
const {Resource, Tag} = require('../models');

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

describe('API:tags', function () {
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
  let title = 'Redux';
  let slug = 'redux';
  let category = 'Topic'

  describe('POST /tags', function () {
    it('successfully adds a new tag', function (done) {
      request(ROOT)
      .post('/api/tags')
      .send({title: 'React Router'})
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.tag.title).to.equal('React Router');
        expect(res.body.tag.slug).to.equal('react-router');
        expect(res.body.tag.category).to.equal('Topic');
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
        expect(res.error.text).to.equal('Tag must have title');
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
    xit('returns an error if no tags found in database', function (done) {
      request(ROOT)
      .get('/api/tags')
      .expect(404)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.err).to.equal('No tags found');
        done();
      });
    });
  });
  describe('DELETE /tags', function () {
    it('should delete a tag from the database', function (done) {
     Tag.findOne({}, function (err, {_id}) {
       if (err) return done();
       request(ROOT)
       .delete(`/api/tags/${_id}`)
       .expect(200)
       .end(function (err) {
         if (err) return done(err)
         Tag.findById(_id, function (err, tag) {
           if(err) return done(err);
           expect(tag).to.be.null;
           done();
         });
       });
     });
   });
   it('should delete the tag from all of the resources it is linked too', function (done) {
     Tag.findOne({}, function (err, {_id}) {
       Resource.find({tags: {$in: [_id]}}, function (err, resources) {
         expect(resources[0].tags.length).to.equal(1);
         done();
       });
     });
   });
   it('responds with 422 when requested an invalid tag id', function (done) {
     request(ROOT)
     .delete('/api/tags/whatever')
     .expect(422)
     .end(function (err, res) {
       if (err) return done(err)
       expect(res.error.text).to.equal('You must enter a valid tag ID')
       done()
     });
   });
  })
})
