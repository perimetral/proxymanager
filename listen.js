global.c = require('./lib/configurator')({ initial: require('./config') });

const Nedb = require('nedb');
const proxy = require('http-proxy');
const request = require('request');

const db = new Nedb({
	filename: c('database filename'),
	autoload: true,
});
db.persistence.setAutocompactionInterval(c('database autocompaction interval'));

var target = '';

setInterval(() => {
	db.find({}, (e, result) => {
		if (e) throw new Error(e);
		if ((! result) || (! result.length)) return undefined;
		result.forEach((x, i, ar) => {
			request.get(x.host + ':' + x.port, (e, response, body) => {
				if (e || (! response)) db.remove({ host: x.host }, { multi: true}, (e, rmCount) => {
					if (e) throw new Error(e);
					c('logger function')(x.host + ':' + x.port + ' proxy removed from list');
				});
			});
		});
	});
}, c('check interval'));

db.find({}, (e, result) => {
	if (e) throw new Error(e);
	if ((! result) || (! result.length)) throw new Error('No proxies!');
	let worker = result[0];
	target = 'http://' + worker.host + ':' + worker.port;
	console.log(target);
	let proxyServer = proxy.createProxyServer({ target }).listen(c('listen port'), () => {
		console.log('listening on ' + c('listen port'));
	});
	proxyServer.on('proxyReq', (...args) => {
		c('logger function')(...args);
	});
});