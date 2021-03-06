const Nedb = require('nedb');
const request = require('request');
const proxy = require('http-proxy');

const Service = require('./models/Service');

var proxies = new Nedb({
	filename: c('database nedb proxies'),
	autoload: true,
});
proxies.persistence.setAutocompactionInterval(c('database nedb autocompaction interval'));
var services = new Nedb({
	filename: c('database nedb services'),
	autoload: true,
});
services.persistence.setAutocompactionInterval(c('database nedb autocompaction interval'));
services.find({}, (e, result) => {
	if (e) return log(e);
	let running = c('app status running');
	result.forEach((x, i, ar) => {
		running.push(x);	
	});
	c('app status running', running);
});

const w = {};

w.list = () => {
	return new Promise((go, stop) => {
		proxies.find({}, (e, result) => {
			if (e) return stop(e);
			result.forEach((x, i, ar) => {
				if (x.status == 200) result[i].available = true;
			});
			return go(result);
		});
	});
};

w.check = (host, port) => {
	return new Promise((go, stop) => {
		let url = ('http://' + host + ':' + port);
		let proxyRequest = request.defaults({ proxy: url });
		proxyRequest(c('check url'), { uri: c('check url') }, (e, res) => {
			if (e) return stop(-1, e);
			else if (res.statusCode != 200) return stop(res.statusCode, e);
			else return go();
		});
	});
};

w.remove = (_id) => {
	return new Promise((go, stop) => {
		proxies.remove({ _id }, { multi: true }, (e) => {
			if (e) return stop(e);
			return go();
		});
	});
};

const inserter = (host, port, status) => {
	return new Promise((go, stop) => {
		proxies.findOne({ host, port }, (e, result) => {
			if (e) return stop(e);
			if (result) return go();
			proxies.insert({
				host,
				port,
				status,
			}, (e, insCount) => {
				if (e) return stop(e);
				log(host + ':' + port + ' added to list');
				return go();
			});
		});
	});
};

const updater = (host, port) => {
	return new Promise((go, stop) => {
		w.check(host, port).then(() => {
			return inserter(host, port, 200);
		}).catch((status, e) => {
			return inserter(host, port, status);
		}).then(() => { return go();
		}).catch((e) => { return stop(e);
		});
	});
};

w.parse = (data) => {
	if (typeof data === 'object') {
		for (let i in data) updater(i, data[i]);
		return;
	};
	data = (data ? data.split(c('proxy splitter')) : []);
	data.forEach((x, i, ar) => {
		let xSplitted = x.split(':');
		updater(xSplitted[0], xSplitted[1]);
	});
};

w.reloadProxiesDb = () => {
	delete proxies;
	proxies = new Nedb({
		filename: c('database nedb proxies'),
		autoload: true,
	});
	proxies.persistence.setAutocompactionInterval(c('database nedb autocompaction interval'));
};

w.reloadServicesDb = () => {
	delete services;
	services = new Nedb({
		filename: c('database nedb services'),
		autoload: true,
	});
	services.persistence.setAutocompactionInterval(c('database nedb autocompaction interval'));
};

w.status = () => {
	return new Promise((go, stop) => {
		let workingProxies = [];
		proxies.find({}, (e, result) => {
			if (e) return stop(e);
			workingProxies = result.filter((x, i, ar) => {
				return (x.status == 200);
			});
			let running = [];
			c('app status running').forEach((x, i, ar) => {
				running.push({
					target: x.target,
					port: x.port,
					proxyId: x.proxyId,
				});
			});
			return go({
				running: (running.length ? running : undefined),
				workingProxies: (workingProxies.length ? workingProxies : undefined),
			});
		});
	});
};

w.activate = (_id, port) => {
	return new Promise((go, stop) => {
		proxies.findOne({ _id }, (e, result) => {
			if (e) return stop(e);
			if (! result) return stop(new Error('No such proxy!'));
			if (result.status != 200) return stop(new Error('Proxy is unavailable!'));
			let target = ('http://' + result.host + ':' + result.port);
			let service = new Service({
				services,
				target,
				port,
				proxyId: _id,
			});
			service.on('proxyReq', (data) => {
				io.emit('proxyReq', data);
			});
			service.on('proxyRes', (data) => {
				io.emit('proxyRes', data);
			});
			let running = c('app status running');
			running.push(service);
			c('app status running', running);
			return go();
		});
	});
};

w.stop = (proxyId) => {
	return new Promise((go, stop) => {
		let running = c('app status running');
		running = running.filter((x, i, ar) => {
			return (x.proxyId != proxyId);
		});
		c('app status running', running);
		services.remove({ proxyId }, { multi: true }, (e, rmCount) => {
			if (e) return stop(e);
			return go();
		});
	});
};

w.observe = (proxyId) => {
	return new Promise((go, stop) => {
		services.findOne({ proxyId }, (e, result) => {
			if (e) return stop(e);
			if (! result) return stop(new Error('No such service is running now!'));
			return go(result.journal);
		});
	});
};

module.exports = w;