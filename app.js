let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let recognizer = require('./routes/recognizer');
let helmet = require('helmet');
let resourceMonitorMiddleware = require('express-watcher').resourceMonitorMiddleware;
let express = require('express');
let app = express();

app.use(resourceMonitorMiddleware);
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: false, parameterLimit: 100000 }));
app.use(express.static(path.join(__dirname + '/public')));

//Sende audio an ASR
app.use('/audio',recognizer);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(res.statusCode);
  next(res.error);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
