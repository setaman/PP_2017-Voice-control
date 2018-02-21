var express = require('express');
var router = express.Router();

/* GET Foundation 6 page. */
router.get('/foundation', function(req, res, next) {
  res.render('foundation', { title: 'Foundation 6' });
});

module.exports = router;
