var express = require('express');
var router = express.Router();
let recognizer = require('../recognizers/bing');

router.post('/', recognizer.doRequest);

module.exports = router;
