const config = {
	'database nedb filename': './db/data.ne',
	'database nedb autocompaction interval': 5 * 1000,
	'database mongo url': 'mongodb://localhost:27017/proxymanager',

	'proxy splitter': '\n',

	'logger': (...args) => {
		let timestamp = new Date();
		console.log('LOG', timestamp.toUTCString() + ': ', ...args);
	},

	'check interval': 60 * 1000,
	'check url': 'http://www.rhymezone.com/',

	'listen host': 'localhost',
	'listen port': 3033,

	'server host': 'localhost',
	'server port': 3000,
	'server logger mode': 'dev',

	'paths static': './public',
	'paths views': './views',

	'session secret length': 512,
	'session ttl': 14 * 24 * 60 * 60,
};

module.exports = config;