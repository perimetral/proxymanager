const passport = require('passport');

const routers = {
	api: require('./api'),
	auth: require('./auth'),
};

const r = (app) => {
	app.use('/auth', routers.auth);
	app.use('/api', routers.api);

	app.get('/', (req, res) => {
		if (req.user) return res.render('home', {
			user: req.user,
		});
		return res.redirect('/auth');
	});

	app.get('*', (req, res, next) => {
		return res.status(404).render('error', {
			error: '404',
		});
	});

	return app;
};

module.exports = r;