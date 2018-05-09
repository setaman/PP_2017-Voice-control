var express = require('express');
var router = express.Router();

/* GET test page. */
router.get('/', function(req, res, next) {
  res.render("video", { title: 'Video Test site' });
});

module.exports = router;
