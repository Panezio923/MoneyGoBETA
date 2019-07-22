const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieSession = require('cookie-session');


//ROUTES
const indexRoute = require('./routes/indexRoute');
const registerRoute = require('./routes/registratiRoute');
const homeRoute = require('./routes/homeRoute');
const gestioneMetodiRoute = require('./routes/gestioneMetodiRoute');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Impostazioni dei cookie
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000}
}));

//Helmet protegge l'app da vulnerabilità web
app.use(helmet());


app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));


//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//routers
app.use('/', indexRoute);
app.use('/registrati', registerRoute);
app.use('/home', homeRoute);
app.use('/home/adminCards', gestioneMetodiRoute);

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
