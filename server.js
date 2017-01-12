const express = require('express');

const app = express();

app.get('/', function (req, res) {
  res.send('It works!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}...`)
});