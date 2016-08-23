const path = require('path');
const express = require('express');
let r = express.Router();

const authCheck = require('./authCheck');
const worker = require('../lib/worker');

r.post('/addProxies/text', authCheck, (req, res) => {
	let proxyList = req.body.proxyListText || req.query.proxyListText;
	worker.parse(proxyList);
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

r.post('/addProxies/web', authCheck, (req, res) => {
	let options = {
		url: (req.body.proxyListUrl || req.query.proxyListUrl),
	};
	let json = req.body.json || req.query.json;
	if (json) options['content-type'] = 'application/json';
	request.get(options, (e, response, body) => {
		if (e) return res.render('error', {
			error: e,
			action: '/api/addProxies/web',
		});
		if (response.statusCode != 200) return res.render('error', {
			error: new Error('Server failed with: ' + response.statusCode),
			action: '/api/addProxies/web',
		});
		worker.parse(body);
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
});

r.post('/remove', authCheck, (req, res) => {
	let id = req.body.proxyId || req.query.proxyId;
	worker.remove(id).then(() => {
		return res.json({
			success: true,
		});
	}).catch((e) => {
		return res.json({
			error: e,
			action: '/api/remove',
		});
	});
});

const getDataForConfigure = (user) => {
	return {
		user,
		'database nedb proxies': c('database nedb proxies'),
		'database nedb services': c('database nedb services'),
		'database nedb autocompaction interval': c('database nedb autocompaction interval'),
		'proxy splitter': c('proxy splitter'),
		'check interval': c('check interval'),
		'check url': c('check url'),
	};
};

r.post('/configure', authCheck, (req, res) => {
	let optionName = req.body.optionName || req.query.optionName;
	if (optionName === 'database nedb proxies') {
		let proxies = req.body.proxies || req.query.proxies;
		c('database nedb proxies', proxies || path.join(__dirname, '../db/proxies.ne'));
		worker.reloadProxiesDb();
		return res.render('configure', getDataForConfigure(req.user));
	} else if (optionName === 'database nedb services') {
		let services = req.body.services || req.query.services;
		c('database nedb services', services || path.join(__dirname, '../db/services.ne'));
		worker.reloadServicesDb();
		return res.render('configure', getDataForConfigure(req.user));
	} else if (optionName === 'database nedb autocompaction interval') {
		let acInterval = req.body.acInterval || req.query.acInterval;
		c('database nedb autocompaction interval', acInterval || (5 * 1000));
		worker.reloadProxiesDb();
		worker.reloadServicesDb();
		return res.render('configure', getDataForConfigure(req.user));
	} else if (optionName === 'proxy splitter') {
		let splitter = req.body.splitter || req.query.splitter;
		c('proxy splitter', splitter || '\n');
		return res.render('configure', getDataForConfigure(req.user));
	} else if (optionName === 'check url') {
		let checkurl = req.body.checkurl || req.query.checkurl;
		c('check url', checkurl || 'http://www.rhymezone.com/');
		return res.render('configure', getDataForConfigure(req.user));
	} else if (optionName === 'check interval') {
		let checkInterval = req.body.checkInterval || req.query.checkInterval;
		c('check interval', checkInterval || (60 * 1000));
		return res.render('configure', getDataForConfigure(req.user));
	};
});

r.post('/activate', authCheck, (req, res) => {
	let id = req.body.proxyId || req.query.proxyId;
	let port = req.body.port || req.query.port;
	try {
		worker.activate(id, port).then(() => {
			return worker.status();
		}).catch((e) => {
			return res.render('error', {
				error: e,
				action: '/api/activate',
			});
		}).then((data) => {
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
	} catch (e) {
		return res.render('error', {
			error: e,
			action: '/api/activate',
		});
	};
});

r.post('/stop', authCheck, (req, res) => {
	let id = req.body.proxyId || req.query.proxyId;
	worker.stop(id).then(() => {
		return res.json({
			success: true,
		});
	}).catch((e) => {
		return res.json({
			error: e,
			action: '/api/stop',
		})
	})
});

module.exports = r;