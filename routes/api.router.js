const express = require('express');
const {events, resources, tags} = require('.');
const router = express.Router();

router.use('/events', events);
router.use('/resources', resources);
router.use('/tags', tags);

module.exports = router;
