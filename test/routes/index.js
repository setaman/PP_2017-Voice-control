var express = require('express');
var router = express.Router();

/* GET main testing page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Vocs main test Site'});
});

module.exports = router;