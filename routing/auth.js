const passport = require('passport');
var Account = require('../lib/models/Account');

const express = require('express');
let r = express.Router();

r.get('/', (req, res) => {
	if (req.user) return res.redirect('/');
	return res.render('login');
});

r.post('/register', (req, res) => {
	let username = req.body.username;
	let passhash = req.body.password;

	Account.register(new Account({
		username,
	}), passhash, (e, account) => {
		if (e) return res.render('error', {
			error: e,
			action: 'register',
		});

		passport.authenticate('local');
		return res.redirect('/');
	});
});

r.post('/login', passport.authenticate('local'), (req, res) => {
	return res.redirect('/');
});

r.get('/logout', (req, res) => {
	req.logout();
	return res.redirect('/');
});

module.exports = r;