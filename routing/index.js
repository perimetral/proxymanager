const passport = require('passport');
const authCheck = require('./authCheck');
const worker = require('../lib/worker');

const routers = {
	api: require('./api'),
	auth: require('./auth'),
};

const r = (app) => {
	app.use('/auth', routers.auth);
	app.use('/api', routers.api);

	app.get('/', authCheck, (req, res) => {
		worker.status().then((data) => {
			return res.render('engine', {
				user: req.user,
				running: data.running,
				workingProxies: data.workingProxies,
			});
		}).catch((e) => {
			return res.render('error', {
				error: e,
				action: '/',
			});
		});
	});

	app.get('/list', authCheck, (req, res) => {
		worker.list().then((data) => {
			return res.render('list', {
				user: req.user,
				data,
			});
		}).catch((e) => {
			return res.render('error', {
				error: e,
				action: '/list',
			});
		});
	});

	app.get('/configure', authCheck, (req, res) => {
		return res.render('configure', {
			user: req.user,
			'database nedb filename': c('database nedb filename'),
			'database nedb autocompaction interval': c('database nedb autocompaction interval'),
			'proxy splitter': c('proxy splitter'),
			'check interval': c('check interval'),
			'check url': c('check url'),
		});
	});

	app.get('*', (req, res, next) => {
		return res.status(404).render('error', {
			error: '404',
		});
	});

	return app;
};

module.exports = r;