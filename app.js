require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
var connectDB= require('./server/config/db')
const fast2sms = require('fast-two-sms')
const multer = require('multer')
const nocache = require('nocache')
const toastr = require('toastr')

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

const expressLayout = require('express-ejs-layouts')
var ejs=require('ejs');




var app = express();

app.use(expressLayout);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout','./layout/layout')

// app.use((req,res,next)=>{
//   res.header('cache-control','private,nocache,no-store,must revalidate')
//   res.header('expurse','-1')
//   res.header('parama','no-cache')
// next()
// })

app.use(methodOverride('_method'));
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(nocache())
app.use(session
  ({secret:"Key",
 resave: false,
 saveUninitialized: true,
 cookie:{maxAge:4000000}
}));

// app.use((req,res,next)=>{
//   res.header('cache-control','private,nocache,no-store,must revalidate')
//   res.header('expurse','-1')
//   res.header('parama','no-cache')
// next()
// })




app.use('/', usersRouter);
app.use('/admin', adminRouter);



connectDB()




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
