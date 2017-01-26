const policy = require('s3-policy');

function getPolicy () {
  var p = policy({
    secret: (process.env.S3_SECRET || require('../credentials').s3policy.SECRET),
    length: 5000000,
    bucket: (process.env.S3_BUCKET || require('../credentials').s3policy.BUCKET),
    key: (process.env.S3_KEY || require('../credentials').s3policy.KEY),
    expires: new Date(Date.now() + 6000000),
    acl: 'public-read',
    conditions: [
      ["starts-with", "$key", "uploads/"],
      {"success_action_redirect": (process.env.URL || require('../credentials').s3policy.URL)},
      ["starts-with", "$Content-Type", ""],
    ]
  });
  return {
    policy: p.policy,
    signature: p.signature
  };
}


module.exports = getPolicy;
