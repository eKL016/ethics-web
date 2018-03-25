var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose')
var partials = require('express-partials');
var session = require('cookie-session');
var index = require('./routes/index');
var admins = require('./routes/admins');
var subjects = require('./routes/subjects');
var exps = require('./routes/exps');
var app = express();

mongoose.connect(process.env.MONGODB_URL,
  {user: process.env.MONGODB_USER, pass: process.env.MONGODB_PASS});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 80);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(partials());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('001'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    keys: ['001','002'],
    secret: '001'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/admin', admins);
app.use('/subjects', subjects);
app.use('/exps', exps);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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