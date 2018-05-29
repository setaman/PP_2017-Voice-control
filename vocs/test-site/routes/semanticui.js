var express = require('express');
var router = express.Router();

/* GET Semantic UI page. */
router.get('/', function(req, res, next) {
    res.render('semanticui', { title: 'Semantic UI' });
});

module.exports = router;