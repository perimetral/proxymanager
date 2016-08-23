const path = require('path');
const util = require('util');

const config = {
	'database nedb proxies': path.join(__dirname, 'db/proxies.ne'),
	'database nedb services': path.join(__dirname, 'db/services.ne'),
	'database nedb autocompaction interval': 5 * 1000,
	'database mongo url': 'mongodb://localhost:27017/proxymanager',

	'proxy splitter': '\n',

	'clean logger': (...args) => {
		let timestamp = new Date();
		return util.format('LOG', timestamp.toUTCString() + ':', ...args);
	},
	'logger': (...args) => {
		console.log(config['clean logger'](...args));
	},

	'proxy modify response': (res) => {
		return res;
	},

	'check url': 'http://www.rhymezone.com/',
	'check interval': 60 * 1000,

	'listen host': 'localhost',
	'listen port': 3033,

	'server host': 'localhost',
	'server port': 3000,
	'server logger mode': 'dev',

	'paths static': path.join(__dirname, 'public'),
	'paths views': path.join(__dirname, 'views'),

	'session secret length': 512,
	'session ttl': 14 * 24 * 60 * 60,
};

module.exports = config;