require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const methodOverride = require('method-override');
const session = require('express-session');
const cors = require('cors')
const localsUserCheck = require('./src/middlewares/localsUserCheck');
const cookieCheck = require('./src/middlewares/cookieCheck');


var app = express();

//rutas MVC
const indexRouter = require('./src/routes/index');
const usersRouter = require('./src/routes/users');
const licitacionRouter = require('./src/routes/licitacion');

//APIS
const apiUsersRouter = require('./src/routes/apis/apiUsers');


// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
  secret : "Encope web 2023",
  resave : false,
  saveUninitialized: true
}))
app.use(cors())

app.use(cookieCheck)
app.use(localsUserCheck)


//rutas MVC

app.use('/', indexRouter);
app.use('/licitacion', licitacionRouter);
app.use('/users', usersRouter);

//APIS
app.use('/api/users', apiUsersRouter)


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
