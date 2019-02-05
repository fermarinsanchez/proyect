require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);
const passport = require('passport');
const mongoose = require('mongoose');
const categories = require('./data/categories');
const politics = require('./data/politics')

require('./configs/db.config');
require('./configs/hbs.config');
require('./configs/passport.config');

const usersRouter = require('./routes/users.routes');
const experiencesRouter = require('./routes/experiences.routes');
const sessionsRouter = require('./routes/sessions.routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

require('./helpers/category.helpers');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'SuperArgo',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 1000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60
  })
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.session = req.user;
  res.locals.allCategories = categories;
  res.locals.allPolitics = politics;
  next();
})

app.use('/', usersRouter);
app.use('/experiences', experiencesRouter);
app.use('/sessions', sessionsRouter);

// app.use('/', (req, res, next) => res.redirect('/users/categories'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
