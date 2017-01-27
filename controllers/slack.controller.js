const axios = require('axios');
const validator = require('../helpers/validation/validator')

function sendToSlack (body,  sendToRouter) {
  if(validator.slackValidation(body, sendToRouter)) {
    axios.post('https://hooks.slack.com/services/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', body)
    .then(function () {
      sendToRouter(null, 'Message Sent')
    })
    .catch(function (err) {
      sendToRouter(err)
    })
  }
}

module.exports = sendToSlack;
