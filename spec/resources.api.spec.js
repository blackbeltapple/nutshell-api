const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('chai').expect;
const saveTestData = require('../seed/test.seed.js');
const config = require('../config.js');
const {contains} = require('../helpers/validation/validator.js');
const {Resource, Event} = require('../models');

process.env.NODE_ENV = 'test';
require('../server');
const PORT = config.PORT[process.env.NODE_ENV];
const ROOT = `localhost:${PORT}`;

describe('POST & PUT resources', function () {
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

  let resource_id;
  const type = "file";
  const filename = "file.txt";
  const url = "http://www.bbc.co.uk";
  const description = "A description";
  const text = "Some text...";

  describe('POST /events/:id/resources', function () {

    // Need to create a new event first, and THEN attach the new resource to it
    let event_id;
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
        event_id = res.body.event._id;
        expect(res.body.event.title).to.equal(title)
        done();
      });
    });

    it('successfully saves a file, and modifies event.resource array', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type, filename, url, description, text})
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        resource_id = res.body.resource._id;
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
    it('successfully saves a link, and modifies event.resource array', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'link', url:'http://www.manutd.com/'})
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.resource.type).to.equal('link');
        expect(res.body.resource.url).to.equal('http://www.manutd.com/');
        expect(res.body.event.resources.length).to.equal(2);
        done();
      });
    });
    it('successfully saves a snippet, and modifies event.resource array', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'snippet', text: 'This is text for snippet'})
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.resource.type).to.equal('snippet');
        expect(res.body.resource.text).to.equal('This is text for snippet');
        expect(res.body.event.resources.length).to.equal(3);
        done();
      });
    });


    it('should return the article title, if the link type is provided', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'link', url: 'http://www.bbc.co.uk/news/uk-politics-38721650'})
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.resource.type).to.equal('link');
        expect(res.body.resource.title).to.equal('Supreme Court Brexit ruling: What happens next? - BBC News');
        expect(res.body.resource.url).to.equal('http://www.bbc.co.uk/news/uk-politics-38721650');
        done()
      });
    });
    it('should return an empty string, if the website doesn\'t have a title', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'link', url: 'http://www.thehistoryofenglish.com/'})
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body.resource.type).to.equal('link');
        expect(res.body.resource.title).to.equal('');
        done();
      });
    });
    it('should throw a 422 error if url is invalid', function (done) {
      request(ROOT)
        .post(`/api/events/${event_id}/resources`)
        .send({type, filename, url: 'http', description, text})
        .expect(422)
        .end(function (err, res) {
          expect(res.error.text).to.equal('You must provide a valid URL')
        done();
      });
    });
    it('returns correct error msg when client omits \'type\'', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({filename, url, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('You must provide a type');
        done();
      });
    });
    it('returns correct error msg when client sends invalid  \'type\'', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'banana', filename, url, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('Resource must be a file, link or snippet');
        done();
      });
    });
    it('returns correct error msg when type = file, but no filename sent', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type, url, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('Filename required');
        done();
      });
    });
    it('returns correct error msg when type = link, but no URL sent', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'link', filename, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('URL required');
        done();
      });
    });
    it('returns correct error msg when type = file, but no URL sent', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type, filename, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('URL required');
        done();
      });
    });
    it('returns correct error msg when type = snippet, but no text sent', function (done) {
      request(ROOT)
      .post(`/api/events/${event_id}/resources`)
      .send({type: 'snippet', filename, url, description})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('Snippet text required');
        done();
      });
    });
  });

  describe('PUT /events/resources/:resource_id', function () {
    let modifiedFilename = 'modified_file.txt';
    let modifiedURL = 'www.modified.com';
    it('successfully saves and returns a new resource, and modified event.resource array', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({type, filename: modifiedFilename, url: modifiedURL, description, text})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.resource.type).to.equal('file');
        expect(res.body.resource.filename).to.equal(modifiedFilename);
        expect(res.body.resource.url).to.equal(modifiedURL);
        expect(res.body.resource.description).to.equal('A description');
        expect(res.body.resource.text).to.equal('Some text...');
        done();
      });
    });
    it('returns correct error msg when client omits \'type\'', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({filename, url, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('You must provide a type');
        done();
      });
    });
    it('returns correct error msg when client sends invalid  \'type\'', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({type: 'banana', filename, url, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('Resource must be a file, link or snippet');
        done();
      });
    });
    it('returns correct error msg when type = file, but no filename sent', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({type, url, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('Filename required');
        done();
      });
    });
    it('returns correct error msg when type = link, but no URL sent', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({type: 'link', filename, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('URL required');
        done();
      });
    });
    it('returns correct error msg when type = file, but no URL sent', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({type, filename, description, text})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('URL required');
        done();
      });
    });
    it('returns correct error msg when type = snippet, but no text sent', function (done) {
      request(ROOT)
      .put(`/api/events/resources/${resource_id}`)
      .send({type: 'snippet', filename, url, description})
      .expect(422)
      .end(function (err, res) {
        expect(res.error.text).to.equal('Snippet text required');
        done();
      });
    });
  });

  describe('DELETE /resources/:resource_id', function () {
    it('should delete a resources from the database', function (done) {
    Resource.findOne({}, function (err, {_id}) {
      if (err) return done(err)
      request(ROOT)
      .delete(`/api/resources/${_id}`)
      .expect(200)
      .end(function (err) {
        if (err) return done(err)
        Resource.findById(_id, function (err, resource) {
          if(err) return done(err)
          .expect(resource).to.be.null;
          done();
        })
      })
    });
  });
  it('should delete the resource from all of the events it is linked too', function (done) {
    Resource.findOne({}, function (err, {_id}) {
      Event.find({resources: {$in: [_id]}}, function (err, events) {
        expect(events[0].resources.length).to.equal(1);
        done()
      });
    });
  });
  it('should throw an error if the resource ID is undefined', function (done) {
    request(ROOT)
    .delete(`/api/resources/whatever`)
    .expect(422)
    .end(function (err, res) {
      if (err) return done(err)
      expect(res.error.text).to.equal('You must enter a valid resource ID')
      done()
    });
  });
  });
});
