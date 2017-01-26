const express = require('express');
const {events, resources, tags} = require('.');
const router = express.Router();
const {getPolicy} = require('../controllers');


router.use('/events', events);
router.use('/resources', resources);
router.use('/tags', tags);

router.get('/s3policy', (req, res) => {
  res.json(getPolicy());
})

// ERROR HANDLING
router.use(function (error, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(error.status || 500);
  res.send(error.message);
});

module.exports = router;
