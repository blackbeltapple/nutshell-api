const policy = require('s3-policy');
const {KEY, SECRET, BUCKET, URL} = require('../credentials').s3policy;

function getPolicy () {
  var p = policy({
    secret: (process.env.S3_SECRET || SECRET),
    length: 5000000,
    bucket: (process.env.S3_BUCKET || BUCKET),
    key: (process.env.S3_KEY || KEY),
    expires: new Date(Date.now() + 6000000),
    acl: 'public-read',
    conditions: [
      ["starts-with", "$key", "uploads/"],
      {"success_action_redirect": (process.env.URL || URL)},
      ["starts-with", "$Content-Type", ""],
    ]
  });
  return {
    policy: p.policy,
    signature: p.signature
  };
}


module.exports = getPolicy;
