const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
var cron = require('node-cron');

const Periodico = require('./private/controller/pagamentoperiodico');
const periodico = new Periodico();

//ROUTES
const indexRoute = require('./private/route/indexRoute');
const registerRoute = require('./private/route/registratiRoute');
const homeRoute = require('./private/route/homeRoute');
const gestioneMetodiRoute = require('./private/route/gestioneMetodiRoute');
const gestioneDatiRoute = require('./private/route/gestioneDatiRoute');
const periodicoRoute = require('./private/route/periodicoRoute');

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
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000}
}));

//Helmet protegge l'app da vulnerabilità web
app.use(helmet());


app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));


//Set static folder
app.use(express.static('public'));
app.use(express.static(path.join(__dirname + '/public')));

//routers
app.use('/', indexRoute);
app.use('/registrati', registerRoute);
app.use('/home', homeRoute);
app.use('/home/adminCards', gestioneMetodiRoute);
app.use('/home/gestioneDati', gestioneDatiRoute);
app.use('/home/pagamentoPeriodico', periodicoRoute);

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

/**
 * Campo della risposta che indica ai browser che la ricevono che le risorse del server possono essere
 * accedute da qualsiasi origine. Necessario per rispondere all'applicazione mobile.
 */
app.use(function setHeader(req, res, next) {
  res.set({"Access-Control-Allow-Origin": "*"});
  next();
});

/**
 * Anche questo route è necessario per la gestione dell'applicazione mobile. Difatti spesso le richieste da parte
 * dell'applicazione mobile vengono prima mandate tramite delle CORS, in cui l'applicazione (o il browser) richiede
 * prima la conferma di validità della richiesta al server (tramite il metodo OPTIONS).
 */
app.options("*", function (req, res) {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "origin, x-requested-with, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  });
  res.send();
});

/**
 * L'accesso diretto ai file ejs viene impedito, per evitare che un utente possa accedere direttamente alla pagina del
 * sito senza essere autenticato.
 */
app.use('*.ejs', function (req, res, next) {
  res.status('403').end('403 Forbidden');
});


cron.schedule('00 00 08 * * *', function () {
  periodico.periodiciDaEffettuare();
});

module.exports = app;
