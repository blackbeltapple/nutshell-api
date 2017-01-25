const axios = require('axios');

const getTitle = function (url) {
  return axios.get(url)
    .then((res) => {
      return res.data.match(/<title>(.*?)<\/title>/)[1];
    })
    .catch(() => {
      return '';
    });
}

module.exports = getTitle;
