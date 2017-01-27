module.exports = {
  Events: require('./events.controller'),
  Authentication: require('./authentication.controller'),
  Tags: require('./tags.controller'),
  Resources: require('./resources.controller'),
  getPolicy: require('./s3.controller'),
  sendMessage: require('./slack.controller')
};
