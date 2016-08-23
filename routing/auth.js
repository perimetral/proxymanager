const passport = require('passport');
var Account = require('../lib/models/Account');
const authCheck = require('./authCheck');

const express = require('express');
let r = express.Router();

r.get('/', (req, res) => {
	if (req.user) return res.redirect('/');
	return res.render('login');
});

r.get('/changePassword', authCheck, (req, res) => {
	return res.render('changePassword', {
		user: req.user,
	});
});

r.post('/register', (req, res) => {
	let username = req.body.username;
	let passhash = req.body.password;

	Account.register(new Account({
		username,
	}), passhash, (e, account) => {
		if (e) return res.render('error', {
			error: e,
			action: '/auth/register',
		});

		passport.authenticate('local');
		return res.redirect('/');
	});
});

r.post('/login', passport.authenticate('local'), (req, res) => {
	return res.redirect('/');
});

r.post('/changePassword', authCheck, (req, res) => {
	let passhash = req.body.password;

	Account.findByUsername(req.user.username).then((user) => {
		if (user) {
			user.setPassword(passhash, (e, user) => {
				if (e) return res.render('error', {
					error: e,
					action: '/auth/changePassword',
				});
				user.save((e) => {
					if (e) return res.render('error', {
						error: e,
						action: '/auth/changePassword',
					});
					return res.redirect('/');
				});
			});
		} else res.redirect('/');
	});
});

r.get('/logout', authCheck, (req, res) => {
	req.logout();
	return res.redirect('/');
});

module.exports = r;