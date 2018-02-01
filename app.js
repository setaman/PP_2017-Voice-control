let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let index = require('./routes/index');
let semanticui = require('./routes/semanticui');
let foundation = require('./routes/foundation');
let recognizer = require('./routes/recognizer');
let config = require('./routes/config');
let helmet = require('helmet');
let resourceMonitorMiddleware = require('express-watcher').resourceMonitorMiddleware;
let express = require('express');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(resourceMonitorMiddleware);
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static(path.join(__dirname + '/dist')));

app.use('/', index);
app.use('/semanticui', semanticui);
app.use('/foundation', foundation);
app.use('/recognizer',recognizer);
app.use('/config',recognizer);

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
