const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const {User} = require('../models');
const secret = process.env.SECRET || require('../credentials').secret;

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

passport.use(jwtLogin);
passport.use(localLogin);
