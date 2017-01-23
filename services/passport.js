const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github2').Strategy;

const {User} = require('../models');
const {secret} = require('../credentials');

const jwtOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromHeader('authorization')
};

const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
  User.findById(payload.sub, function (err, user) {
    if (err) return done(err, false);
    if (user) done(null, user);
    else done(null, false);
  });
});

const localLogin = new LocalStrategy(function (username, password, done) {
  User.findOne({username}, function (err, user) {
    if (err) return done(err, false);
    if (!user) return done(null, false);
    user.comparePassword(password, function (err, isMatch) {
      if (err) return done(err);
      if (!isMatch) return done(null, false);
      return done(null, user);
    });
  });
});

const GITHUB_CLIENT_ID = '993a54957bbecb51bf0b'
const GITHUB_CLIENT_SECRET = '6cdd6c8e2dfacd3f4a2a6f066e331951379fd0fe'

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'https://githubspike.herokuapp.com/path'
},
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      // This is where we associate github account with the user in the api
      return done(null, profile)
    });
  }
));

passport.use(jwtLogin);
passport.use(localLogin);
