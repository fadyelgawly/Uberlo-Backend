const
  createError = require('http-errors'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  passport = require('passport'),
  router = require('./router'),
  express = require('express'),
  app = express()

  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(passport.initialize())
  app.use(logger('dev'))
  app.use(router);
    

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
