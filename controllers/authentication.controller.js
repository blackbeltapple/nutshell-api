const User = require('../models/user');
const jwt = require('jwt-simple');
const {secret} = require('../credentials');

function tokenForUser (user) {
  const timeStamp = new Date().getTime();
  return jwt.encode({
    sub: user.id,
    iat: timeStamp
  }, secret);
}

const signup = function signup (req, res, next) {
  const {username, name, password} = req.body;
  if (!username || !name || !password) {
    return res.status(422).send({
      error: 'You must provide username, name and password'
    });
  }
  User.findOne({username}, function (err, existingUser) {
    if (err) return next(err);
    if (existingUser) {
      return res.status(422).send({error: `Username '${username}' already exists`});
    }
    const user = new User({username, name, password});
    const {avatar_url} = user;
    user.save(function (err) {
      if (err) return next(err);
      return res.json({
        token: tokenForUser(user),
        user: {username, name, avatar_url}
      });
    });
  });
};

const signin = function signin (req, res) {
  const {username, name, avatar_url} = req.user;
  res.send({
    token: tokenForUser(req.user),
    user: {username, name, avatar_url}
  });
};

module.exports = {
  signin, signup
};
