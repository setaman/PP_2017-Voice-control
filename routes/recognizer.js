var express = require('express');
var router = express.Router();

let testObject = {
    hello: 'hello',
    client: 'client'
};

/* GET home page. */
router.post('/', function(req, res, next) {
    res.send({msg:'Thank you', body: req.body});
});

module.exports = router;
