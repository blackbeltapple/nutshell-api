const express = require('express');
const {events, resources, tags} = require('.');
const router = express.Router();

router.use('/events', events);
router.use('/resources', resources);
router.use('/tags', tags);

router.put('/events/resources/:resource_id', function (req, res, next) {
  const {resource_id} = req.params;
  const {body} = req;
  // console.log('res_id passed to editResource ' , resource_id);
  if (!resource_id || !body) next(new Error('Missing parameter or body')); // TODO: error handle this properly
  // console.log('1. Call to editResourcess');
  // console.log('In router: ', resource_id, body);
  Resources.editResource(resource_id, body, function (err, resource) {
    if (err) return next(err);
    res.status(200).json({resource});
  })
});


module.exports = router;
