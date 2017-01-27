const axios = require('axios');

function sendToSlack (body,  sendToRouter) {
    axios.post('https://hooks.slack.com/services/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', body)
    .then(function (response) {
      console.log(response) // eslint-disable-line no-console
      sendToRouter(null, 'Message Sent')
    })
    .catch(function (err) {
      sendToRouter(err)
    })
}

module.exports = sendToSlack;
