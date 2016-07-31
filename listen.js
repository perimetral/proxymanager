global.c = require('./lib/configurator')({ initial: require('./config') });

const Nedb = require('nedb');
const proxy = require('http-proxy');
const request = require('request');
const cli = require('commander');

const db = new Nedb({
	filename: c('database filename'),
	autoload: true,
});
db.persistence.setAutocompactionInterval(c('database autocompaction interval'));

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
	target = (target || ('http://' + worker.host + ':' + worker.port));
	c('logger function')('USING ' + target + ' AS PROXY SERVER');
	let proxyServer = proxy.createProxyServer({ target }).listen(c('listen port'), c('listen host'), () => {
		console.log('listening on ' + c('listen port'));
	});
	proxyServer.on('proxyReq', (...args) => {
		c('logger function')('REQUEST', ...args);
	});
	proxyServer.on('proxyRes', (...args) => {
		c('logger function')('RESPONSE', ...args);
	});
});