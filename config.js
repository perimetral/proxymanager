const config = {
	//	Where to store proxies
	'database filename': './db/data.ne',

	//	How often to compact database
	'database autocompaction interval': 5 * 1000,

	//	Symbol or symbols for splitting proxies in list
	'proxy splitter': '\n',

	//	Logger function
	'logger function': (...args) => {
		let timestamp = new Date();
		console.log('LOG', timestamp.toUTCString() + ': ', ...args);
	},

	//	How often to check for proxies availability
	'check interval': 60 * 1000,

	//	Which URL to use while checking
	'check url': 'http://www.rhymezone.com/',

	//	Port for listening for connections
	'listen port': 3000,
	'listen host': 'localhost',
};

module.exports = config;