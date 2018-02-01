var express = require('express');
var router = express.Router();
let recognizer = require('../recognizers/houndify');

router.post('/', function(req, res, next) {
    res.json({msg:'click buttons', body: req.body});
});

/*router.post('/', recognizer.doRequest);*/

module.exports = router;
