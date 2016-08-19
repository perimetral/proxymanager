global.c = require('./lib/configurator')({ initial: require('./config') });
global.log = c('logger');

const Nedb = require('nedb');
const proxy = require('http-proxy');
const request = require('request');
const cli = require('commander');
const checker = require('./lib/checker');

const db = new Nedb({
	filename: c('database nedb filename'),
	autoload: true,
});
db.persistence.setAutocompactionInterval(c('database nedb autocompaction interval'));

var target = '';

cli.version('1.0.0').command('show').action(() => {
	db.find({}, (e, result) => {
		if (e) throw new Error(e);
		if ((! result) || (! result.length)) throw new Error('No proxies!');
		console.log(result);
	});
});
cli.command('use <host:port>').action((tuple) => {
	target = 'http://' + tuple;
});
cli.parse(process.argv);

const util = require('util');
util.inspect(cli);

setInterval(() => {
	db.find({}, (e, result) => {
		if (e) throw new Error(e);
		if ((! result) || (! result.length)) return undefined;
		result.forEach((x, i, ar) => {
			checker(x.host, x.port, c('check url')).then(() => {
				db.update({ host: x.host }, { $set: { available: true }, }, { multi: true }, (e, updCount) => {
					if (e) throw new Error(e);
					log(x.host + ':' + x.port + ' is now AVAILABLE');
				});
			}).catch((status, e) => {
				db.update({ host: x.host }, { $set: { available: false }, }, { multi: true }, (e, updCount) => {
					if (e) throw new Error(e);
					log(x.host + ':' + x.port + ' is now UNAVAILABLE');
				});
			});
		});
	});
}, c('check interval'));

db.find({}, (e, result) => {
	if (e) throw new Error(e);
	if ((! result) || (! result.length)) throw new Error('No proxies!');
	let available = result.filter((x, i, ar) => { return x.available });
	let worker = available[0];
	target = (target || ('http://' + worker.host + ':' + worker.port));
	log('USING ' + target + ' AS PROXY SERVER');
	let proxyServer = proxy.createProxyServer({ target }).listen(c('listen port'), c('listen host'), () => {
		console.log('listening on ' + c('listen port'));
	});
	proxyServer.on('proxyReq', (...args) => {
		log('REQUEST', ...args);
	});
	proxyServer.on('proxyRes', (...args) => {
		log('RESPONSE', ...args);
	});
});