if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');

const credentials = require('../credentials');
const config = require('../config');
const {Authentication} = require('../controllers');
const apiRouter = require('../routes/api.router');

require('../services/passport');

const PORT = process.env.PORT || config.PORT[process.env.NODE_ENV];
const app = express();

// DB setup
const DB = process.env.DB || credentials.DB[process.env.NODE_ENV];
mongoose.connect(DB, function (err) {
  if (err) {
    console.log(`Error connecting to database ${DB}: ${err}`); // eslint-disable-line no-console
  } else {
    console.log(`Connected to database ${DB}`); // eslint-disable-line no-console
  }
});

// App middleware setup
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({type: '*/*'}));
app.use('/api', apiRouter);

app.get('/', function (req, res) {
  res.send({message: 'It works!'});
});

// Auth routes
const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', {session: false});
app.get('/loggedin', requireAuth, function (req, res) {
  res.send({message: 'You are massively authorizzzzzzed'});
});
app.post('/signup', Authentication.signup);
app.post('/signin', requireSignin, Authentication.signin);

// Error handling routes

app.use('/*', function (req, res) {
  return res.status(404).json({"message": "Uh-oh! You are at the wrong address! Much love from Dave, Amanda, Tague and Zoe"});
});

app.use(function (err, req, res, next) {
  if (err.name === 'Validation') {
    return res.status(422).json({err: err.message});
  }
  next(err);
})

app.use(function (err, req, res, next) {
  if (err) {
    return res.status(500).json({error: 'Database error - ' + err})
  }
  next();
});

app.listen(PORT, function (err) {
  if (err) console.log(err); // eslint-disable-line no-console
  console.log(`Listening on port ${PORT}...`); // eslint-disable-line no-console
});
