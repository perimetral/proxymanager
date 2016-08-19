global.c = require('./lib/configurator')({ initial: require('./config') });
global.log = c('logger');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const handlebars = require('express-handlebars');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const session = require('express-session');
const sessionStore = require('connect-mongo')(session);

mongoose.connect(c('database mongo url'));

var app = express();
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', c('paths views'));
app.use(logger(c('server logger mode')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: crypto.randomBytes(c('session secret length')).toString('hex'),
	resave: false,
	saveUninitialized: false,
	store: new sessionStore({
		mongooseConnection: mongoose.connection,
		ttl: c('session ttl'),
	}),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(c('paths static')));

var Account = require('./lib/models/Account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app = require('./routing')(app);

app.listen(c('server port'), () => {
	log('listening on ' + c('server port'));
});